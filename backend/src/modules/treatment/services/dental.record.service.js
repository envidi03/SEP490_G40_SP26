const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");
const Pagination = require("../../../common/responses/Pagination");

const bcrypt = require("bcrypt");
const emailService = require("../../../common/service/email.service");
const appointmentModel = require("../../appointment/models/appointment.model");

const Model = require("../models/index.model");
const { Model: AuthModel } = require("../../auth/index");
const PatientModel = require("../../../modules/patient/model/patient.model");
const AppointmentModel = require("../../appointment/models/index.model");
const { model: ServiceModel } = require("../../service/index");
const {Staff: StaffModel} = require("../../staff/models/index.model");

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
        { email: regexSearch },
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
                __v: 0,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
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
        totalItems: totalItems,
      },
    };
  } catch (error) {
    logger.error("Error getting list of appointments", {
      context: "AppointmentService.getListService",
      message: error.message,
      stack: error.stack,
    });
    throw new errorRes.InternalServerError(
      `An error occurred while fetching list of appointments: ${error.message}`,
    );
  }
};

/*
    get list dental record of patient with pagination and filter
    (
        search: search by record_name(in collection dental_record), doctor_name(in collection staff), tooth_position(in collection treatment);
        filter_dental_record: filter by status (in collection dental_record);
        filter_treatment: filter by status (in collection treatment);
        sort: sort by start_date(in collection dental_record);
        page
        limit (5 record dental_record/page)
    )
*/
const getListOfPatientService = async (query, patientId) => {
  const context = "DentalRecordService.getListOfPatientService";
  try {
    logger.debug("Fetching list of patient dental records with query", {
      context: context,
      query: query,
      patientId: patientId,
    });

    // 1. CHUẨN HÓA THAM SỐ TỪ QUERY
    const search = query.search ? query.search.trim() : null;
    const filterDentalRecord = query.filter_dental_record ? query.filter_dental_record.toUpperCase() : null; 
    const filterTreatment = query.filter_treatment ? query.filter_treatment.toUpperCase() : null;
    
    const sortOrder = query.sort === "asc" ? 1 : -1;
    const page = Math.max(1, parseInt(query.page || 1));
    const limit = Math.max(1, parseInt(query.limit || 5));
    const skip = (page - 1) * limit;

    const patientObjectId = new mongoose.Types.ObjectId(patientId);

    // 2. KHỞI TẠO PIPELINE AGGREGATION
    const aggregatePipeline = [];

    // --- STAGE 1: Lọc cơ bản ở bảng DentalRecord ---
    const initialMatch = { patient_id: patientObjectId };
    if (filterDentalRecord) {
      initialMatch.status = filterDentalRecord;
    }
    aggregatePipeline.push({ $match: initialMatch });

    // --- STAGE 2: JOIN với bảng Staff (Bác sĩ) ---
    aggregatePipeline.push({
      $lookup: {
        from: "staffs", 
        localField: "created_by",
        foreignField: "_id",
        as: "doctor_info" 
      }
    });

    aggregatePipeline.push({
      $addFields: {
        doctor_info: { $arrayElemAt: ["$doctor_info", 0] } 
      }
    });

    // --- STAGE 3: JOIN với bảng Treatment ---
    aggregatePipeline.push({
      $lookup: {
        from: "treatments",
        localField: "_id",
        foreignField: "record_id",
        as: "treatments" 
      }
    });

    // --- STAGE 4: Lọc và Search Nâng cao ---
    const complexMatch = {};

    if (filterTreatment) {
      complexMatch["treatments.status"] = filterTreatment;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      complexMatch.$or = [
        { record_name: searchRegex },
        { "doctor_info.full_name": searchRegex }, 
        { "treatments.tooth_position": searchRegex }
      ];
    }

    if (Object.keys(complexMatch).length > 0) {
      aggregatePipeline.push({ $match: complexMatch });
    }

    // --- STAGE 5: Sắp xếp ---
    aggregatePipeline.push({ $sort: { start_date: sortOrder } });

    // --- STAGE 6: Phân trang ---
    aggregatePipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              __v: 0,
              "doctor_info.password": 0, // Che mật khẩu bác sĩ
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    // 3. THỰC THI TRUY VẤN
    const result = await Model.DentalRecord.aggregate(aggregatePipeline);

    const dentalRecords = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;

    return {
      data: dentalRecords,
      pagination: {
        page: page,
        size: limit,
        totalItems: totalItems,
      },
    };
  } catch (error) {
    logger.error("Error getting list of patient dental records", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw new errorRes.InternalServerError(
      `An error occurred while fetching list of dental records: ${error.message}`
    );
  }
};

/*
  view detail dental record by id (include detail dental record and list treatment of dental record)
*/
const getByIdService = async (id) => {
  const context = "DentalRecordService.getByIdService";
  try {
    logger.debug("Fetching dental record by id", {
      context: context,
      dentalRecordId: id,
    });

    // --- 1. KIỂM TRA ĐỊNH DẠNG ID ---
    // (Thực ra bạn đã check isValidObjectId ở Controller rồi, 
    // nhưng để lại ở Service cho chắc chắn cũng rất tốt)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new errorRes.BadRequestError("Invalid Dental Record ID format");
    }

    // --- 2. TRUY VẤN DỮ LIỆU DENTAL RECORD ---
    const dentalRecord = await Model.DentalRecord.findById(id)
      .populate("patient_id") 
      .populate("created_by") 
      .lean();

    // --- 3. KIỂM TRA TỒN TẠI ---
    if (!dentalRecord) {
      logger.warn("Dental record not found", {
        context: context,
        dentalRecordId: id,
      });
      throw new errorRes.NotFoundError("Dental record not found");
    }

    // --- 4. TRUY VẤN DANH SÁCH TREATMENT CỦA RECORD NÀY ---
    // Tìm tất cả các phiên điều trị (Treatment) có record_id bằng với ID của bệnh án này
    const treatments = await Model.Treatment.find({ record_id: id })
      .populate("doctor_id") 
      .sort({ createdAt: -1 }) 
      .lean();

    // --- 5. GỘP DỮ LIỆU VÀ TRẢ VỀ ---
    // Gắn mảng treatments vừa tìm được vào object dentalRecord
    dentalRecord.treatments = treatments;

    logger.debug("Dental record and treatments fetched successfully", {
      context: context,
      dentalRecordId: id,
      dentalRecord: dentalRecord,
    });

    return dentalRecord;

  } catch (error) {
    logger.error("Error getting dental record by id", {
      context: context,
      message: error.message,
      stack: error.stack,
    });

    if (error.statusCode) throw error;

    throw new errorRes.InternalServerError(
      `An error occurred while fetching dental record by id: ${error.message}`,
    );
  }
};

