const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");

const Model = require("../models/index.model");

/**
 * get list dental record of patient with pagination and filter
    
 * @param {*} query 
      (
        search: search by record_name(in collection dental_record), doctor_name(in collection staff), tooth_position(in collection treatment);
        filter_dental_record: filter by status (in collection dental_record);
        filter_treatment: filter by status (in collection treatment);
        sort: sort by start_date(in collection dental_record);
        page
        limit (5 record dental_record/page)
      )
 * @param {ObjectId || null} patientId user id để lấy danh sách bệnh án của bệnh nhân đó, nếu patientId = null thì sẽ lấy tất cả bệnh án không phân biệt bệnh nhân nào (dành cho admin)
 * @returns Danh sách bệnh án của bệnh nhân đó (nếu patientId != null) hoặc tất cả bệnh án (nếu patientId = null) kèm theo thông tin bác sĩ tạo bệnh án và danh sách treatment của mỗi bệnh án, có hỗ trợ phân trang, filter theo status của bệnh án và status của treatment, search theo tên bệnh án, tên bác sĩ và vị trí răng, sắp xếp theo ngày bắt đầu
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

    // 2. KHỞI TẠO PIPELINE AGGREGATION
    const aggregatePipeline = [];

    // --- STAGE 1: Lọc cơ bản ở bảng DentalRecord ---
    const initialMatch = {};

    if (patientId) {
      initialMatch.patient_id = new mongoose.Types.ObjectId(patientId);
    }
    if (filterDentalRecord) {
      initialMatch.status = filterDentalRecord;
    }
    aggregatePipeline.push({ $match: initialMatch });

    // --- STAGE 2: JOIN với bảng Staff (Lấy thông tin tài khoản Bác sĩ) ---
    aggregatePipeline.push({
      $lookup: {
        from: "staffs",
        localField: "created_by",
        foreignField: "_id",
        as: "doctor_info",
      },
    });

    // Ép mảng doctor_info thành object
    aggregatePipeline.push({
      $addFields: {
        doctor_info: { $arrayElemAt: ["$doctor_info", 0] },
      },
    });

    // --- STAGE 2.5: JOIN với bảng Profile (Lấy full_name, avatar... của Bác sĩ) ---
    aggregatePipeline.push({
      $lookup: {
        from: "profiles",
        localField: "doctor_info.profile_id",
        foreignField: "_id",
        as: "doctor_info.profile",
      },
    });

    // Ép mảng profile thành object nằm gọn bên trong doctor_info
    aggregatePipeline.push({
      $addFields: {
        "doctor_info.profile": { $arrayElemAt: ["$doctor_info.profile", 0] },
      },
    });

    // --- STAGE 3: JOIN BẢNG TREATMENT + BẢNG MEDICINE (KHÔNG DÙNG UNWIND) ---
    aggregatePipeline.push({
      $lookup: {
        from: "treatments",
        let: { recordId: "$_id" },
        pipeline: [
          // 3.1: Chỉ lấy các treatment thuộc bệnh án này
          { $match: { $expr: { $eq: ["$record_id", "$$recordId"] } } },

          // 3.2: Lấy tất cả thông tin thuốc có mặt trong đơn thuốc của treatment này
          {
            $lookup: {
              from: "medicines",
              localField: "medicine_usage.medicine_id",
              foreignField: "_id",
              as: "medicine_details_temp",
            },
          },

          // 💡 [THÊM MỚI Ở ĐÂY]: Lấy thông tin bác sĩ thực hiện buổi này
          {
            $lookup: {
              from: "staffs",
              localField: "doctor_id",
              foreignField: "_id",
              as: "doctor_temp",
            },
          },
          {
            $lookup: {
              from: "profiles",
              localField: "doctor_temp.profile_id",
              foreignField: "_id",
              as: "doctor_profile_temp",
            },
          },

          // Dọn dẹp cục data thuốc vừa lấy về
          {
            $unset: "medicine_details_temp.medicine_restock_requests",
          },

          // 3.3: Dùng $map lặp qua đơn thuốc và nhét chi tiết thuốc vào
          {
            $addFields: {
              medicine_usage: {
                $map: {
                  input: { $ifNull: ["$medicine_usage", []] },
                  as: "usage",
                  in: {
                    $mergeObjects: [
                      "$$usage",
                      {
                        medicine_id: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$medicine_details_temp",
                                as: "med",
                                cond: {
                                  $eq: ["$$med._id", "$$usage.medicine_id"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                    ],
                  },
                },
              },
              doctor_info: {
                _id: { $arrayElemAt: ["$doctor_temp._id", 0] },
                full_name: { $arrayElemAt: ["$doctor_profile_temp.full_name", 0] },
              },
            },
          },

          // 3.4: Xóa mảng tạm để JSON trả về được sạch đẹp
          { $project: { medicine_details_temp: 0, doctor_temp: 0, doctor_profile_temp: 0 } },

          // 3.5: Sắp xếp danh sách treatment theo thời gian tạo
          { $sort: { createdAt: 1 } },
        ],
        as: "treatments",
      },
    });

    // --- STAGE 4: Lọc và Search Nâng cao (Sau khi đã Join đầy đủ) ---
    const complexMatch = {};

    if (filterTreatment) {
      complexMatch["treatments.status"] = filterTreatment;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      complexMatch.$or = [
        { record_name: searchRegex },
        { "doctor_info.profile.full_name": searchRegex }, // Tìm theo tên trong Profile
        { "treatments.tooth_position": searchRegex },
      ];
    }

    if (Object.keys(complexMatch).length > 0) {
      aggregatePipeline.push({ $match: complexMatch });
    }

    // --- STAGE 5: Sắp xếp theo ngày bắt đầu bệnh án ---
    aggregatePipeline.push({ $sort: { start_date: sortOrder } });

    // --- STAGE 6: Phân trang (Pagination) ---
    aggregatePipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              __v: 0,
              "doctor_info.__v": 0,
              "doctor_info.profile.__v": 0,
              "doctor_info.password": 0, // Che mật khẩu bác sĩ
              "doctor_profile": 0, // Ẩn biến tạm
              "doctor_staff": 0    // Ẩn biến tạm
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
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
    };
  } catch (error) {
    logger.error("Error getting list of dental records", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw new errorRes.InternalServerError(
      `An error occurred while fetching list of dental records: ${error.message}`,
    );
  }
};

/**
 * view detail dental record by id (include detail dental record and list treatment of dental record)
 * @param {ObjectId} id dental record id for searching
 * @param {String} treatmentStatus filter treatment by status (treatment status: IN_PROGRESS, COMPLETED, CANCELLED)
 * @returns {Object} object dental record detail and list treatment of dental record
 */
