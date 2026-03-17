const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");
const Pagination = require("../../../common/responses/Pagination");

const StaffModel = require("../models/index.model");
const { Model: AuthModel } = require("../../auth/index");
const PatientModel = require("../../../modules/patient/model/patient.model");
const AppointmentModel = require("./../models/appointment.model");
const { model: ServiceModel } = require("../../service/index")

const bcrypt = require('bcrypt');
const emailService = require("../../../common/service/email.service");

/*
    get list appointment with pagination and filter
    (
        search: search by full_name, phone, email;
        status: filter by status;
        sort: sort by appointment_date;
        page
        limit
    )
*/
const getListService = async (query, doctor_id) => {
    const context = "AppointmentService.getListService";
    try {
        logger.debug("Fetching list of appointments with query", {
            context: context,
            query: query,
            doctor_id: doctor_id
        });

        // 1. Lấy và chuẩn hóa các tham số từ query
        const search = query.search?.trim();
        const statusFilter = query.status ? query.status.toUpperCase() : null;
        const appointmentDate = query.appointment_date;
        const filterDoctorId = query.doctor_id || doctor_id; // Check both Places
        const sortOrder = query.sort === "desc" ? -1 : 1;
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 5));
        const skip = (page - 1) * limit;

        // 2. Xây dựng điều kiện lọc (Match)
        const matchCondition = {};

        // Lọc theo trạng thái (status)
        if (statusFilter) {
            matchCondition.status = statusFilter;
        }

        // Lọc theo ngày (appointment_date)
        if (appointmentDate) {
            const startOfDay = new Date(appointmentDate);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(appointmentDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            matchCondition.appointment_date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        // Lọc theo doctor_id (Phải ép kiểu về ObjectId trong Aggregation)
        if (filterDoctorId) {
            matchCondition.doctor_id = new mongoose.Types.ObjectId(filterDoctorId);
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
            // BƯỚC 1 & 2: Lọc và Sắp xếp toàn bộ dữ liệu (rất nhanh vì có index)
            { $match: matchCondition },
            { $sort: { appointment_date: sortOrder } },

            // BƯỚC 3: Phân luồng (1 luồng đếm tổng, 1 luồng lấy data)
            {
                $facet: {
                    data: [
                        // Cắt lấy đúng số lượng của trang hiện tại trước (Ví dụ: 5 record)
                        { $skip: skip },
                        { $limit: limit },

                        // HIỆU NĂNG CAO: Chỉ Lookup thông tin bác sĩ cho 5 record này
                        {
                            $lookup: {
                                from: "staffs", // Tên collection chứa Staff
                                localField: "doctor_id",
                                foreignField: "_id",
                                as: "doctor_info"
                            }
                        },
                        // Flatten mảng doctor_info thành object
                        {
                            $addFields: {
                                doctor_info: { $arrayElemAt: ["$doctor_info", 0] }
                            }
                        },

                        // Tùy chọn: Nếu bạn muốn lấy luôn Tên và Avatar Bác sĩ từ bảng Profile
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
        // (Đảm bảo gọi đúng Model Lịch hẹn của bạn)
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
    // Giả sử trường lưu thời gian hẹn trong DB của bạn là appointment_date
    matchCondition.appointment_date = { $gt: dateToFilter };

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
    try {
        logger.debug("raw data to create", {
            context: "appointmentService.createService",
            dataCreate: dataCreate,
            account_id, account_id
        });
        // Tìm Patient profile từ account_id của user đang đăng nhập
        const patient = await PatientModel.findOne({ account_id: account_id });
        if (!patient) {
            logger.warn("Pation notfound", {
                context: "appointmentService.createService",
                account_id: account_id,
                patient: patient
            });
            throw new errorRes.NotFoundError("No patient records were found linked to this account. Please update your records.");
        }
        dataCreate.patient_id = patient._id;
        // check duplicate appointment by 'full_name', 'phone', 'email',  'appointment_date', 'appointment_time'
        const duplicateQuery = {
            full_name: dataCreate.full_name,
            phone: dataCreate.phone,
            email: dataCreate.email,
            appointment_date: dataCreate.appointment_date,
            appointment_time: dataCreate.appointment_time,
            status: { $nin: ['CANCELLED', 'NO_SHOW'] } // Bỏ qua lịch đã hủy
        };
        const isDuplicatePatient = await AppointmentModel.findOne(duplicateQuery);
        if (isDuplicatePatient) {
            throw new Error(`Patient ${dataCreate.full_name} already has an appointment scheduled for ${dataCreate.appointment_time}. Please do not book a duplicate appointment.`);
        }
        // check id service
        if (dataCreate.book_service && Array.isArray(dataCreate.book_service)) {
            for (const service of dataCreate.book_service) {
                const [serviceExist, subServiceExist] = await Promise.all([
                    ServiceModel.findById(service.service_id),
                    service.sub_service_id ? mongoose.model("SubService").findById(service.sub_service_id) : Promise.resolve(true)
                ]);

                if (!serviceExist) {
                    logger.warn(`ID service not found: ${service.service_id}`, {
                        context: "AppointmentService.createService",
                        account_id: account_id,
                        service_id: service.service_id
                    });
                    throw new errorRes.NotFoundError(`Service not found! ID: ${service.service_id}`);
                }
                
                if (!subServiceExist) {
                    logger.warn(`ID sub-service not found: ${service.sub_service_id}`, {
                        context: "AppointmentService.createService",
                        sub_service_id: service.sub_service_id
                    });
                    throw new errorRes.NotFoundError(`Sub-service not found! ID: ${service.sub_service_id}`);
                }
            }
        }
        // Tạo lịch hẹn mới
        const newAppointment = await AppointmentModel.create(dataCreate);
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
        return newAppointment;
    } catch (error) {
        logger.error("Error at create new appointment.", {
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(`Error: ${error.message}`);
    }
};

const staffCreateService = async (dataCreate) => {
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
        const isDuplicatePatient = await AppointmentModel.findOne(duplicateQuery);
        if (isDuplicatePatient) {
            throw new errorRes.ConflictError(`Patient ${dataCreate.full_name} already has an appointment scheduled for ${dataCreate.appointment_time}.`);
        }

        // 2. Check valid services
        if (dataCreate.book_service && Array.isArray(dataCreate.book_service)) {
            for (const service of dataCreate.book_service) {
                const [serviceExist, subServiceExist] = await Promise.all([
                    ServiceModel.findById(service.service_id),
                    service.sub_service_id ? mongoose.model("SubService").findById(service.sub_service_id) : Promise.resolve(true)
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

        // 3. (Quan trọng) Hỗ trợ cấp STT nếu lễ tân tạo lịch hẹn đến thẳng phòng khám
        if (dataCreate.status === "CHECKED_IN") {
            const nextNumber = await AppointmentModel.getNextQueueNumber(dataCreate.appointment_date);
            dataCreate.queue_number = nextNumber;
        }

        // 4. Tạo lịch hẹn mới
        const newAppointment = await AppointmentModel.create(dataCreate);
        return newAppointment;

    } catch (error) {
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
        // Chỉ cho phép update các trường liên quan đến lịch khám
        const allowedUpdates = {};
        if (data.appointment_date) allowedUpdates.appointment_date = data.appointment_date;
        if (data.appointment_time) allowedUpdates.appointment_time = data.appointment_time;
        if (data.reason !== undefined) allowedUpdates.reason = data.reason;

        // Tìm lịch hẹn hiện tại
        const existingAppt = await AppointmentModel.findById(id);
        if (!existingAppt) {
            throw new errorRes.NotFoundError("Appointment not found");
        }

        // Tùy chọn: Thêm kiểm tra trạng thái, chỉ lịch SCHEDULED mới được sửa
        if (existingAppt.status !== "SCHEDULED") {
            throw new errorRes.BadRequestError("Only SCHEDULED appointments can be updated");
        }

        // Cập nhật
        const updatedAppt = await AppointmentModel.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true } // trả về document sau khi update
        ).lean();

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
        let newData = null;

        // --- KỊCH BẢN 1: BỆNH NHÂN CHECK-IN TẠI QUẦY ---
        if (status === "CHECKED_IN") {
            // Bước 1: Phải tìm lịch hẹn trước để lấy ngày khám (appointment_date)
            const existingAppt = await AppointmentModel.findById(id);

            if (!existingAppt) {
                throw new errorRes.NotFoundError("Appointment not found");
            }

            // Bảo vệ API (Idempotent): Nếu khách ấn Check-in 2 lần liên tiếp, 
            // hoặc đã có số rồi thì không cấp số mới, trả về kết quả luôn.
            if (existingAppt.status === "CHECKED_IN" && existingAppt.queue_number) {
                return existingAppt;
            }

            // Bước 2: Gọi hàm sinh số thứ tự thông minh từ Model
            const nextNumber = await AppointmentModel.getNextQueueNumber(existingAppt.appointment_date);

            // Bước 3: Cập nhật ĐỒNG THỜI cả trạng thái và số thứ tự
            newData = await AppointmentModel.findByIdAndUpdate(
                id,
                {
                    status: status,
                    queue_number: nextNumber
                },
                { new: true } // Trả về object sau khi đã update xong
            );
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
        }

        // --- KIỂM TRA LẠI KẾT QUẢ ---
        if (!newData) {
            throw new errorRes.NotFoundError("Appointment not found or update failed");
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
    getListOfPatientServiceWithDate
};