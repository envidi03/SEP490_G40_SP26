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
/*
    get list appointment with pagination and filter
    (
        search: search by full_name, phone, email;
        filter: filter by status;
        sort: sort by appointment_date;
        page
        limit
    )
*/
const getListService = async (query) => {
    try {
        logger.debug("Fetching list of appointments with query", {
            context: "AppointmentService.getListService",
            query: query,
        });

        // 1. Lấy và chuẩn hóa các tham số từ query
        const search = query.search?.trim();
        const statusFilter = query.status ? query.status.toUpperCase() : null;
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
            { $match: matchCondition },
            { $sort: { appointment_date: sortOrder } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                __v: 0 
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
            context: "AppointmentService.getListService",
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
        filter: filter by status;
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

            // Sắp xếp theo ngày hẹn (appointment_date)
            { $sort: { appointment_date: sortOrder } },

            // Phân trang
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                __v: 0 // Loại bỏ trường __v dư thừa
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
    try {
        logger.debug("Fetching appointment by id", {
            context: "AppointmentService.getByIdService",
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
            .lean();

        // --- 3. KIỂM TRA TỒN TẠI ---
        if (!appointment) {
            logger.warn("Appointment not found", {
                context: "AppointmentService.getByIdService",
                appointmentId: id,
            });
            throw new errorRes.NotFoundError("Appointment not found");
        }

        logger.debug("Appointment fetched successfully", {
            context: "AppointmentService.getByIdService",
            appointmentId: id,
        });

        // Đã sửa lỗi: Trả về đúng biến appointment thay vì staffInfo
        return appointment;

    } catch (error) {
        // Đã sửa lỗi: Cập nhật lại log lỗi cho đúng ngữ cảnh Appointment
        logger.error("Error getting appointment by id", {
            context: "AppointmentService.getByIdService",
            message: error.message,
            stack: error.stack,
        });

        if (error.statusCode) throw error;

        throw new errorRes.InternalServerError(
            `An error occurred while fetching appointment by id: ${error.message}`
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
                const serviceExist = await ServiceModel.findById(service.service_id);

                if (!serviceExist) {
                    logger.warn(`ID service not found: ${service.service_id}`, {
                        context: "AppointmentService.createService",
                        account_id: account_id,
                        service_id: service.service_id
                    });
                    throw new errorRes.NotFoundError(`Service not found! ID: ${service.service_id}`);
                }
            }
        }
        // Tạo lịch hẹn mới
        const newAppointment = await AppointmentModel.create(dataCreate);
        return newAppointment;
    } catch (error) {
        logger.error("Error at create new appointment.", {
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(`Error: ${error.message}`);
    }
};

/**
 * Update an existing service
 * 
 * @param {ObjectId} id service id to update
 * @param {*} updateData data to update
 * @returns updated service object
 */
const updateService = async (accountId, data) => {
    // 1. Khởi tạo Session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // --- BƯỚC 1: TÁCH DỮ LIỆU (Giữ nguyên) ---
        const accountUpdate = {};
        const profileUpdate = {};
        const staffUpdate = {};
        const licenseUpdate = {};

        // Mapping Account
        if (data.username) accountUpdate.username = data.username;
        if (data.email) accountUpdate.email = data.email;
        if (data.phone_number) accountUpdate.phone_number = data.phone_number;
        if (data.password) {
            const salt = parseInt(process.env.BCRYPT_SALT, 10) || 10;
            accountUpdate.password = await bcrypt.hash(data.password, salt);
        }

        // Mapping Profile
        if (data.full_name) profileUpdate.full_name = data.full_name;
        if (data.dob) profileUpdate.dob = data.dob;
        if (data.gender) profileUpdate.gender = data.gender;
        if (data.address) profileUpdate.address = data.address;
        if (data.avatar_url) profileUpdate.avatar_url = data.avatar_url;

        // Mapping Staff
        if (data.work_start) staffUpdate.work_start = data.work_start;
        if (data.work_end) staffUpdate.work_end = data.work_end;

        // Mapping License
        if (data.license_number) licenseUpdate.license_number = data.license_number;
        if (data.issued_by) licenseUpdate.issued_by = data.issued_by;
        if (data.issued_date) licenseUpdate.issued_date = data.issued_date;
        if (data.document_url) licenseUpdate.document_url = data.document_url;

        // --- BƯỚC 2: THỰC HIỆN UPDATE ---

        // 2.1 Update Account
        if (Object.keys(accountUpdate).length > 0) {
            const updatedAccount = await AuthModel.Account.findByIdAndUpdate(
                accountId,
                { $set: accountUpdate },
                { new: true, session }
            );
            if (!updatedAccount) throw new errorRes.NotFoundError("Account not found");
        }

        // 2.2 Update Profile
        if (Object.keys(profileUpdate).length > 0) {
            await AuthModel.Profile.findOneAndUpdate(
                { account_id: accountId },
                { $set: profileUpdate },
                { new: true, session }
            );
        }

        // 2.3 Update Staff & License
        // Tìm Staff hiện tại (Quan trọng: phải dùng session để đảm bảo tính nhất quán đọc/ghi)
        const currentStaff = await StaffModel.Staff.findOne({ account_id: accountId }).session(session);

        if (!currentStaff) {
            // Nếu không tìm thấy Staff, throw lỗi để rollback tất cả (kể cả Account/Profile vừa update)
            throw new errorRes.NotFoundError("Staff profile not found for this account!");
        }

        // Update Staff info
        if (Object.keys(staffUpdate).length > 0) {
            await StaffModel.Staff.findByIdAndUpdate(
                currentStaff._id,
                { $set: staffUpdate },
                { session }
            );
        }

        // Update License (Upsert: Tạo mới nếu chưa có)
        if (Object.keys(licenseUpdate).length > 0) {
            await StaffModel.License.findOneAndUpdate(
                { doctor_id: currentStaff._id },
                { $set: licenseUpdate },
                { new: true, session, upsert: true }
            );
        }

        // --- BƯỚC 3: COMMIT TRANSACTION ---
        await session.commitTransaction();

        // --- BƯỚC 4: LẤY DỮ LIỆU TRẢ VỀ (Tối ưu Performance) ---
        // Session đã kết thúc (commit), ta có thể query song song bằng Promise.all
        // Lưu ý: Lúc này không cần truyền 'session' vào query nữa

        const [accountResult, profileResult, staffResult, licenseResult] = await Promise.all([
            AuthModel.Account.findById(accountId).select('-password').lean(),
            AuthModel.Profile.findOne({ account_id: accountId }).lean(),
            StaffModel.Staff.findById(currentStaff._id).lean(),
            StaffModel.License.findOne({ doctor_id: currentStaff._id }).lean()
        ]);

        return {
            account: accountResult,
            profile: profileResult,
            staff: staffResult,
            license: licenseResult
        };

    } catch (error) {
        // Rollback nếu transaction đang chạy
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        // Log lỗi
        logger.error("Error updating service", {
            context: "ServiceService.updateService",
            message: error.message,
            stack: error.stack,
        });

        // QUAN TRỌNG: Ném lại đúng lỗi gốc để Controller xử lý (400, 404, 409...)
        throw error;
    } finally {
        session.endSession();
    }
};

const getRoleById = async (id) => {
    try {
        if (!id) return null;
        const role = await AuthModel.Role.findById(id);
        return role;
    } catch (error) {
        logger.error("Error getting role by id", {
            context: "StaffService.getRoleById",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while getting role by id: ${error.message}`
        );
    }
};

// Kiểm tra License Number (trong model Staff hoặc License)
const checkUniqueLicenseNumber = async (license_number) => {
    const exists = await StaffModel.License.findOne({ license_number });
    return !!exists; // Trả về true nếu tìm thấy, false nếu không
};

// Kiểm tra Username (trong model Account)
const checkUniqueUsername = async (username) => {
    const exists = await AuthModel.Account.findOne({ username });
    return !!exists;
};

// Kiểm tra Email (trong model Account)
const checkUniqueEmail = async (email) => {
    const exists = await AuthModel.Account.findOne({ email });
    return !!exists;
};

// Kiểm tra License Number cho người khác (loại trừ License hiện tại theo ID)
const checkUniqueLicenseNumberNotId = async (license_number, licenseId) => {
    const exists = await StaffModel.License.findOne({
        license_number,
        _id: { $ne: licenseId } // $ne = Not Equal (Không bằng ID hiện tại)
    });
    return !!exists;
};

// Kiểm tra Username cho người khác (loại trừ Account hiện tại)
const checkUniqueUsernameNotId = async (username, accountId) => {
    const exists = await AuthModel.Account.findOne({
        username,
        _id: { $ne: accountId }
    });
    return !!exists;
};

// Kiểm tra Email cho người khác (loại trừ Account hiện tại)
const checkUniqueEmailNotId = async (email, accountId) => {
    const exists = await AuthModel.Account.findOne({
        email,
        _id: { $ne: accountId }
    });
    return !!exists;
};

// Service riêng cho việc update nhanh status
const updateStatusOnly = async (id, status) => {
    try {
        const newData = await AppointmentModel.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!newData) {
            throw new errorRes.NotFoundError("Appointment not found");
        }

        return newData;

    } catch (error) {
        logger.error("Error cannot update status appointment.", {
            context: "AppointmentService.updateStatusOnly",
            appointmentId: id,
            status: status
        });

        if (error.statusCode) throw error; // Ném tiếp lỗi NotFoundError nếu có

        // Đã sửa cú pháp nối chuỗi lỗi
        throw new errorRes.InternalServerError(`Update fails: ${error.message}`);
    }
};



module.exports = {
    getListService,
    getByIdService,
    createService,
    updateService,
    checkUniqueLicenseNumber,
    checkUniqueUsername,
    checkUniqueEmail,
    checkUniqueLicenseNumberNotId,
    checkUniqueUsernameNotId,
    checkUniqueEmailNotId,
    getRoleById,
    updateStatusOnly,
    getListOfPatientService
};