const getByIdService = async (id, treatmentStatus) => {
  const context = "DentalRecordService.getByIdService";
  try {
    logger.debug("Fetching dental record by id", {
      context: context,
      dentalRecordId: id,
    });

    // 1. Get Dental Record
    const dentalRecord = await Model.DentalRecord.findById(id)
      .populate("patient_id")
      .populate({
        path: "created_by",
        populate: {
          path: "profile_id",
          select: "full_name",
        },
      })
      .lean();

    if (!dentalRecord) {
      logger.warn("Dental record not found", {
        context: context,
        dentalRecordId: id,
      });
      throw new errorRes.NotFoundError("Dental record not found");
    }

    // 2. Get Treatments
    const treatmentQuery = { record_id: id };
    if (treatmentStatus) {
      treatmentQuery.status = treatmentStatus.toUpperCase();
    }
    const treatments = await Model.Treatment.find(treatmentQuery)
      .populate("doctor_id")
      .sort({ createdAt: -1 })
      .lean();
    // 2.5 Rename end_date to endDate for frontend consumption
    treatments.forEach(t => {
      if (t.phase === 'PLAN' && t.end_date) {
        t.endDate = t.end_date;
      }
    });

    // 3. Ghép và trả về
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
 * get raw dental record by id
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

/**
 * tìm kiếm bệnh án dựa trên thông tin đầu vào có thể là full_name, phone, email, dob
 * * tìm kiếm bệnh nhân dựa trên thông tin đầu vào có thể là full_name, phone, email, dob
 * và trả về danh sách thông tin bệnh nhân trùng với thông tin đầu vào và
 * phải nhóm các thông tin cùng patient_id vào cùng 1 nhóm (vì có thể 1 bệnh nhân có nhiều bệnh án)
 * và mỗi nhóm sẽ bao gồm thông tin patient_id, full_name, phone, email, dob để khi tìm kiếm bệnh án
 * sẽ hiển thị được thông tin bệnh nhân đó để dễ dàng phân biệt với các bệnh nhân khác
 * khi có nhiều bệnh nhân trùng tên hoặc trùng số điện thoại, email.
 * * * @param {*} search infor user để tìm kiếm (có thể là full_name, phone, email, dob)
 * và sẽ tìm kiếm theo kiểu gần đúng (partial match) để tăng khả năng tìm kiếm trúng kết quả hơn
 * @returns Danh sách bệnh nhân trùng với thông tin đầu vào.
 */
const findDentalByInforUser = async (search) => {
  const context = "DentalRecordService.findDentalByInforUser";
  try {
    logger.debug("Finding dental record by user information", {
      context: context,
      search: search,
    });

    // Nếu không có chuỗi tìm kiếm, trả về mảng rỗng để tránh query toàn bộ DB
    if (!search || search.trim() === "") {
      return [];
    }

    const cleanSearch = search.trim();

    // Khởi tạo Pipeline Aggregation
    const pipeline = [
      // STAGE 1: Chuyển đổi trường dob (Date) thành String để có thể search bằng Regex (Partial Match)
      // Định dạng YYYY-MM-DD (VD: 1995-08-20). Nếu user gõ "1995", nó vẫn tìm ra được.
      {
        $addFields: {
          dob_string: {
            $dateToString: { format: "%Y-%m-%d", date: "$dob" },
          },
        },
      },

      // STAGE 2: Tìm kiếm gần đúng (Partial match không phân biệt hoa thường)
      {
        $match: {
          $or: [
            { full_name: { $regex: cleanSearch, $options: "i" } },
            { phone: { $regex: cleanSearch, $options: "i" } },
            { email: { $regex: cleanSearch, $options: "i" } },
            { dob_string: { $regex: cleanSearch, $options: "i" } }, // Match trên trường ảo vừa tạo
          ],
        },
      },

      // STAGE 3: Nhóm (Group) theo patient_id để loại bỏ các bệnh án trùng lặp của cùng 1 người
      {
        $group: {
          _id: "$patient_id", // Gom nhóm dựa trên patient_id
          // $first: Lấy thông tin từ bệnh án đầu tiên tìm thấy của người đó
          full_name: { $first: "$full_name" },
          phone: { $first: "$phone" },
          email: { $first: "$email" },
          dob: { $first: "$dob" },
        },
      },

      // STAGE 4: Định dạng lại output cho đẹp (Đổi _id thành patient_id)
      {
        $project: {
          _id: 0, // Ẩn trường _id mặc định của group
          patient_id: "$_id", // Gán lại thành patient_id
          full_name: 1,
          phone: 1,
          email: 1,
          dob: 1,
        },
      },

      // STAGE 5: Sắp xếp theo tên cho dễ nhìn (Tùy chọn)
      {
        $sort: { full_name: 1 },
      },
    ];

    // Thực thi truy vấn
    // Đảm bảo bạn gọi đúng tên Model Bệnh án của bạn (ví dụ: Model.DentalRecord)
    const groupedPatients = await Model.DentalRecord.aggregate(pipeline);

    logger.debug(
      "Successfully found and grouped patients by user information",
      {
        context: context,
        resultCount: groupedPatients.length,
      },
    );

    return groupedPatients;
  } catch (error) {
    logger.error("Error finding dental record by user information", {
      context: context,
      search: search,
      message: error.message,
      stack: error.stack,
    });
    throw new errorRes.InternalServerError(
      `An error occurred while finding dental record by user information: ${error.message}`,
    );
  }
};


/**
 * Create a Treatment Plan (`DentalRecord` + list of `Treatment` phases)
 * @param {*} data 
 * @param {*} accountDoctorId 
 */
const createTreatmentPlanService = async (data, accountDoctorId) => {
  const context = "DentalRecordService.createTreatmentPlanService";
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { phases, ...dentalRecordData } = data;

    // 1. Create DentalRecord
    const newRecords = await Model.DentalRecord.create([dentalRecordData], { session });
    const recordId = newRecords[0]._id;

    // 2. Insert Phases (Treatments)
    if (phases && phases.length > 0) {
      const treatmentsToInsert = phases.map(phase => ({
        record_id: recordId,
        patient_id: dentalRecordData.patient_id,
        doctor_id: dentalRecordData.created_by,
        phase: 'PLAN',
        tooth_position: phase.tooth_position || phase.name,
        note: phase.name,
        planned_date: phase.startDate || null,
        end_date: phase.endDate || null,
        status: phase.status === 'completed' ? 'DONE' : (phase.status === 'in_progress' ? 'IN_PROGRESS' : 'PLANNED')
      }));

      await Model.Treatment.insertMany(treatmentsToInsert, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return getDentalRecordById(recordId);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Transaction Error creating treatment plan.", {
      context: context,
      message: error.message,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError(`Error creating treatment plan: ${error.message}`);
  }
};

/**
 * Update a Treatment Plan (Update `DentalRecord` + Rewrite list of `Treatment` phases)
 * @param {*} id 
 * @param {*} data 
 */
const updateTreatmentPlanService = async (id, data) => {
  const context = "DentalRecordService.updateTreatmentPlanService";
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { phases, ...dentalRecordData } = data;

    const existingRecord = await Model.DentalRecord.findById(id).session(session);
    if (!existingRecord) {
      throw new errorRes.NotFoundError("Treatment plan not found");
    }

    // 1. Update DentalRecord
    if (Object.keys(dentalRecordData).length > 0) {
      await Model.DentalRecord.findByIdAndUpdate(id, dentalRecordData, { new: true, session });
    }

    // 2. Handle Phases (Delete existing PLAN phases and recreate them to sync with UI)
    // Note: If phases are being executed, they might have transitioned from PLAN to SESSION. 
    // Usually PLAN phases are just planning. We will remove all 'PLAN' phases and recreate them.
    if (phases) {
      await Model.Treatment.deleteMany({ record_id: id, phase: 'PLAN' }).session(session);

      if (phases.length > 0) {
        const treatmentsToInsert = phases.map(phase => ({
          record_id: id,
          patient_id: existingRecord.patient_id,
          doctor_id: existingRecord.created_by,
          phase: 'PLAN',
          tooth_position: phase.tooth_position || phase.name || 'Toàn hàm',
          note: phase.name,
          planned_date: phase.startDate || null,
          end_date: phase.endDate || null,
          status: phase.status === 'completed' ? 'DONE' : (phase.status === 'in_progress' ? 'IN_PROGRESS' : 'PLANNED')
        }));

        await Model.Treatment.insertMany(treatmentsToInsert, { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Gọi trigger bằng tay sau khi đã commit transaction xong
    // Vì transaction đã đóng nên logic checkAndCompleteDentalRecord sẽ lấy được dữ liệu mới nhất
    if (Model.Treatment.checkAndCompleteDentalRecord) {
      await Model.Treatment.checkAndCompleteDentalRecord(id);
    }

    return getDentalRecordById(id);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Transaction Error updating treatment plan.", {
      context: context,
      message: error.message,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError(`Error updating treatment plan: ${error.message}`);
  }
};

module.exports = {
  getByIdService,
  createService,
  updateService,
  getListOfPatientService,
  checkDuplicateDental,
  checkDuplicateDentalExcludeId,
  getDentalRecordById,
  findDentalByInforUser,
  createTreatmentPlanService,
  updateTreatmentPlanService
};
