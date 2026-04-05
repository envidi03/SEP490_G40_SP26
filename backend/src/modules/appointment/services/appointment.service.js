const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");

const PatientModel = require("../../../modules/patient/model/patient.model");
const AppointmentModel = require("./../models/appointment.model");
const { model: ServiceModel } = require("../../service/index");
const { service: DentisService } = require("../../treatment/index")

const emailService = require("../../../common/service/email.service");
const notificationService = require("../../notification/service/notification.service");

/**
 * get list appointment with pagination and filter
 * (
 * search: search by full_name, phone, email;
 * status: filter by status;
 * doctor_id: filter by doctor id;
 * lte_date: less than eq by date;
 * sort: sort by appointment_date;
 * page
 * limit
 * )
 */
const getListService = async (query, doctor_id, lte_date, gte_date) => {
    const context = "AppointmentService.getListService";
    try {
        logger.debug("Fetching list of appointments with query", {
            context: context,
            query: query,
            doctor_id: doctor_id,
            lte_date: lte_date,
            gte_date: gte_date
        });

        // 1. Lấy và chuẩn hóa các tham số
        const search = query.search?.trim();
        const statusFilter = query.status && query.status !== "all" ? query.status.toUpperCase() : null;
        const excludeStatuses = query.exclude_status
            ? query.exclude_status.toUpperCase().split(',')
            : [];
        const filterDoctorId = doctor_id || (query.doctor_id && query.doctor_id !== "all" ? query.doctor_id : null);
        const filterLteDate = lte_date || query.lte_date;
        const filterGteDate = gte_date || query.gte_date;
        const filterSpecificDate = query.appointment_date;

        const sortOrder = query.sort === "desc" ? -1 : 1;
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 5));
        const skip = (page - 1) * limit;

        // 2. Xây dựng điều kiện lọc (Match Condition)
        const matchCondition = {};

        // Lọc theo trạng thái (status)
        if (statusFilter) {
            matchCondition.status = statusFilter;
        } else if (excludeStatuses.length > 0) {
            matchCondition.status = { $nin: excludeStatuses };
        }

        // Lọc theo doctor_id (Ép kiểu về ObjectId)
        if (filterDoctorId) {
            matchCondition.doctor_id = new mongoose.Types.ObjectId(filterDoctorId);
        }

        // Nếu người dùng có truyền ít nhất 1 trong 2 tham số ngày
        if (filterLteDate || filterGteDate) {
            matchCondition.appointment_date = {}; // Khởi tạo object rỗng trước

            // 1. Xử lý ngày bắt đầu (Nếu có)
            if (filterGteDate) {
                const startOfDay = new Date(filterGteDate);
                startOfDay.setUTCHours(0, 0, 0, 0);
                matchCondition.appointment_date.$gte = startOfDay;
            }

            // 2. Xử lý ngày kết thúc (Nếu có)
            if (filterLteDate) {
                const endOfDay = new Date(filterLteDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                matchCondition.appointment_date.$lte = endOfDay;
            }
        }

        // --- BỔ SUNG: Lọc theo ngày cụ thể (appointment_date) ---
        if (filterSpecificDate) {
            const start = new Date(filterSpecificDate);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(filterSpecificDate);
            end.setUTCHours(23, 59, 59, 999);

            // Nếu dùng cả lte_date và appointment_date thì logic này sẽ ghi đè $lte của lte_date
            // Tuy nhiên trong thực tế trang Phụ tá sẽ dùng appointment_date.
            matchCondition.appointment_date = {
                $gte: start,
                $lte: end
            };
        }

        // Tìm kiếm (Search) theo tên, số điện thoại, email
        if (search) {
            const regexSearch = { $regex: search, $options: "i" };
            matchCondition.$or = [
                { full_name: regexSearch },
                { phone: regexSearch },
                { email: regexSearch }
            ];
        }

        // 3. Xây dựng Aggregation Pipeline
        const aggregatePipeline = [
            // BƯỚC 1 & 2: Lọc và Sắp xếp
            { $match: matchCondition },
            { $sort: { appointment_date: sortOrder } },

            // BƯỚC 3: Phân luồng (1 luồng đếm tổng, 1 luồng lấy data)
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },

                        // HIỆU NĂNG CAO: Chỉ Lookup thông tin bác sĩ cho các record của trang hiện tại
                        {
                            $lookup: {
                                from: "staffs", // Tên collection chứa Staff
                                localField: "doctor_id",
                                foreignField: "_id",
                                as: "doctor_info"
                            }
                        },
                        {
                            $addFields: {
                                doctor_info: { $arrayElemAt: ["$doctor_info", 0] }
                            }
                        },

                        // Lấy Tên và Avatar Bác sĩ từ bảng Profile
                        {
                            $lookup: {
                                from: "profiles",
                                localField: "doctor_info.profile_id",
                                foreignField: "_id",
                                as: "doctor_info.profile"
                            }
                        },
                        {
                            $addFields: {
                                "doctor_info.profile": { $arrayElemAt: ["$doctor_info.profile", 0] }
                            }
                        },

                        // Lookup thông tin các dịch vụ đã đặt và map thẳng tên dịch vụ vào book_service
                        {
                            $lookup: {
                                from: "services",
                                localField: "book_service.service_id",
                                foreignField: "_id",
                                as: "services_data"
                            }
                        },
                        {
                            $lookup: {
                                from: "sub_services",
                                localField: "book_service.sub_service_id",
                                foreignField: "_id",
                                as: "sub_services_data"
                            }
                        },
                        {
                            $addFields: {
                                book_service: {
                                    $map: {
                                        input: "$book_service",
                                        as: "bs",
                                        in: {
                                            $mergeObjects: [
                                                "$$bs",
                                                {
                                                    service_name: {
                                                        $let: {
                                                            vars: {
                                                                matchedService: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$services_data",
                                                                                cond: { $eq: ["$$this._id", "$$bs.service_id"] }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            },
                                                            in: "$$matchedService.service_name"
                                                        }
                                                    },
                                                    sub_service_name: {
                                                        $let: {
                                                            vars: {
                                                                matchedSub: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$sub_services_data",
                                                                                cond: { $eq: ["$$this._id", "$$bs.sub_service_id"] }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            },
                                                            in: "$$matchedSub.sub_service_name"
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },

                        // BƯỚC CUỐI: Dọn dẹp các field rác và bảo mật
                        {
                            $project: {
                                __v: 0,
                                "doctor_info.__v": 0,
                                "doctor_info.password": 0, // Che password nếu có
                                "doctor_info.profile.__v": 0,
                                services_data: 0,
                                sub_services_data: 0
                            }
                        }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];

        // 4. Thực thi truy vấn
        const result = await AppointmentModel.aggregate(aggregatePipeline);

        const appointments = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;

        return {
            data: appointments,
            pagination: {
                page: page,
                size: limit,
                totalItems: totalItems
            }
        };

    } catch (error) {
        logger.error("Error getting list of appointments", {
            context: context,
            message: error.message,
            stack: error.stack
        });
        throw new errorRes.InternalServerError(
            `An error occurred while fetching list of appointments: ${error.message}`
        );
    }
};

/*
    get list appointment of patient with pagination and filter
    (
        search: search by full_name, phone, email;
        status: filter by status;
        sort: sort by appointment_date;
        page
        limit
    )
    only get appointment with account_id
*/
const getListOfPatientService = async (query, account_id) => {
    try {
        logger.debug("Fetching list of patient appointments with query", {
            context: "AppointmentService.getListOfPatientService",
            query: query,
            account_id: account_id
        });

        // 1. Lấy và chuẩn hóa các tham số từ query
        const search = query.search?.trim();
        // Lấy status từ query.status (hoặc query.filter tùy cách bạn gọi URL, ở đây dùng query.status cho rõ ràng)
        const statusFilter = query.status ? query.status.toUpperCase() : null;
        const sortOrder = query.sort === "desc" ? -1 : 1;

        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 5));
        const skip = (page - 1) * limit;

        // 2. Tìm Hồ sơ Bệnh nhân (Patient) dựa vào account_id
        const patient = await PatientModel.findOne({ account_id: account_id });

        // Nếu tài khoản này chưa có hồ sơ bệnh nhân, trả về mảng rỗng ngay lập tức
        if (!patient) {
            logger.warn("Patient profile not found for this account", {
                context: "AppointmentService.getListOfPatientService",
                account_id: account_id
            });
            return {
                data: [],
                pagination: {
                    page: page,
                    size: limit,
                    totalItems: 0
                }
            };
        }

        // 3. Xây dựng điều kiện lọc (Match)
        // SỬA LỖI: Sử dụng patient._id thay vì account_id
        const matchCondition = {
            patient_id: patient._id
        };

        // Lọc theo trạng thái (status)
        if (statusFilter) {
            matchCondition.status = statusFilter;
        }

        // Tìm kiếm (Search) theo tên, số điện thoại, email
        if (search) {
            const regexSearch = { $regex: search, $options: "i" };
            matchCondition.$or = [
                { full_name: regexSearch },
                { phone: regexSearch },
                { email: regexSearch }
            ];
        }

        // 4. Xây dựng Aggregation Pipeline
        const aggregatePipeline = [
            { $match: matchCondition },

            // Sắp xếp theo thời gian tạo (createdAt) giảm dần để hiện cái mới nhất lên đầu
            { $sort: { createdAt: sortOrder } },

            // Phân trang
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },

                        // Lookup thông tin bác sĩ
                        {
                            $lookup: {
                                from: "staffs",
                                localField: "doctor_id",
                                foreignField: "_id",
                                as: "doctor_info"
                            }
                        },
                        {
                            $addFields: {
                                doctor_info: { $arrayElemAt: ["$doctor_info", 0] }
                            }
                        },

                        // Lookup Profile của bác sĩ
                        {
                            $lookup: {
                                from: "profiles",
                                localField: "doctor_info.profile_id",
                                foreignField: "_id",
                                as: "doctor_profile"
                            }
                        },
                        {
                            $addFields: {
                                "doctor_info.profile_id": { $arrayElemAt: ["$doctor_profile", 0] },
                                doctor_name: {
                                    $arrayElemAt: ["$doctor_profile.full_name", 0]
                                }
                            }
                        },
                        // Overwrite doctor_id với object thông tin bác sĩ (giống populate)
                        {
                            $addFields: {
                                doctor_id: "$doctor_info"
                            }
                        },

                        // Lookup thông tin các dịch vụ
                        {
                            $lookup: {
                                from: "services",
                                localField: "book_service.service_id",
                                foreignField: "_id",
                                as: "services_data"
                            }
                        },
                        {
                            $lookup: {
                                from: "sub_services",
                                localField: "book_service.sub_service_id",
                                foreignField: "_id",
                                as: "sub_services_data"
                            }
                        },
                        {
                            $addFields: {
                                book_service: {
                                    $map: {
                                        input: "$book_service",
                                        as: "bs",
                                        in: {
                                            $mergeObjects: [
                                                "$$bs",
                                                {
                                                    service_name: {
                                                        $let: {
                                                            vars: {
                                                                matchedService: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$services_data",
                                                                                cond: { $eq: ["$$this._id", "$$bs.service_id"] }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            },
                                                            in: "$$matchedService.service_name"
                                                        }
                                                    },
                                                    sub_service_name: {
                                                        $let: {
                                                            vars: {
                                                                matchedSub: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$sub_services_data",
                                                                                cond: { $eq: ["$$this._id", "$$bs.sub_service_id"] }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            },
                                                            in: "$$matchedSub.sub_service_name"
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },

                        {
                            $project: {
                                __v: 0,
                                services_data: 0,
                                sub_services_data: 0,
                                doctor_info: 0,
                                doctor_profile: 0
                            }
                        }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];

        // 5. Thực thi truy vấn
        const result = await AppointmentModel.aggregate(aggregatePipeline);

        const appointments = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;

        return {
            data: appointments,
            pagination: {
                page: page,
                size: limit,
                totalItems: totalItems
            }
        };

    } catch (error) {
        logger.error("Error getting list of patient appointments", {
            context: "AppointmentService.getListOfPatientService",
            message: error.message,
            stack: error.stack
        });
        throw new errorRes.InternalServerError(
            `An error occurred while fetching list of appointments: ${error.message}`
        );
    }
};

/*
    get appointment by appointmentId
*/
const getByIdService = async (id) => {
    const context = "AppointmentService.getByIdService";
    try {
        logger.debug("Fetching appointment by id", {
            context: context,
            appointmentId: id,
        });

        // --- 1. KIỂM TRA ĐỊNH DẠNG ID ---
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new errorRes.BadRequestError("Invalid Appointment ID format");
        }

        // --- 2. TRUY VẤN DỮ LIỆU ---
        const appointment = await AppointmentModel.findById(id)
            .populate("patient_id")
            .populate("book_service.service_id")
            .populate("book_service.sub_service_id")
            // 💡 POPULATE LỒNG NHAU (Lấy Bác sĩ -> Lấy tiếp Profile của Bác sĩ)
            .populate({
                path: "doctor_id", // Lấy thông tin Staff
                populate: {
                    path: "profile_id", // Từ Staff lấy tiếp sang Profile để có full_name, avatar...
                    select: "-__v" // Tùy chọn: ẩn các trường không cần thiết
                },
                select: "-password -__v" // Ẩn mật khẩu của Staff (nếu có)
            })
            .lean();

        // --- 3. KIỂM TRA TỒN TẠI ---
        if (!appointment) {
            logger.warn("Appointment not found", {
                context: context,
                appointmentId: id,
            });
            throw new errorRes.NotFoundError("Appointment not found");
        }

        logger.debug("Appointment fetched successfully", {
            context: context,
            appointmentId: id,
        });

        return appointment;

    } catch (error) {
        logger.error("Error getting appointment by id", {
            context: context,
            message: error.message,
            stack: error.stack,
        });

        if (error.statusCode) throw error;

        throw new errorRes.InternalServerError(
            `An error occurred while fetching appointment by id: ${error.message}`
        );
    }
};

/*
    get list appointment of patient with pagination and filter
    (
        search: search by full_name, phone, email;
        status: filter by status;
        sort: sort by appointment_date;
        filter_date: get all appointment greater than by date if null then greater than now
        page
        limit
    )
    only get appointment with account_id
*/
const getListOfPatientServiceWithDate = async (query, account_id) => {
    try {
        logger.debug("Fetching list of patient appointments with query", {
            context: "AppointmentService.getListOfPatientService",
            query: query,
            account_id: account_id,
        });

        // 1. Lấy và chuẩn hóa các tham số từ query
        const search = query.search?.trim();
        const statusFilter = query.status ? query.status.toUpperCase() : null;
        const sortOrder = query.sort === "desc" ? -1 : 1;

        // SỬA: Thêm cơ số 10 vào parseInt để đảm bảo an toàn
        const page = Math.max(1, parseInt(query.page || 1, 10));
        const limit = Math.max(1, parseInt(query.limit || 5, 10));
        const skip = (page - 1) * limit;

        // 2. Tìm Hồ sơ Bệnh nhân (Patient) dựa vào account_id
        const patient = await PatientModel.findOne({ account_id: account_id }).lean();

        if (!patient) {
            logger.warn("Patient profile not found for this account", {
                context: "AppointmentService.getListOfPatientService",
                account_id: account_id,
            });
            return {
                data: [],
                pagination: { page, size: limit, totalItems: 0 },
            };
        }

        // 3. Xây dựng điều kiện lọc (Match)
        const matchCondition = {
            patient_id: patient._id,
        };

        // Lọc theo trạng thái
        if (statusFilter) {
            matchCondition.status = statusFilter;
        }

        // SỬA & BỔ SUNG: Logic cho filter_date (Lớn hơn ngày truyền vào hoặc lớn hơn hiện tại)
        let dateToFilter = new Date(); // Mặc định là 'now'
        if (query.filter_date) {
            dateToFilter = new Date(query.filter_date);
        }
        dateToFilter.setUTCHours(0, 0, 0, 0);

        logger.debug("filter date.", {
            context: "getListOfPatientServiceWithDate",
            data: dateToFilter
        })
        // Giả sử trường lưu thời gian hẹn trong DB của bạn là appointment_date
        matchCondition.appointment_date = { $gte: dateToFilter };

        // Tìm kiếm (Search) theo tên, số điện thoại, email
        if (search) {
            // Escape các ký tự đặc biệt trong regex để tránh lỗi (Optional nhưng khuyên dùng)
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regexSearch = { $regex: safeSearch, $options: "i" };
            matchCondition.$or = [
                { full_name: regexSearch },
                { phone: regexSearch },
                { email: regexSearch },
            ];
        }

        // 4. Xây dựng Aggregation Pipeline
        const aggregatePipeline = [
            { $match: matchCondition },

            // SỬA: Sắp xếp theo appointment_date theo như comment yêu cầu
            { $sort: { appointment_date: sortOrder } },

            // Phân trang và Lookup
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },

                        // Lookup thông tin bác sĩ
                        {
                            $lookup: {
                                from: "staffs",
                                localField: "doctor_id",
                                foreignField: "_id",
                                as: "doctor_info",
                            },
                        },
                        {
                            $addFields: {
                                doctor_info: { $arrayElemAt: ["$doctor_info", 0] },
                            },
                        },

                        // Lookup Profile của bác sĩ
                        {
                            $lookup: {
                                from: "profiles",
                                localField: "doctor_info.profile_id",
                                foreignField: "_id",
                                as: "doctor_profile",
                            },
                        },
                        {
                            $addFields: {
                                "doctor_info.profile_id": {
                                    $arrayElemAt: ["$doctor_profile", 0],
                                },
                                doctor_name: {
                                    $arrayElemAt: ["$doctor_profile.full_name", 0],
                                },
                                // Đưa thẳng object vào doctor_id
                                doctor_id: "$doctor_info"
                            },
                        },

                        // Lookup thông tin các dịch vụ
                        {
                            $lookup: {
                                from: "services",
                                localField: "book_service.service_id",
                                foreignField: "_id",
                                as: "services_data",
                            },
                        },
                        {
                            $lookup: {
                                from: "sub_services",
                                localField: "book_service.sub_service_id",
                                foreignField: "_id",
                                as: "sub_services_data",
                            },
                        },
                        {
                            $addFields: {
                                book_service: {
                                    $map: {
                                        input: "$book_service",
                                        as: "bs",
                                        in: {
                                            $mergeObjects: [
                                                "$$bs",
                                                {
                                                    service_name: {
                                                        $let: {
                                                            vars: {
                                                                matchedService: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$services_data",
                                                                                cond: { $eq: ["$$this._id", "$$bs.service_id"] },
                                                                            },
                                                                        },
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                            in: "$$matchedService.service_name",
                                                        },
                                                    },
                                                    sub_service_name: {
                                                        $let: {
                                                            vars: {
                                                                matchedSub: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$sub_services_data",
                                                                                cond: { $eq: ["$$this._id", "$$bs.sub_service_id"] },
                                                                            },
                                                                        },
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                            in: "$$matchedSub.sub_service_name",
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        },

                        {
                            $project: {
                                __v: 0,
                                services_data: 0,
                                sub_services_data: 0,
                                doctor_info: 0,
                                doctor_profile: 0,
                            },
                        },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];

        // 5. Thực thi truy vấn
        const result = await AppointmentModel.aggregate(aggregatePipeline);

        const appointments = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;

        return {
            data: appointments,
            pagination: {
                page: page,
                size: limit,
                totalItems: totalItems,
            },
        };
    } catch (error) {
        logger.error("Error getting list of patient appointments", {
            context: "AppointmentService.getListOfPatientService",
            message: error.message,
            stack: error.stack,
        });
        // Tránh việc vứt thẳng raw error.message cho client ở môi trường production
        throw new errorRes.InternalServerError(
            `An error occurred while fetching list of appointments: ${error.message}`,
        );
    }
};

const createService = async (dataCreate, account_id) => {
    // 1. KHỞI TẠO TRANSACTION SESSION
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        logger.debug("raw data to create", {
            context: "appointmentService.createService",
            dataCreate: dataCreate,
            account_id: account_id // Sửa lại lỗi type account_id ở đây
        });

        // Tìm Patient profile từ account_id của user đang đăng nhập
        const patient = await PatientModel.findOne({ account_id: account_id }).session(session);
        if (!patient) {
            logger.warn("Patient not found", {
                context: "appointmentService.createService",
                account_id: account_id,
                patient: patient
            });
            throw new errorRes.NotFoundError("No patient records were found linked to this account. Please update your records.");
        }
        dataCreate.patient_id = patient._id;

        // check duplicate appointment
        const duplicateQuery = {
            full_name: dataCreate.full_name,
            phone: dataCreate.phone,
            email: dataCreate.email,
            appointment_date: dataCreate.appointment_date,
            appointment_time: dataCreate.appointment_time,
            status: { $nin: ['CANCELLED', 'NO_SHOW'] }
        };
        const isDuplicatePatient = await AppointmentModel.findOne(duplicateQuery).session(session);
        if (isDuplicatePatient) {
            throw new Error(`Patient ${dataCreate.full_name} already has an appointment scheduled for ${dataCreate.appointment_time}. Please do not book a duplicate appointment.`);
        }

        // check id service
        if (dataCreate.book_service && Array.isArray(dataCreate.book_service)) {
            for (const service of dataCreate.book_service) {
                const [serviceExist, subServiceExist] = await Promise.all([
                    ServiceModel.findById(service.service_id).session(session),
                    service.sub_service_id ? mongoose.model("SubService").findById(service.sub_service_id).session(session) : Promise.resolve(true)
                ]);

                if (!serviceExist) {
                    throw new errorRes.NotFoundError(`Service not found! ID: ${service.service_id}`);
                }
                if (!subServiceExist) {
                    throw new errorRes.NotFoundError(`Sub-service not found! ID: ${service.sub_service_id}`);
                }
            }
        }

        // 2. TẠO LỊCH HẸN MỚI (TRONG TRANSACTION)
        const { treatment_id, ...rest } = dataCreate;

        // Lưu ý: Dùng create với session yêu cầu truyền vào mảng []
        const [newAppointment] = await AppointmentModel.create([rest], { session });

        // 3. CẬP NHẬT TREATMENT (TRONG TRANSACTION)
        if (treatment_id) {
            // Truyền `session` vào hàm này để đảm bảo cùng 1 transaction
            await DentisService.treatment.addAppointmentIdOnTreatment(treatment_id, newAppointment._id, session);
        }

        // 4. CHỐT GIAO DỊCH (Lưu vĩnh viễn vào DB)
        await session.commitTransaction();
        session.endSession();

        // ==========================================================
        // CHỈ GỬI EMAIL VÀ THÔNG BÁO SAU KHI GIAO DỊCH ĐÃ THÀNH CÔNG
        // ==========================================================

        // --- 5. GỬI EMAIL XÁC NHẬN ĐẶT LỊCH (Fire and Forget) ---
        if (newAppointment.email) {
            const formattedDate = new Date(newAppointment.appointment_date).toLocaleDateString('vi-VN');
            emailService.sendBookingConfirmationEmail(
                newAppointment.email,
                newAppointment.full_name,
                formattedDate,
                newAppointment.appointment_time
            ).catch(err => logger.error("Lỗi gửi email đặt lịch:", { message: err.message }));
        }

        // --- 6. GỬI THÔNG BÁO NỘI BỘ (In-app Notification) ---
        const formattedDateNoti = new Date(newAppointment.appointment_date).toLocaleDateString('vi-VN');
        const appointmentTime = newAppointment.appointment_time;
        const patientName = newAppointment.full_name;

        // Gửi cho Lễ tân và Admin
        notificationService.sendToRole(['receptionist', 'admin'], {
            type: 'NEW_APPOINTMENT',
            title: 'Lịch hẹn mới',
            message: `Lịch hẹn mới: ${patientName} vào lúc ${appointmentTime} ngày ${formattedDateNoti}`,
            action_url: `/receptionist/appointments?id=${newAppointment._id}`,
            metadata: {
                entity_id: newAppointment._id,
                entity_type: 'APPOINTMENT'
            }
        }).catch(err => logger.error("Lỗi gửi thông báo cho nhân viên:", err.message));

        // Gửi cho Bệnh nhân (in_app + zalo)
        notificationService.sendToUser(account_id, {
            type: 'NEW_APPOINTMENT',
            title: 'Đặt lịch thành công',
            message: `Đặt lịch thành công! Lịch hẹn của bạn vào lúc ${appointmentTime} ngày ${formattedDateNoti} đã được ghi nhận.`,
            action_url: `/patient/appointments`,
            metadata: {
                entity_id: newAppointment._id,
                entity_type: 'APPOINTMENT'
            },
            channels: {
                in_app: { enabled: true },
                zalo: { enabled: true },
                email: { enabled: true }
            }
        }).catch(err => logger.error("Lỗi gửi thông báo cho bệnh nhân:", err.message));

        return newAppointment;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error("Error at create new appointment.", {
            message: error.message,
            stack: error.stack,
        });
        if (error.statusCode) {
            throw error;
        }
        throw new errorRes.InternalServerError(`Error: ${error.message}`);
    }
};

const staffCreateService = async (dataCreate) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        logger.debug("Raw data to create", {
            context: "AppointmentService.staffCreateService",
            dataCreate: dataCreate,
        });

        // 1. Check duplicate appointment
        const duplicateQuery = {
            full_name: dataCreate.full_name,
            phone: dataCreate.phone,
            appointment_date: dataCreate.appointment_date,
            appointment_time: dataCreate.appointment_time,
            status: { $nin: ['CANCELLED', 'NO_SHOW', 'COMPLETED'] }
        };
        const isDuplicatePatient = await AppointmentModel.findOne(duplicateQuery).session(session);
        if (isDuplicatePatient) {
            throw new errorRes.ConflictError(`Patient ${dataCreate.full_name} already has an appointment scheduled for ${dataCreate.appointment_time}.`);
        }

        // 2. Check valid services
        if (dataCreate.book_service && Array.isArray(dataCreate.book_service)) {
            for (const service of dataCreate.book_service) {
                const [serviceExist, subServiceExist] = await Promise.all([
                    ServiceModel.findById(service.service_id).session(session),
                    service.sub_service_id ? mongoose.model("SubService").findById(service.sub_service_id).session(session) : Promise.resolve(true)
                ]);

                if (!serviceExist) {
                    logger.warn(`ID service not found: ${service.service_id}`, {
                        context: "AppointmentService.staffCreateService",
                        service_id: service.service_id
                    });
                    throw new errorRes.NotFoundError(`Service not found! ID: ${service.service_id}`);
                }

                if (!subServiceExist) {
                    logger.warn(`ID sub-service not found: ${service.sub_service_id}`, {
                        context: "AppointmentService.staffCreateService",
                        sub_service_id: service.sub_service_id
                    });
                    throw new errorRes.NotFoundError(`Sub-service not found! ID: ${service.sub_service_id}`);
                }
            }
        }

        // 3. Hỗ trợ cấp STT nếu lễ tân tạo lịch hẹn đến thẳng phòng khám
        if (dataCreate.status === "CHECKED_IN") {
            const nextNumber = await AppointmentModel.getNextQueueNumber(dataCreate.appointment_date);
            dataCreate.queue_number = nextNumber;
        }

        const { treatment_id, ...rest } = dataCreate;
        if (treatment_id) {
            rest.status = "SCHEDULED";
        }
        logger.debug("data create appointment", {
            contex: "AppointmentService.staffCreateService",
            data: rest,
        })
        const [newAppointment] = await AppointmentModel.create([rest], { session });
        logger.debug("data after create appointment", {
            contex: "AppointmentService.staffCreateService",
            data: newAppointment,
        })
        if (treatment_id) {
            await DentisService.treatment.addAppointmentIdOnTreatment(treatment_id, newAppointment._id, session);
        }

        await session.commitTransaction();
        session.endSession();

        return newAppointment;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        logger.error("Error at staff create new appointment.", {
            context: "AppointmentService.staffCreateService",
            message: error.message,
            stack: error.stack,
        });

        // Đã sửa để ném ra đúng HTTP Status (Ví dụ: 409 Conflict, 404 Not Found)
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`Error: ${error.message}`);
    }
};

const updateService = async (id, data) => {
    try {
        const { userRole, ...updateFields } = data;

        // Chỉ cho phép update các trường liên quan đến lịch khám
        const allowedUpdates = {};
        if (updateFields.appointment_date) allowedUpdates.appointment_date = updateFields.appointment_date;
        if (updateFields.appointment_time) allowedUpdates.appointment_time = updateFields.appointment_time;
        if (updateFields.reason !== undefined) allowedUpdates.reason = updateFields.reason;

        // Tìm lịch hẹn hiện tại
        const existingAppt = await AppointmentModel.findById(id);
        if (!existingAppt) {
            throw new errorRes.NotFoundError("Appointment not found");
        }

        // Tùy chọn: Thêm kiểm tra trạng thái, chỉ lịch SCHEDULED mới được sửa
        if (existingAppt.status !== "SCHEDULED" && existingAppt.status !== "PENDING_CONFIRMATION") {
            throw new errorRes.BadRequestError("Only SCHEDULED or PENDING_CONFIRMATION appointments can be updated");
        }

        // LOGIC MỚI: Nếu là Bệnh nhân cập nhật, chuyển trạng thái sang PENDING_CONFIRMATION
        if (userRole === "PATIENT") {
            allowedUpdates.status = "PENDING_CONFIRMATION";
        }

        // Cập nhật
        const updatedAppt = await AppointmentModel.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true } // trả về document sau khi update
        ).lean();

        // GỬI THÔNG BÁO KHI BỆNH NHÂN CẬP NHẬT
        if (userRole === "PATIENT" && updatedAppt) {
            const formattedDate = new Date(updatedAppt.appointment_date).toLocaleDateString('vi-VN');

            // 1. Thông báo cho LỄ TÂN qua WebSocket (real-time)
            notificationService.sendToRole(['RECEPTIONIST'], {
                type: 'APPOINTMENT_UPDATE_REQUESTED',
                title: 'Yêu cầu đổi lịch khám',
                message: `Bệnh nhân ${updatedAppt.full_name} yêu cầu đổi lịch sang ${updatedAppt.appointment_time} ngày ${formattedDate}`,
                action_url: `/receptionist/appointments?id=${updatedAppt._id}`,
                metadata: {
                    entity_id: updatedAppt._id,
                    entity_type: 'APPOINTMENT'
                }
            }).catch(err => logger.error("Lỗi gửi thông báo cập nhật cho lễ tân:", err.message));

            // 2. Thông báo xác nhận cho BỆNH NHÂN (real-time qua WebSocket)
            if (updatedAppt.patient_id) {
                const patient = await PatientModel.findById(updatedAppt.patient_id).select('account_id').lean();
                if (patient?.account_id) {
                    notificationService.sendToUser(patient.account_id.toString(), {
                        type: 'APPOINTMENT_UPDATE_CONFIRMED',
                        title: 'Yêu cầu đổi lịch đã được gửi',
                        message: `Yêu cầu đổi lịch sang ${updatedAppt.appointment_time} ngày ${formattedDate} đã được gửi. Vui lòng chờ lễ tân xác nhận.`,
                        action_url: '/appointments',
                        metadata: {
                            entity_id: updatedAppt._id,
                            entity_type: 'APPOINTMENT'
                        }
                    }).catch(err => logger.error("Lỗi gửi thông báo xác nhận cho bệnh nhân:", err.message));
                }
            }
        } else if (userRole !== "PATIENT" && updatedAppt && updatedAppt.patient_id) {
            // LỄ TÂN/PHÒNG KHÁM CẬP NHẬT TRỰC TIẾP
            // Kiểm tra xem có thực sự đổi ngày giờ không
            if (allowedUpdates.appointment_date || allowedUpdates.appointment_time) {
                try {
                    const patient = await PatientModel.findById(updatedAppt.patient_id).select('account_id email').lean();
                    const account = patient?.account_id
                        ? await AuthModel.Account.findById(patient.account_id).select('email').lean()
                        : null;
                    const patientEmail = account?.email || updatedAppt.email || patient?.email;

                    const oldDateStr = new Date(existingAppt.appointment_date).toLocaleDateString('vi-VN');
                    const newDateStr = new Date(updatedAppt.appointment_date).toLocaleDateString('vi-VN');

                    // 1. Gửi Email thông báo dời lịch
                    emailService.sendAppointmentRescheduledByClinicEmail(
                        patientEmail,
                        updatedAppt.full_name,
                        oldDateStr,
                        existingAppt.appointment_time,
                        newDateStr,
                        updatedAppt.appointment_time
                    ).catch(err => logger.error('Lỗi gửi email đổi lịch:', err.message));

                    // 2. Gửi thông báo In-app
                    if (patient?.account_id) {
                        notificationService.sendToUser(patient.account_id.toString(), {
                            type: 'APPOINTMENT_RESCHEDULED_BY_CLINIC',
                            title: 'Lịch hẹn đã được thay đổi',
                            message: `Lịch hẹn của bạn tại phòng khám đã được dời sang ${updatedAppt.appointment_time} ngày ${newDateStr}.`,
                            action_url: '/appointments',
                            metadata: { entity_id: updatedAppt._id, entity_type: 'APPOINTMENT' }
                        }).catch(err => logger.error('Lỗi gửi thông báo đổi lịch cho bệnh nhân:', err.message));
                    }
                } catch (notifyErr) {
                    logger.error('Lỗi xử lý thông báo dời lịch của phòng khám:', notifyErr);
                }
            }
        }

        return updatedAppt;

    } catch (error) {
        logger.error("Error updating appointment service", {
            context: "AppointmentService.updateService",
            message: error.message,
            stack: error.stack,
        });

        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`Update fails: ${error.message}`);
    }
};

/*
    Update Status and Auto-generate Queue Number
*/
const updateStatusOnly = async (id, status, doctorId = null) => {
    try {
        // Lấy thông tin lịch hẹn TRƯỚC khi cập nhật để biết trạng thái cũ
        const oldAppt = await AppointmentModel.findById(id).lean();
        if (!oldAppt) {
            throw new errorRes.NotFoundError("Appointment not found");
        }

        let newData = null;

        // --- KỊCH BẢN 1: BỆNH NHÂN CHECK-IN TẠI QUẦY ---
        if (status === "CHECKED_IN") {
            // Bảo vệ API (Idempotent): Nếu khách ấn Check-in 2 lần liên tiếp, 
            // hoặc đã có số rồi thì không cấp số mới, trả về kết quả luôn.
            if (oldAppt.status === "CHECKED_IN" && oldAppt.queue_number) {
                return oldAppt;
            }

            // Bước 2: Gọi hàm sinh số thứ tự thông minh từ Model
            const nextNumber = await AppointmentModel.getNextQueueNumber(oldAppt.appointment_date);

            // Bước 3: Cập nhật ĐỒNG THỜI cả trạng thái và số thứ tự
            newData = await AppointmentModel.findByIdAndUpdate(
                id,
                {
                    status: status,
                    queue_number: nextNumber
                },
                { new: true } // Trả về object sau khi đã update xong
            );

            // Gửi thông báo In-App cho Bác sĩ phụ trách
            if (newData && newData.doctor_id) {
                try {
                    await notificationService.sendToUser(newData.doctor_id, {
                        type: 'PATIENT_CHECKED_IN',
                        title: 'Bệnh nhân mới vào hàng đợi',
                        message: `Bệnh nhân ${newData.full_name} đã check-in và bắt đầu chờ ở phòng khám. (STT: ${nextNumber})`,
                        action_url: `/treatments?appointment_id=${newData._id}`
                    });
                } catch (err) {
                    logger.error("Lỗi gửi thông báo check-in cho Bác sĩ:", { message: err.message });
                }
            }
        }

        // --- KỊCH BẢN 2: CÁC TRẠNG THÁI KHÁC (SCHEDULED, IN_CONSULTATION, COMPLETED, CANCELLED...) ---
        else {
            const updateData = { status: status };
            if (doctorId) {
                updateData.doctor_id = doctorId;
            }
            newData = await AppointmentModel.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );


            // Gửi thông báo In-App nếu Lịch hẹn bị Khách hàng hoặc Lễ tân hủy / Bệnh nhân không đến
            if ((status === "CANCELLED" || status === "NO_SHOW") && newData) {
                try {
                    const formattedDate = new Date(newData.appointment_date).toLocaleDateString('vi-VN');

                    // Gửi thông báo cho Lễ Tân (vẫn giữ nguyên logic cũ cho CANCELLED)
                    if (status === "CANCELLED") {
                        await notificationService.sendToRole(['RECEPTIONIST'], {
                            type: 'APPOINTMENT_CANCELLED',
                            title: 'Lịch hẹn đã bị hủy',
                            message: `Bệnh nhân ${newData.full_name} đã hủy lịch hẹn lúc ${newData.appointment_time} ngày ${formattedDate}.`,
                            action_url: `/appointments/${newData._id}`
                        });
                    }

                    // Gửi thông báo cho Bác sĩ (ca khám sắp tới bị hủy hoặc no show)
                    if (newData.doctor_id) {
                        const statusMessage = status === "NO_SHOW" ? "không đến khám" : "đã hủy/bị hủy lịch khám";
                        await notificationService.sendToUser(newData.doctor_id, {
                            type: 'APPOINTMENT_CANCELLED_DOCTOR',
                            title: `Lịch khám bị hủy / Không đến`,
                            message: `Ca khám của bệnh nhân ${newData.full_name} (lúc ${newData.appointment_time} ngày ${formattedDate}) ${statusMessage}.`,
                            action_url: `/appointments/${newData._id}`
                        });
                    }

                    // Kiểm tra cảnh báo bất thường số lượng hủy lịch (ADMIN_CLINIC)
                    if (status === "CANCELLED") {
                        const now = new Date();
                        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                        const cancelCount = await AppointmentModel.countDocuments({
                            status: "CANCELLED",
                            updatedAt: { $gte: startOfDay, $lte: endOfDay }
                        });

                        // Cảnh báo nếu chạm mốc 10, 20, 30... ca hủy
                        if (cancelCount > 0 && cancelCount % 10 === 0) {
                            await notificationService.sendToRole(['ADMIN_CLINIC'], {
                                type: 'HIGH_CANCELLATION_RATE',
                                title: 'Cảnh báo khẩn: Hủy lịch tăng vọt',
                                message: `Hệ thống ghi nhận có ${cancelCount} ca hủy lịch khám trong ngày hôm nay. Vui lòng kiểm tra lại tình hình.`,
                                action_url: `/appointments`
                            });
                        }
                    }
                } catch (err) {
                    logger.error("Lỗi gửi thông báo hủy lịch/khách không đến:", { message: err.message });
                }
            }
        }

        // --- KIỂM TRA LẠI KẾT QUẢ ---
        if (!newData) {
            throw new errorRes.NotFoundError("Appointment not found or update failed");
        }

        // --- GỬI EMAIL + THÔNG BÁO KHI LỄ TÂN XỬ LÝ YÊU CẦU ĐỔI LỊCH ---
        // Duyệt: PENDING_CONFIRMATION -> SCHEDULED 
        const isApproved = oldAppt.status === 'PENDING_CONFIRMATION' && status === 'SCHEDULED';
        // Từ chối: PENDING_CONFIRMATION -> CANCELLED (hoặc bất kỳ ai hủy lịch)
        const isRejected = oldAppt.status === 'PENDING_CONFIRMATION' && status === 'CANCELLED';
        // Hủy lịch thông thường (nếu muốn gửi mail cả khi hủy lịch thường)
        const isGeneralCancel = status === 'CANCELLED';

        if ((isApproved || isGeneralCancel) && newData.patient_id) {
            try {
                // Lấy email từ account hoặc profile hoặc appointment
                const patient = await PatientModel.findById(newData.patient_id).select('account_id email').lean();
                const account = patient?.account_id
                    ? await AuthModel.Account.findById(patient.account_id).select('email').lean()
                    : null;

                const patientEmail = account?.email || newData.email || patient?.email;
                const formattedDate = new Date(newData.appointment_date).toLocaleDateString('vi-VN');

                if (isApproved) {
                    // 1. Gửi Email xác nhận
                    emailService.sendAppointmentUpdateApprovedEmail(patientEmail, newData.full_name, formattedDate, newData.appointment_time)
                        .catch(err => logger.error('Lỗi gửi email xác nhận lịch:', err.message));

                    // 2. Gửi thông báo in-app (WebSocket)
                    if (patient?.account_id) {
                        notificationService.sendToUser(patient.account_id.toString(), {
                            type: 'APPOINTMENT_UPDATE_CONFIRMED',
                            title: 'Lịch hẹn đã được xác nhận',
                            message: `Yêu cầu đổi lịch sang ${newData.appointment_time} ngày ${formattedDate} đã được phòng khám xác nhận.`,
                            action_url: '/appointments',
                            metadata: { entity_id: newData._id, entity_type: 'APPOINTMENT' },
                            channels: {
                                in_app: { enabled: true },
                                zalo: { enabled: true }
                            }
                        }).catch(err => logger.error('Lỗi gửi thông báo xác nhận cho bệnh nhân:', err.message));
                    }
                } else if (isGeneralCancel) {
                    // GỬI EMAIL THÔNG BÁO HỦY/TỪ CHỐI
                    if (isRejected) {
                        // Trường hợp đặc biệt: Từ chối yêu cầu đổi lịch
                        emailService.sendAppointmentUpdateRejectedEmail(patientEmail, newData.full_name, formattedDate, newData.appointment_time)
                            .catch(err => logger.error('Lỗi gửi email từ chối đổi lịch:', err.message));
                    } else {
                        // Trường hợp hủy lịch thông thường
                        emailService.sendAppointmentCancelledEmail(patientEmail, newData.full_name, formattedDate, newData.appointment_time)
                            .catch(err => logger.error('Lỗi gửi email hủy lịch:', err.message));
                    }

                    if (patient?.account_id) {
                        const notifyTitle = isRejected ? 'Yêu cầu đổi lịch không được chấp nhận' : 'Lịch hẹn đã bị hủy';
                        const notifyMsg = isRejected
                            ? `Yêu cầu đổi lịch sang ${newData.appointment_time} ngày ${formattedDate} chưa phù hợp. Vui lòng đặt lịch khác.`
                            : `Lịch hẹn khám của bạn vào khung giờ ${newData.appointment_time} ngày ${formattedDate} đã bị hủy.`;

                        notificationService.sendToUser(patient.account_id.toString(), {
                            type: 'APPOINTMENT_UPDATE_REJECTED',
                            title: notifyTitle,
                            message: notifyMsg,
                            action_url: '/appointments',
                            metadata: { entity_id: newData._id, entity_type: 'APPOINTMENT' },
                            channels: {
                                in_app: { enabled: true },
                                zalo: { enabled: true }
                            }
                        }).catch(err => logger.error('Lỗi gửi thông báo hủy cho bệnh nhân:', err.message));
                    }
                }
            } catch (notifyErr) {
                logger.error('Lỗi xử lý thông báo/email cho bệnh nhân:', notifyErr);
            }
        }

        return newData;

    } catch (error) {
        logger.error("Error updating appointment status.", {
            context: "AppointmentService.updateStatusOnly",
            appointmentId: id,
            status: status,
            message: error.message
        });

        // Ném tiếp các lỗi đã được định nghĩa (ví dụ: NotFoundError)
        if (error.statusCode) throw error;

        // Bắt các lỗi hệ thống (Database lỗi, rớt mạng...)
        throw new errorRes.InternalServerError(`Update fails: ${error.message}`);
    }
};

const checkinService = async (data) => {
    try {
        // 1. TẠO MỐC THỜI GIAN CỦA NGÀY HÔM NAY (Từ 00:00 đến 23:59)
        const today = new Date(); // Lấy ngày giờ hiện tại
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // 2. TÌM TẤT CẢ CÁC LỊCH HẸN TRONG HÔM NAY (Cho phép cả lịch chưa khám và lịch đến muộn)
        const appointments = await AppointmentModel.find({
            full_name: data.full_name,
            phone: data.phone,
            status: { $in: ["SCHEDULED", "NO_SHOW"] },
            appointment_date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ appointment_time: 1 });

        // Nếu không có lịch nào trong hôm nay
        if (!appointments || appointments.length === 0) {
            throw new errorRes.NotFoundError("You do not have any scheduled appointments for TODAY. Please check the date or contact the receptionist.");
        }

        const checkedInResults = [];

        // 3. LẶP QUA TỪNG LỊCH TRONG HÔM NAY ĐỂ CẤP SỐ & CHECK-IN
        for (const appt of appointments) {
            // Sinh số thứ tự cho từng lịch (Vì có thể khám ở nhiều phòng/dịch vụ khác nhau)
            const nextNumber = await AppointmentModel.getNextQueueNumber(appt.appointment_date);

            const updatedAppt = await AppointmentModel.findByIdAndUpdate(
                appt._id,
                {
                    status: "CHECKED_IN",
                    queue_number: nextNumber
                },
                { new: true }
            );

            checkedInResults.push(updatedAppt);

            // GỬI EMAIL THÔNG BÁO CHO KHÁCH HÀNG
            if (updatedAppt.email) {
                emailService.sendCheckinEmail(
                    updatedAppt.email,
                    updatedAppt.full_name,
                    updatedAppt.queue_number,
                ).catch(err => logger.error("Lỗi gửi email check-in:", err.message));
            }
        }

        logger.info(`Patient self check-in successful for ${checkedInResults.length} appointments`, {
            context: "AppointmentService.checkinService",
            phone: data.phone
        });

        // 4. TRẢ VỀ MẢNG CÁC LỊCH ĐÃ CHECK-IN ĐỂ HIỂN THỊ LÊN MÀN HÌNH
        return checkedInResults;

    } catch (error) {
        logger.error("Error at checkinService", {
            context: "AppointmentService.checkinService",
            message: error.message,
            data: data
        });

        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`Check-in fails: ${error.message}`);
    }
};

/**
 * get raw appointment by id without populate
 * @param {ObjectId} id appointment id to find
 * @returns appointment object or null if not found
 */
const findById = async (id) => {
    try {
        logger.debug("Finding appointment by id", {
            context: "AppointmentService.findById",
            appointmentId: id,
        });
        if (!id) return null;
        return await AppointmentModel.findById(id).lean();
    } catch (error) {
        logger.error("Error get appointment by id", {
            context: "AppointmentService.findById",
            error: error
        });
        return null;
    }
}

const findByTreatmentId = async (treatmentId) => {
    try {
        logger.debug("Finding appointment by treatmentId", {
            context: "AppointmentService.findByTreatmentId",
            treatmentId: treatmentId,
        });
        if (!treatmentId) return null;
        // Treatment lưu appointment_id (không phải ngược lại)
        // Nên cần tìm Treatment trước, sau đó lấy appointment_id từ đó
        const TreatmentModel = require('../../treatment/models/treatment.model');
        const treatment = await TreatmentModel.findById(treatmentId).lean();
        if (!treatment || !treatment.appointment_id) return null;
        return await AppointmentModel.findById(treatment.appointment_id).lean();
    } catch (error) {
        logger.error("Error finding appointment by treatmentId", {
            context: "AppointmentService.findByTreatmentId",
            error: error
        });
        return null;
    }
}

/**
 * Calculate total amount by appointment
 * * @param {ObjectId} appointmentId - Appointment ID to calculate amount for
 * @returns {Promise<number>} total amount of appointment or 0
 */
const calculateTotalAmount = async (appointmentId) => {
    const context = "AppointmentService.calculateTotalAmount";

    try {
        const appointment = await AppointmentModel.findById(appointmentId).lean();

        if (!appointment) {
            logger.error("Could not find appointment by id.", {
                context,
                appointmentId
            });
            return 0;
        }
        const serviceBooking = appointment.book_service || [];

        logger.debug("Services found.", {
            context,
            serviceCount: serviceBooking.length,
            serviceBooking: serviceBooking
        });

        const totalAmount = serviceBooking.reduce((total, service) => {
            const price = service.unit_price || 0;
            return total + price;
        }, 0);

        logger.debug("Final total amount calculated.", {
            context,
            totalAmount
        });

        return totalAmount;

    } catch (error) {
        logger.error("Error calculating total amount", {
            context,
            error
        });
        return 0; // Trả về 0 trực tiếp khi có lỗi
    }
}

/**
 * check duplicate appointment if full_name, phone, appointment_date, appointment_time is existed
 * @param {String} full_name full name patient 
 * @param {String} phone phone number patient
 * @param {String} appointment_date date booking
 * @param {String} appointment_time time booing
 */
const checkDuplicateFullNameAndPhoneAndAppointDateAndAppointTime = async (full_name, phone, appointment_date, appointment_time) => {
    const contex = "AppointmentService.CheckDuplicateFullNameAndPhoneAndAppointDateAndAppointTime";
    try {
        const appointment = await AppointmentModel.findOne({
            full_name: full_name,
            phone: phone,
            appointment_date: appointment_date,
            appointment_time: appointment_time
        });
        logger.debug("Finding appointment.", {
            context: contex,
            full_name: full_name,
            phone: phone,
            appointment_date: appointment_date,
            appointment_time: appointment_time,
            appointment: appointment
        });
        return !!appointment;
    } catch (error) {
        logger.error("Erro check duplicate", {
            contex: contex,
            full_name: full_name,
            phone: phone,
            appointment_date: appointment_date,
            appointment_time: appointment_time,
            error: error
        });
        return true;
    }
}

/**
 * to get list appointment to payment with conditions treatment with price > 0 and No have appointment_id on invoices Modal || if have then only get with status invoice is PENDING with filter:
 * - date_filter: get treatment by planned_date lte date_filter
 * - status: status of appointment is COMPLETED
 * - search: search by full_name or phone 
 * - limit: default 10
 * - page: default 1
 * @param {Object} query Object to filter
 */
const getListAppointmentToPayment = async (query) => {
    const context = "AppointmentService.getListAppointmentToPayment";
    try {
        logger.debug("Getting list appointment to payment with query", {
            context,
            query
        });

        const { date_filter, search } = query;

        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const appointmentMatch = {
            status: "COMPLETED"
        };

        if (search) {
            const searchRegex = new RegExp(search, "i");
            appointmentMatch.$or = [
                { full_name: searchRegex },
                { phone: searchRegex }
            ];
        }

        const treatmentMatch = {
            $expr: { $eq: ["$appointment_id", "$$apptId"] },
            price: { $gt: 0 }
        };

        const dateNow = new Date();
        const dateEnd = new Date(date_filter || dateNow);
        dateEnd.setHours(23, 59, 59, 999);
        dateNow.setHours(0, 0, 0, 0);

        logger.debug("Fillter Date", {
            context: context,
            date_filter: date_filter,
            dateNow: dateNow,
            dateEnd: dateEnd
        });
        treatmentMatch.planned_date = {
            $gte: dateNow,
            $lte: dateEnd
        };

        const pipeline = [
            // B1: Lọc các Appointment thỏa mãn điều kiện cơ bản
            { $match: appointmentMatch },

            // B2: Lookup toàn bộ hóa đơn của lịch hẹn này
            {
                $lookup: {
                    from: "invoices",
                    localField: "_id",
                    foreignField: "appointment_id",
                    as: "existing_invoices"
                }
            },

            // B3: Xử lý logic TRẠNG THÁI HÓA ĐƠN
            {
                $match: {
                    // 1. Tuyệt đối loại bỏ nếu đã có hóa đơn COMPLETED (đã thanh toán)
                    "existing_invoices.status": { $ne: "COMPLETED" },
                    // 2. Thỏa mãn 1 trong 2 điều kiện sau:
                    $or: [
                        { "existing_invoices.0": { $exists: false } }, // Chưa có hóa đơn nào (mảng rỗng)
                        { "existing_invoices.status": "PENDING" }      // Có hóa đơn và trạng thái là PENDING
                    ]
                }
            },

            // B4: Lookup sang bảng treatments với pipeline tùy chỉnh
            {
                $lookup: {
                    from: "treatments",
                    let: { apptId: "$_id" },
                    pipeline: [
                        { $match: treatmentMatch }
                    ],
                    as: "treatments_to_pay"
                }
            },

            // B5: Chỉ giữ lại những Appointment CÓ ÍT NHẤT 1 treatment thỏa mãn điều kiện
            {
                $match: {
                    "treatments_to_pay.0": { $exists: true }
                }
            },

            // B6: Tính tổng số tiền cần thanh toán
            {
                $addFields: {
                    total_payment_amount: { $sum: "$treatments_to_pay.price" }
                }
            },

            // B7: Dọn dẹp payload
            {
                $project: {
                    existing_invoices: 0, // Xóa mảng này đi cho nhẹ payload
                    __v: 0,
                    priority: 0,
                    updatedAt: 0,
                    "treatments_to_pay.__v": 0,
                    "treatments_to_pay.createdAt": 0,
                    "treatments_to_pay.updatedAt": 0
                }
            },

            // B8: Sắp xếp theo ngày lịch hẹn giảm dần
            { $sort: { appointment_date: -1 } },

            // B9: Phân trang sử dụng $facet
            {
                $facet: {
                    metadata: [
                        { $count: "total" }
                    ],
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ];
        const result = await AppointmentModel.aggregate(pipeline);

        const totalItems = result[0].metadata.length > 0 ? result[0].metadata[0].total : 0;
        const totalPages = Math.ceil(totalItems / limit);
        const data = result[0].data;
        logger.debug("List appointment to payment result", {
            context: context,
            data: data,
            pagination: {
                total_items: totalItems,
                total_pages: totalPages,
                current_page: page,
                limit: limit
            }
        })
        return {
            data,
            pagination: {
                total_items: totalItems,
                total_pages: totalPages,
                current_page: page,
                limit: limit
            }
        };

    } catch (error) {
        logger.error("Error get list appointment to payment", {
            context,
            query,
            error
        });
        throw new errorRes.InternalServerError(`Error get list appointment to payment: ${error.message}`);
    }
};

/**
 * get first appointment of patient at now with status checkin
 * @param {ObjectId} patientId id patient to get appointment
 * @returns Object appointment || null if not found
 */
const getFirstAppointmentOfPatientAtNowWithStatusCheckin = async (patientId) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const appointment = await AppointmentModel.findOne({
            patient: patientId,
            appointment_date: { $gte: startOfDay, $lte: endOfDay },
            status: 'CHECKED_IN'
        }).sort({ appointment_date: 1 });

        return appointment || null;
    } catch (error) {
        logger.error("Error get first appointment of patient at now with status checkin", {
            context,
            patientId,
            error
        });
        return null;
    }
};


module.exports = {
    getListService,
    getByIdService,
    createService,
    updateService,
    updateStatusOnly,
    getListOfPatientService,
    staffCreateService,
    checkinService,
    findById,
    findByTreatmentId,
    getListOfPatientServiceWithDate,
    calculateTotalAmount,
    checkDuplicateFullNameAndPhoneAndAppointDateAndAppointTime,
    getListAppointmentToPayment,
    getFirstAppointmentOfPatientAtNowWithStatusCheckin
};