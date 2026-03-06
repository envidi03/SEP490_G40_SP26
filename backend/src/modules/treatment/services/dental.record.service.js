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
const { Staff: StaffModel } = require("../../staff/models/index.model");

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
    const filterDentalRecord = query.filter_dental_record
      ? query.filter_dental_record.toUpperCase()
      : null;
    const filterTreatment = query.filter_treatment
      ? query.filter_treatment.toUpperCase()
      : null;

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
        as: "doctor_info",
      },
    });

    aggregatePipeline.push({
      $addFields: {
        doctor_info: { $arrayElemAt: ["$doctor_info", 0] },
      },
    });

    // --- STAGE 3: JOIN với bảng Treatment ---
    aggregatePipeline.push({
      $lookup: {
        from: "treatments",
        localField: "_id",
        foreignField: "record_id",
        as: "treatments",
      },
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
        { "treatments.tooth_position": searchRegex },
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
      `An error occurred while fetching list of dental records: ${error.message}`,
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
 * Cập nhật thông tin bệnh án (Nếu status = COMPLETED thì không được cập nhật bất kỳ thông tin nào nữa bao gồm cả status)
 * - Chỉ cập nhật được khi bệnh án đang ở trạng thái IN_PROGRESS
 * - Có thể cập nhật record_name, start_date, end_date, status
 * - Nếu cập nhật status sang COMPLETED thì sẽ tự động cập nhật end_date bằng ngày hiện tại
 * - Không tự động đổi status sang COMPLETED và nó tự động được đổi khi all treatment của dental record đó đều đã hoàn thành (status = COMPLETED)
 * và end_date sẽ được cập nhật bằng ngày hiện tại
 * - Nếu cập nhật status sang CANCELLED thì phải đảm bảo tất cả treatment của dental record đó đều không có status = IN_PROGRESS
 * - Khi cập nhật record_name phải kiểm tra trùng lặp với các record_name của các dental record khác của cùng bệnh nhân có status IN_PROGRESS (không tính bản ghi hiện tại)
 * - Không được cập nhật field created_by, patient_id, treatment_list, start_date, end_date
 * - Chỉ có doctor mới được quyền cập nhật thông tin bệnh án
 *
 * @param {*} id dental_record id cần cập nhật
 * @param {*} data dữ liệu cập nhật (có thể là record_name, start_date, end_date, status)
 */
const updateService = async (id, data) => {
  const context = "DentalRecordService.updateService";
  try {
    logger.debug("Updating dental record with data", {
      context,
      dentalRecordId: id,
      data,
    });

    const existingRecord = await Model.DentalRecord.findById(id);
    if (!existingRecord)
      throw new errorRes.NotFoundError("Dental record not found");

    if (existingRecord.status !== "IN_PROGRESS") {
      throw new errorRes.BadRequestError(
        "Only IN_PROGRESS records can be updated.",
      );
    }

    // STRICT BUSINESS RULE: Không bao giờ cho phép tự tay đổi thành COMPLETED
    if (data.status === "COMPLETED") {
      throw new errorRes.BadRequestError(
        "Cannot manually set status to COMPLETED. System will auto-complete when all treatments are COMPLETED.",
      );
    }

    // Xử lý kịch bản CANCELLED
    if (data.status === "CANCELLED") {
      const treatments = await Model.Treatment.find({ record_id: id }).lean();
      const hasInProgress = treatments.some((t) => t.status === "IN_PROGRESS");

      if (hasInProgress) {
        throw new errorRes.BadRequestError(
          "Cannot cancel dental record. There are treatments in IN_PROGRESS status.",
        );
      }
      data.end_date = new Date();
    }

    // Thực thi cập nhật
    const updatedRecord = await Model.DentalRecord.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return updatedRecord;
  } catch (error) {
    logger.error("Error updating dental record.", {
      context,
      message: error.message,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError(
      `Error updating dental record: ${error.message}`,
    );
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

/**
 * Tìm kiếm bệnh án khớp với 3 điều kiện ngoại trừ bản ghi có id:
    1. Của đúng bệnh nhân đó
    2. Trùng tên bệnh án
    3. Trạng thái đang là IN_PROGRESS
 * @param {ObjectId} patientId patient id để kiểm tra
 * @param {String} record_name tên bệnh án để kiểm tra
 * @param {ObjectId} excludeId id của bản ghi cần loại trừ khi kiểm tra trùng lặp
 * @returns 
 */
const checkDuplicateDentalExcludeId = async (
  patientId,
  record_name,
  excludeId,
) => {
  const context = "DentalRecordService.checkDuplicateDentalExcludeId";
  const cleanedRecordName = record_name.trim().replace(/\s+/g, " ");
  try {
    logger.debug("Checking duplicate IN_PROGRESS dental record", {
      context: context,
      patientId: patientId,
      record_name: cleanedRecordName,
      excludeId: excludeId,
    });
    const existingRecord = await Model.DentalRecord.findOne({
      patient_id: patientId,
      record_name: { $regex: new RegExp(`^${cleanedRecordName}$`, "i") },
      status: "IN_PROGRESS",
    });

    if (existingRecord) {
      logger.info("Found duplicate IN_PROGRESS dental record", {
        context: context,
        excludeId: excludeId,
        recordId: existingRecord._id,
        existingRecord: existingRecord,
      });
    }

    return existingRecord || null;
  } catch (error) {
    logger.error("Error checking duplicate dental record", {
      context: context,
      excludeId: excludeId,
      record_name: cleanedRecordName,
      patientId: patientId,
      message: error.message,
      stack: error.stack,
    });
    throw new errorRes.InternalServerError(
      `Error checking duplicate dental record: ${error.message}`,
    );
  }
};

/**
 * only find dental record by id
 *
 * @param {ObjectId} id dental record id for searching
 * @returns Object {dentalRecord} if found, otherwisr return null
 */
const getDentalRecordById = async (id) => {
  const context = "DentalRecordService.getDentalRecordById";
  try {
    logger.debug("Finding dental record by id", {
      context: context,
      dentalRecordId: id,
    });

    const dentalRecord = await Model.DentalRecord.findById(id).lean();

    if (!dentalRecord) {
      logger.warn("Dental record not found", {
        context: context,
        dentalRecordId: id,
      });
      return null;
    }

    return dentalRecord;
  } catch (error) {
    logger.error("Error finding dental record by id", {
      context: context,
      dentalRecordId: id,
      message: error.message,
      stack: error.stack,
    });
    throw new errorRes.InternalServerError(
      `An error occurred while finding dental record by id: ${error.message}`,
    );
  }
};

module.exports = {
  getListService,
  getByIdService,
  createService,
  updateService,
  getListOfPatientService,
  checkDuplicateDental,
  checkDuplicateDentalExcludeId,
  getDentalRecordById,
};