const createService = async (dataCreate) => {
  const context = "DentalRecordService.createService";
  try {
    logger.debug("Raw data to create dental record", {
      context: context,
      dataCreate: dataCreate,
    });

    // 1. Tạo hồ sơ bệnh án mới
    const newData = await Model.DentalRecord.create(dataCreate);
    return newData;
  } catch (error) {
    logger.error("Error at create new dental record.", {
      // Đã sửa text log
      context: context,
      message: error.message,
      stack: error.stack,
    });

    // Quăng tiếp lỗi chuẩn nếu có
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError(
      `Error creating dental record: ${error.message}`,
    );
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
        { new: true, session },
      );
      if (!updatedAccount)
        throw new errorRes.NotFoundError("Account not found");
    }

    // 2.2 Update Profile
    if (Object.keys(profileUpdate).length > 0) {
      await AuthModel.Profile.findOneAndUpdate(
        { account_id: accountId },
        { $set: profileUpdate },
        { new: true, session },
      );
    }

    // 2.3 Update Staff & License
    // Tìm Staff hiện tại (Quan trọng: phải dùng session để đảm bảo tính nhất quán đọc/ghi)
    const currentStaff = await StaffModel.Staff.findOne({
      account_id: accountId,
    }).session(session);

    if (!currentStaff) {
      // Nếu không tìm thấy Staff, throw lỗi để rollback tất cả (kể cả Account/Profile vừa update)
      throw new errorRes.NotFoundError(
        "Staff profile not found for this account!",
      );
    }

    // Update Staff info
    if (Object.keys(staffUpdate).length > 0) {
      await StaffModel.Staff.findByIdAndUpdate(
        currentStaff._id,
        { $set: staffUpdate },
        { session },
      );
    }

    // Update License (Upsert: Tạo mới nếu chưa có)
    if (Object.keys(licenseUpdate).length > 0) {
      await StaffModel.License.findOneAndUpdate(
        { doctor_id: currentStaff._id },
        { $set: licenseUpdate },
        { new: true, session, upsert: true },
      );
    }

    // --- BƯỚC 3: COMMIT TRANSACTION ---
    await session.commitTransaction();

    // --- BƯỚC 4: LẤY DỮ LIỆU TRẢ VỀ (Tối ưu Performance) ---
    // Session đã kết thúc (commit), ta có thể query song song bằng Promise.all
    // Lưu ý: Lúc này không cần truyền 'session' vào query nữa

    const [accountResult, profileResult, staffResult, licenseResult] =
      await Promise.all([
        AuthModel.Account.findById(accountId).select("-password").lean(),
        AuthModel.Profile.findOne({ account_id: accountId }).lean(),
        StaffModel.Staff.findById(currentStaff._id).lean(),
        StaffModel.License.findOne({ doctor_id: currentStaff._id }).lean(),
      ]);

    return {
      account: accountResult,
      profile: profileResult,
      staff: staffResult,
      license: licenseResult,
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
      const nextNumber = await AppointmentModel.getNextQueueNumber(
        existingAppt.appointment_date,
      );

      // Bước 3: Cập nhật ĐỒNG THỜI cả trạng thái và số thứ tự
      newData = await AppointmentModel.findByIdAndUpdate(
        id,
        {
          status: status,
          queue_number: nextNumber,
        },
        { new: true }, // Trả về object sau khi đã update xong
      );
    }

    // --- KỊCH BẢN 2: CÁC TRẠNG THÁI KHÁC (SCHEDULED, COMPLETED, CANCELLED...) ---
    else {
      newData = await AppointmentModel.findByIdAndUpdate(
        id,
        { status: status },
        { new: true },
      );
    }

    // --- KIỂM TRA LẠI KẾT QUẢ ---
    if (!newData) {
      throw new errorRes.NotFoundError(
        "Appointment not found or update failed",
      );
    }

    return newData;
  } catch (error) {
    logger.error("Error updating appointment status.", {
      context: "AppointmentService.updateStatusOnly",
      appointmentId: id,
      status: status,
      message: error.message,
    });

    // Ném tiếp các lỗi đã được định nghĩa (ví dụ: NotFoundError)
    if (error.statusCode) throw error;

    // Bắt các lỗi hệ thống (Database lỗi, rớt mạng...)
    throw new errorRes.InternalServerError(`Update fails: ${error.message}`);
  }
};

