const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");
const Pagination = require("../../../common/responses/Pagination");

const StaffModel = require("../models/index.model");
const { Model: AuthModel } = require("../../auth/index");
const PatientModel = require("../../../modules/patient/model/patient.model");
const AppointmentModel = require("../../appointment/models/index.model");
const { model: ServiceModel } = require("../../service/index")

const model = require("../models/index.model");

const getByIdService = async (id) => {
    const context = "TreatmentService.getByIdService";
    try {
        logger.debug("Fetching treatment by id", {
            context: context,
            treatmentId: id,
        });

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new errorRes.BadRequestError("Invalid Treatment ID format");
        }

        const treatment = await model.Treatment.findById(id)
            .populate("medicine_usage.medicine_id")
            .lean();

        if (!treatment) {
            logger.warn("Treatment not found", {
                context: context,
                treatmentId: id,
            });
            throw new errorRes.NotFoundError("Treatment not found");
        }
        return treatment;

    } catch (error) {
        logger.error("Error getting treatment by id", {
            context: context,
            message: error.message,
            stack: error.stack,
        });

        if (error.statusCode) throw error;

        throw new errorRes.InternalServerError(
            `An error occurred while fetching treatment by id: ${error.message}`
        );
    }
};

const createService = async (dataCreate, account_id) => {
    try {
        logger.debug("raw data to create", {
            context: "treatmentService.createService",
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

/*
    Update Status and Auto-generate Queue Number
*/
const updateStatusOnly = async (id, status) => {
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

        // --- KỊCH BẢN 2: CÁC TRẠNG THÁI KHÁC (SCHEDULED, COMPLETED, CANCELLED...) ---
        else {
            newData = await AppointmentModel.findByIdAndUpdate(
                id,
                { status: status },
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

module.exports = {
    getByIdService,
    createService,
    updateService,
    updateStatusOnly,
};
