const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const successRes = require("../../../common/success");
const { cleanObjectData } = require("../../../common/utils/cleanObjectData");
const Pagination = require("../../../common/responses/Pagination");
const mongoose = require("mongoose");

const { dental: ServiceProcess } = require("../services/index.service");
const { checkRequiredFields } = require("../../../utils/checkRequiredFields");
const { findStaffByAccountId, findPatientByAccountId } = require("../../auth/service/account.service");
const { checkDuplicateDental } = require("../services/dental.record.service");

/* 
  get list dental record with pagination and filter
    (
        search: search by record_name(in collection dental_record), doctor_name(in collection staff), tooth_position(in collection treatment);
        filter_dental_record: filter by status (in collection dental_record);
        filter_treatment: filter by status (in collection treatment);
        sort: sort by start_date(in collection dental_record);
        page
        limit (5 record dental_record/page)
    )
*/
const getListController = async (req, res) => {
  const context = "DentalRecordController.getListController";
  try {
    const queryParams = req.query;

    logger.debug("Get list dental records request received", {
      context: context,
      query: queryParams,
    });

    const { data, pagination } = await ServiceProcess.getListOfPatientService(queryParams, null);

    const paginationData = new Pagination({
      page: pagination.page,
      size: pagination.size,
      totalItems: pagination.totalItems,
    });

    return new successRes.GetListSuccess(
      data,
      paginationData,
      "Dental records retrieved successfully",
    ).send(res);
  } catch (error) {
    logger.error("Error get Dental Record", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * get list dental record of patient with pagination and filter
    (
        search: search by record_name(in collection dental_record), doctor_name(in collection staff), tooth_position(in collection treatment);
        filter_dental_record: filter by status (in collection dental_record);
        filter_treatment: filter by status (in collection treatment);
        sort: sort by start_date(in collection dental_record);
        page
        limit (5 record dental_record/page)
    )
 * @param {*} queryParams 
 * @param {*} patientId 
 * @returns object {data: list dental record, pagination: {page, size, totalItems}}
 */
const getListDentalOfPatientController = async (queryParams, patientId) => {
  const context = "DentalRecordController.getListDentalOfPatientController";
  try {
    // check patientId empty
    if (!patientId) {
      logger.warn("Missing patient ID in request params", {
        context: context,
        patientId: patientId,
      });
      throw new errorRes.BadRequestError("Patient ID is required to get dental records for a patient");
    }

    logger.debug("Get list dental record of patient request received", {
      context: context,
      query: queryParams,
      patientId: patientId,
    });

    const { data, pagination } = await ServiceProcess.getListOfPatientService(queryParams, patientId);

    const paginationData = new Pagination({
      page: pagination.page,
      size: pagination.size,
      totalItems: pagination.totalItems,
    });

    return { data, pagination: paginationData };
  } catch (error) {
    logger.error("Error get Dental Record", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * get list dental record of patient with pagination and filter
    (
        search: search by record_name(in collection dental_record), doctor_name(in collection staff), tooth_position(in collection treatment);
        filter_dental_record: filter by status (in collection dental_record);
        filter_treatment: filter by status (in collection treatment);
        sort: sort by start_date(in collection dental_record);
        page
        limit (5 record dental_record/page)
    )
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getListOfPatientController = async (req, res) => {
  const context = "DentalRecordController.getListOfPatientController";
  try {
    const queryParams = req.query;
    const { account_id: accountPatientId } = req.user;
    const { patient } = await findPatientByAccountId(accountPatientId);
    if (!patient) {
      logger.warn("Patient not found for account_id", {
        context: context,
        accountPatientId: accountPatientId
      });
      throw new errorRes.NotFoundError("Patient not found!")
    };
    const { data, pagination } = await getListDentalOfPatientController(queryParams, patient._id);

    return new successRes.GetListSuccess(
      data,
      pagination,
      "Dental records of patient retrieved successfully",
    ).send(res);

  } catch (error) {
    logger.error("Error get Dental Record of patient", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }

};

/**
 * get list dental record of patient with pagination and filter
    (
        search: search by record_name(in collection dental_record), doctor_name(in collection staff), tooth_position(in collection treatment);
        filter_dental_record: filter by status (in collection dental_record);
        filter_treatment: filter by status (in collection treatment);
        sort: sort by start_date(in collection dental_record);
        page
        limit (5 record dental_record/page)
    )
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getListOfStaffController = async (req, res) => {
  const context = "DentalRecordController.getListOfStaffController";
  try {
    const queryParams = req.query;
    const { id: patientId } = req.params;
    if (!patientId) {
      logger.warn("Missing patient ID in request params", {
        context: context,
        patientId: patientId,
      });
      throw new errorRes.BadRequestError("Patient ID is required to get dental records for a patient");
    }
    const { data, pagination } = await getListDentalOfPatientController(queryParams, patientId);

    return new successRes.GetListSuccess(
      data,
      pagination,
      "Dental records of patient retrieved successfully",
    ).send(res);
  } catch (error) {
    logger.error("Error get Dental Record of staff", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/*
  view detail dental record by id (include detail dental record and list treatment of dental record)
*/
const getByIdController = async (req, res) => {
  const context = "DentalRecordController.getByIdController";
  try {
    const { id } = req.params;
    const { treatment_status } = req.query;
    logger.debug("Get dental record by id request received", {
      context: context,
      dentalRecordId: id,
    });

    // 1. Kiểm tra ID rỗng
    if (!id) {
      logger.warn("Empty ID", {
        context: context,
      });
      throw new errorRes.BadRequestError("Dental record ID is required");
    }

    // 2. Kiểm tra định dạng chuẩn của MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      logger.warn("Invalid ObjectId format", {
        context: context,
        dentalRecordId: id,
      });
      throw new errorRes.BadRequestError("Invalid Dental Record ID format");
    }

    // 3. Gọi service xử lý logic
    const dentalRecordDetail = await ServiceProcess.getByIdService(id, treatment_status);

    // 4. Xử lý trường hợp không tìm thấy dữ liệu (Rất quan trọng)
    if (!dentalRecordDetail) {
      logger.warn("Dental record not found in database", {
        context: context,
        dentalRecordId: id,
      });
      throw new errorRes.NotFoundError("Dental record not found");
    }

    // 5. Trả về Response
    return new successRes.GetDetailSuccess(
      dentalRecordDetail,
      "Dental record retrieved successfully",
    ).send(res);

  } catch (error) {
    logger.error("Error get dental record by id", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/*
  doctor create new dental_record by patientID
*/
const createController = async (req, res) => {
  const context = "DentalRecordController.createController"
  try {
    const dataCreate = req.body || {};
    const { id: patientID } = req.params;
    const { account_id: accountDoctorId } = req.user;

    logger.debug("Base data", {
      context: context,
      patientId: patientID,
      accountDoctorId: accountDoctorId
    });

    // --- 1. FIND DOCTOR & APPOINTMENT ---
    const { staff: doctor } = await findStaffByAccountId(accountDoctorId);

    if (!doctor) {
      logger.warn("Doctor not found for account_id", {
        context: context,
        accountDoctorId: accountDoctorId
      });
      throw new errorRes.NotFoundError("Doctor not found!")
    };
    if (!doctor._id) {
      logger.error("Doctor record missing _id", {
        context: context,
        accountDoctorId: accountDoctorId,
        doctorData: doctor
      });
      throw new errorRes.InternalServerError("Doctor data is invalid!")
    }
    if (!patientID) {
      logger.warn("Missing patient ID in request params", {
        context: context,
        patientID: patientID
      });
      throw new errorRes.BadRequestError("Patient ID is required!")
    }
    const dentalDuplicate = await checkDuplicateDental(patientID, dataCreate.record_name);
    if (dentalDuplicate) {
      logger.warn("Duplicate IN_PROGRESS dental record found for patient", {
        context: context,
        patientID: patientID,
        record_name: dataCreate.record_name,
        dentalDuplicate: dentalDuplicate
      });
      throw new errorRes.ConflictError(
        "A dental record with the same name is already in progress for this patient. Please choose a different name or complete the existing record before creating a new one."
      );
    }

    // Gán khóa ngoại
    dataCreate.created_by = doctor._id;
    dataCreate.patient_id = patientID;

    // --- 2. CLEAN & AUTO-FILL SNAPSHOT DATA ---
    const cleanedData = cleanObjectData(dataCreate);

    // --- 3. VALIDATION ---
    // Khai báo các fields BẮT BUỘC dựa theo Schema DentalRecord
    const requiredFields = [
      "patient_id",
      "created_by",
      "full_name",
      "phone",
      "record_name"
    ];

    // Kiểm tra validation cơ bản
    checkRequiredFields(requiredFields, cleanedData, this, "createController");

    // --- 4. CALL SERVICE ---
    const newData = await ServiceProcess.createService(cleanedData);
    if (!newData) {
      logger.warn("Failed to create new dental record", { context });
      throw new errorRes.BadRequestError("Create new dental record fails.");
    }

    // --- 5. RESPONSE ---
    return new successRes.CreateSuccess(
      newData,
      "Dental record created successfully"
    ).send(res);

  } catch (error) {
    logger.error("Error create new dental record controller", {
      context: context,
      message: error.message,
    });
    throw error;
  }
};

/**
 * update dental record by id (only doctor can update)
 * - chỉ update được những field sau: full_name, phone, record_name, description, status (nếu status = COMPLETED thì không được update nữa)
 * - không được update field created_by, patient_id, treatment_list, start_date, end_date
 * - hệ thống sẽ tự động chuyển status của dental record thành COMPLETED nếu tất cả treatment trong treatment_list đều có status = COMPLETED
 * - nếu update status thành CANCELLED phải đảm bảo tất cả treatment trong treatment_list đều không có status = IN_PROGRESS
 * - khi update record_name phải kiểm tra trùng lặp với các record_name của các dental record khác của cùng bệnh nhân có status IN_PROGRESS (không tính bản ghi hiện tại)
 * * @param {*} req 
 * @param {*} res 
 * @returns record dental đã được update
 */
const updateController = async (req, res) => {
  const context = "DentalRecordController.updateController";
  try {
    const { id } = req.params;
    const dataUpdate = req.body || {};
    const { account_id: accountDoctorId } = req.user;

    logger.debug("Base data for update dental record", {
      context: context,
      dentalRecordId: id,
      accountDoctorId: accountDoctorId,
      dataUpdate: dataUpdate
    });

    // 1. Kiểm tra ID đầu vào
    if (!id) {
      throw new errorRes.BadRequestError("Dental record ID is required");
    }

    // 2. Kiểm tra quyền: Chỉ có DOCTOR mới được phép update (Giữ nguyên logic của bạn)
    const { role } = await findStaffByAccountId(accountDoctorId);
    if (!role || role.name !== "DOCTOR") {
      logger.warn("Unauthorized update attempt by non-doctor account", {
        context: context,
        accountDoctorId: accountDoctorId,
        role: role
      });
      throw new errorRes.UnauthorizedError("Only doctors can update dental records");
    }

    // 3. LỌC DỮ LIỆU (Whitelist): Chỉ cho phép lấy các field được phép update
    const allowedUpdates = {};
    const allowedFields = [
      "full_name",
      "phone",
      "record_name",
      "description",
      "status"
    ];

    for (const field of allowedFields) {
      if (dataUpdate[field] !== undefined) {
        allowedUpdates[field] = dataUpdate[field];
      }
    }

    // 4. Làm sạch dữ liệu
    const cleanedData = cleanObjectData(allowedUpdates);

    // Kiểm tra trùng lặp record_name với các dental record khác của cùng bệnh nhân có status IN_PROGRESS (không tính bản ghi hiện tại)
    if (cleanedData.record_name) {
      // Lấy thông tin dental record hiện tại để biết patient_id
      const currentDentalRecord = await ServiceProcess.getByIdService(id);
      if (!currentDentalRecord) {
        logger.warn("Dental record not found for update", {
          context: context,
          dentalRecordId: id,
        });
        throw new errorRes.NotFoundError("Dental record not found");
      }

      const patientId = currentDentalRecord.patient_id;
      const dentalDuplicate = await ServiceProcess.checkDuplicateDentalExcludeId(patientId, cleanedData.record_name, id);
      if (dentalDuplicate) {
        logger.warn("Duplicate IN_PROGRESS dental record found for patient on update", {
          context: context,
          patientId: patientId,
          record_name: cleanedData.record_name,
          dentalDuplicate: dentalDuplicate
        });
        throw new errorRes.ConflictError(
          "A dental record with the same name is already in progress for this patient. Please choose a different name or complete the existing record before updating."
        );
      }
    }

    // Kiểm tra xem sau khi lọc và clean, có còn dữ liệu nào để update không
    if (Object.keys(cleanedData).length === 0) {
      throw new errorRes.BadRequestError("No valid data provided for update");
    }

    // 5. Gọi Service cập nhật
    const updated = await ServiceProcess.updateService(id, cleanedData);

    // 6. Gửi response thành công
    return new successRes.UpdateSuccess(
      updated,
      "Dental record updated successfully"
    ).send(res);

  } catch (error) {
    logger.error("Error updating dental record", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
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
const findUserByUserInfo = async (req, res) => {
  const context = "DentalRecordController.findUserByUserInfo";
  try {
    const { search } = req.query;
    if (!search) {
      logger.warn("Missing search query parameter", {
        context: context,
      });
      throw new errorRes.BadRequestError("Search query parameter is required");
    }
    const userList = await ServiceProcess.findDentalByInforUser(search);
    return new successRes.GetListSuccess(userList, "Users found successfully").send(res);
  } catch (error) {
    logger.error("Error find user by user info", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Create a Treatment Plan
 */
const createTreatmentPlanController = async (req, res) => {
  const context = "DentalRecordController.createTreatmentPlanController";
  try {
    const dataCreate = req.body || {};
    const { account_id: accountDoctorId } = req.user;

    logger.debug("Create Treatment Plan request received", {
      context: context,
      accountDoctorId: accountDoctorId,
      body: dataCreate
    });

    const { staff: doctor } = await findStaffByAccountId(accountDoctorId);
    if (!doctor || !doctor._id) {
      throw new errorRes.UnauthorizedError("Doctor not found!");
    }

    dataCreate.created_by = doctor._id;
    const cleanedData = cleanObjectData(dataCreate);

    if (!cleanedData.patient_id) {
      throw new errorRes.BadRequestError("patient_id is required!");
    }

    const newData = await ServiceProcess.createTreatmentPlanService(cleanedData, accountDoctorId);

    return new successRes.CreateSuccess(
      newData,
      "Treatment plan created successfully"
    ).send(res);

  } catch (error) {
    logger.error("Error creating treatment plan", {
      context: context,
      message: error.message,
    });
    throw error;
  }
};

/**
 * Update a Treatment Plan
 */
const updateTreatmentPlanController = async (req, res) => {
  const context = "DentalRecordController.updateTreatmentPlanController";
  try {
    const { id } = req.params;
    const dataUpdate = req.body || {};

    logger.debug("Update Treatment Plan request received", {
      context: context,
      planId: id,
      body: dataUpdate
    });

    if (!id) {
      throw new errorRes.BadRequestError("Treatment Plan ID is required");
    }

    const cleanedData = cleanObjectData(dataUpdate);

    const updated = await ServiceProcess.updateTreatmentPlanService(id, cleanedData);

    return new successRes.UpdateSuccess(
      updated,
      "Treatment plan updated successfully"
    ).send(res);

  } catch (error) {
    logger.error("Error updating treatment plan", {
      context: context,
      message: error.message,
    });
    throw error;
  }
};

/**
 * Get List of Treatment Plans
 */
const getListTreatmentPlansController = async (req, res) => {
  const context = "DentalRecordController.getListTreatmentPlansController";
  try {
    const queryParams = req.query;
    logger.debug("Get list of treatment plans request received", {
      context: context,
      query: queryParams,
    });

    const { data, pagination } = await ServiceProcess.getListOfPatientService(queryParams, null);

    // Format data specific for Treatment Plans
    const formattedData = data.map(record => {
      // Filter only PLAN treatments
      const planPhases = (record.treatments || []).filter(t => t.phase === 'PLAN').map(t => ({
        id: t._id,
        name: t.tooth_position || t.note || 'Unnamed Phase',
        startDate: t.planned_date,
        endDate: t.end_date,
        status: t.status === 'DONE' ? 'completed' : (t.status === 'IN_PROGRESS' ? 'in_progress' : 'pending')
      }));

      return {
        id: record._id,
        patient_id: record.patient_id,
        patientName: record.full_name,
        patientPhone: record.phone,
        doctor_id: record.created_by,
        doctorName: record.doctor_info?.profile?.full_name || 'N/A',
        planName: record.record_name,
        diagnosis: record.diagnosis || '',
        startDate: record.start_date,
        estimatedEndDate: record.end_date,
        totalCost: record.total_amount,
        progress: planPhases.length ? Math.round((planPhases.filter(p => p.status === 'completed').length / planPhases.length) * 100) : 0,
        status: record.status === 'COMPLETED' ? 'completed' : (record.status === 'IN_PROGRESS' ? 'in_progress' : 'pending'),
        phases: planPhases,
        notes: record.description || record.note || ''
      };
    });

    return new successRes.GetListSuccess(
      formattedData,
      pagination,
      "Treatment plans retrieved successfully"
    ).send(res);

  } catch (error) {
    logger.error("Error get list of treatment plans", {
      context: context,
      message: error.message,
    });
    throw error;
  }
};

module.exports = {
  getListOfPatientController,
  getListOfStaffController,
  getListController,
  getByIdController,
  createController,
  updateController,
  findUserByUserInfo,
  createTreatmentPlanController,
  updateTreatmentPlanController,
  getListTreatmentPlansController
};