/**
 * Tìm kiếm bệnh án khớp với 3 điều kiện:
    1. Của đúng bệnh nhân đó
    2. Trùng tên bệnh án
    3. Trạng thái đang là IN_PROGRESS
 * @param {ObjectId} patientId patient id để kiểm tra
 * @param {String} record_name tên bệnh án để kiểm tra
 * @returns 
 */
const checkDuplicateDental = async (patientId, record_name) => {
  const context = "DentalRecordService.checkDuplicateDental";
  const cleanedRecordName = record_name.trim().replace(/\s+/g, " ");
  try {
    logger.debug("Checking duplicate IN_PROGRESS dental record", {
      context: context,
      patientId: patientId,
      record_name: cleanedRecordName,
    });
    const existingRecord = await Model.DentalRecord.findOne({
      patient_id: patientId,
      record_name: { $regex: new RegExp(`^${cleanedRecordName}$`, "i") },
      status: "IN_PROGRESS",
    });

    if (existingRecord) {
      logger.info("Found duplicate IN_PROGRESS dental record", {
        context: context,
        recordId: existingRecord._id,
      });
    }

    return existingRecord || null;
  } catch (error) {
    logger.error("Error checking duplicate dental record", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw new errorRes.InternalServerError(
      `Error checking duplicate dental record: ${error.message}`,
    );
  }
};

module.exports = {
  getListService,
  getByIdService,
  createService,
  updateService,
  updateStatusOnly,
  getListOfPatientService,
  checkDuplicateDental,
};
