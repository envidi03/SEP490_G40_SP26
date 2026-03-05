const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const successRes = require("../../../common/success");
const { cleanObjectData } = require("../../../common/utils/cleanObjectData");
const Pagination = require("../../../common/responses/Pagination");
const mongoose = require("mongoose"); 

const {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} = require("../../../utils/cloudinaryHelper");

const {dental: ServiceProcess} = require("../services/index.service");
const { checkRequiredFields } = require("../../../utils/checkRequiredFields");
const { findStaffByAccountId, findPatientByAccountId } = require("../../auth/service/account.service");
const {service: ServiceAppointment} = require("../../appointment/index");
const { checkDuplicateDental } = require("../services/dental.record.service");

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
const getListController = async (req, res) => {
  try {
    const queryParams = req.query;

    logger.debug("Get list appointment of patient request received", {
      context: "AppointmentController.getListController",
      query: queryParams,
    });

    const { data, pagination } = await ServiceProcess.getListService(queryParams);

    const paginationData = new Pagination({
      page: pagination.page,
      size: pagination.size,
      totalItems: pagination.totalItems,
    });

    return new successRes.GetListSuccess(
      data,
      paginationData,
      "Appointment retrieved successfully",
    ).send(res);
  } catch (error) {
    logger.error("Error get Appointment", {
      context: "AppointmentController.getListController",
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

    const { data, pagination } = await ServiceProcess.getListOfPatientService(queryParams,patientId);

    const paginationData = new Pagination({
      page: pagination.page,
      size: pagination.size,
      totalItems: pagination.totalItems,
    });

    return {data, pagination: paginationData};
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
    const {account_id: accountPatientId} = req.user;
    const {patient} = await findPatientByAccountId(accountPatientId);
    if (!patient) {
      logger.warn("Patient not found for account_id", {
        context: context,
        accountPatientId: accountPatientId
      });
      throw new errorRes.NotFoundError("Patient not found!")
    };
    const {data, pagination} = await getListDentalOfPatientController(queryParams, patient._id);

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
    const dentalRecordDetail = await ServiceProcess.getByIdService(id);

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
    const {staff: doctor} = await findStaffByAccountId(accountDoctorId);
    
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

// staff create appointment (không cần token/account của bệnh nhân)
const staffCreateController = async (req, res) => {
  try {
    const dataCreate = req.body || {};
    const cleanedData = cleanObjectData(dataCreate);

    // 1. Khai báo các fields bắt buộc (ĐÃ BỎ 'email' để phù hợp với người lớn tuổi)
    const requiredFields = [
      "full_name",
      "phone",
      "appointment_date",
      "appointment_time",
    ];

    // Kiểm tra validation cơ bản
    checkRequiredFields(requiredFields, cleanedData, this, "createController");

    // Validate mảng book_service nếu client có gửi kèm dịch vụ
    if (cleanedData.book_service && Array.isArray(cleanedData.book_service)) {
      cleanedData.book_service.forEach((item, index) => {
        if (!item.service_id || item.unit_price === undefined) {
          throw new errorRes.BadRequestError(
            `Service at index ${index} is missing service_id or unit_price`
          );
        }
      });
    }

    // 2. Chuyển dữ liệu sang Service để xử lý logic nghiệp vụ
    const newAppointment = await ServiceProcess.staffCreateService(cleanedData);

    if (!newAppointment) {
      logger.warn("Failed to create new appointment", {
        context: "appointmentController.staffCreateController",
        data: cleanedData
      });
      throw new errorRes.BadRequestError("Create new appointment fails.");
    }

    // 3. Trả về response
    return new successRes.CreateSuccess(
      newAppointment,
      "Appointment created successfully"
    ).send(res);

  } catch (error) {
    logger.error("Error appointm create new appointment controller", {
      context: "appointmentController.staffCreateController",
      message: error.message,
    });
    throw error;
  }
};
// update staff by accountId
const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUpdate = req.body || {};

    // 2. Làm sạch dữ liệu
    // Loại bỏ field 'status' để bảo mật, chỉ lấy phần còn lại
    const { status, ...restData } = dataUpdate;
    const cleanedData = cleanObjectData(restData);

    // Kiểm tra xem có dữ liệu nào để update không (bao gồm cả file)
    if (Object.keys(cleanedData).length === 0 && !req.files) {
      throw new errorRes.BadRequestError("No data provided for update");
    }

    // 3. VALIDATION: Chỉ kiểm tra những trường có trong dữ liệu gửi lên

    // Kiểm tra Email
    if (cleanedData.email) {
      checkEmail(cleanedData.email);
      // Kiểm tra trùng lặp email, ngoại trừ chính tài khoản này
      const isEmailExist = await ServiceProcess.checkUniqueEmailNotId(
        cleanedData.email,
        accountId,
      );
      if (isEmailExist) {
        throw new errorRes.ConflictError("Email already exists!");
      }
    }

    // Kiểm tra Username
    if (cleanedData.username) {
      // Kiểm tra trùng lặp username, ngoại trừ chính tài khoản này
      const isUsernameExist = await ServiceProcess.checkUniqueUsernameNotId(
        cleanedData.username,
        accountId,
      );
      if (isUsernameExist) {
        throw new errorRes.ConflictError("Username already exists!");
      }
    }

    // Validate các trường thông thường
    if (cleanedData.phone_number) checkPhone(cleanedData.phone_number);
    // Lưu ý: Nếu update password, hãy đảm bảo password được hash trước khi lưu vào DB (có thể xử lý ở Service hoặc tại đây)
    if (cleanedData.password) checkPassword(cleanedData.password);

    // 4. Validate License (Logic nghiệp vụ đặc thù)
    if (cleanedData.license_number) {
      checkLicenseNumber(cleanedData.license_number);
      // SỬA LỖI: Dùng biến accountId thay vì id
      const isLicenseExist = await ServiceProcess.checkUniqueLicenseNumberNotId(
        cleanedData.license_number,
        accountId,
      );
      if (isLicenseExist) {
        throw new errorRes.ConflictError("License number already exists!");
      }
    }

    if (cleanedData.issued_by) checkIssuedBy(cleanedData.issued_by);
    if (cleanedData.issued_date) checkIssuedDate(cleanedData.issued_date);

    // 5. Xử lý upload file (Cloudinary)
    if (req.files) {
      if (req.files["avatar"]) {
        // Lấy file đầu tiên trong mảng avatar
        cleanedData.avatar_url = await uploadToCloudinary(
          req.files["avatar"][0],
          "user_avatars",
        );
      }
      if (req.files["license"]) {
        // Upload nhiều file license nếu cần
        cleanedData.document_url = await uploadMultipleToCloudinary(
          req.files["license"],
          "user_licenses",
        );
      }
    }

    // 6. Gọi Service thực hiện cập nhật
    // SỬA LỖI: Dùng biến accountId thay vì id
    const updated = await ServiceProcess.updateService(accountId, cleanedData);

    // Gửi response thành công
    return new successRes.UpdateSuccess(updated).send(res);
  } catch (error) {
    // Logging lỗi chi tiết để debug
    logger.error("Error update appointmet", {
      context: "AppointmentController.updateController",
      message: error.message,
      stack: error.stack, // Nên log thêm stack trace để dễ sửa lỗi
    });
    throw error;
  }
};

// update appointment status only
const updateStatusController = async (req, res) => {
  try {
    // 1. Lấy ID của Appointment
    const { id } = req.params;
    const { status } = req.body || {};

    logger.debug("Update appointment status request received", {
      context: "AppointmentController.updateStatusController",
      appointmentId: id,
      status: status,
    });

    // 2. Validate Status
    const validStatuses = [
      "SCHEDULED",
      "CHECKED_IN",
      "IN_CONSULTATION",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW"
    ];

    if (!status || !validStatuses.includes(status)) {
      logger.warn("Invalid or missing status value", {
        context: "AppointmentController.updateStatusController",
        status: status,
        allowed: validStatuses,
      });
      throw new errorRes.BadRequestError(
        `Invalid status. Allowed values: ${validStatuses.join(", ")}`
      );
    }

    // 3. Gọi Service cập nhật (Đã sửa lỗi: truyền trực tiếp biến status dạng chuỗi)
    const result = await ServiceProcess.updateStatusOnly(id, status);

    // Kiểm tra kết quả
    if (!result) {
      throw new errorRes.NotFoundError("Appointment not found or update failed");
    }

    logger.info("Appointment status updated successfully", {
      context: "AppointmentController.updateStatusController",
      appointmentId: result._id,
      newStatus: result.status,
    });

    // 4. Trả về kết quả
    return new successRes.UpdateSuccess(
      result,
      "Appointment status updated successfully"
    ).send(res);

  } catch (error) {
    logger.error("Error updating appointment status", {
      context: "AppointmentController.updateStatusController",
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/*
  Self Check-in by full_name, phone, email. 
  If correct, auto change status to CHECKED_IN and generate queue number.
*/
const checkinController = async (req, res) => {
  try { // ĐÃ SỬA: Thêm thẻ try bị thiếu
    const query = req.body || {};
    const cleanedData = cleanObjectData(query);

    logger.debug("Checkin appointment request received", {
      context: "AppointmentController.checkinController",
      query: cleanedData, // ĐÃ SỬA: Xóa biến 'id' rác gây crash app
    });

    // LƯU Ý: Nếu người lớn tuổi không có email, bạn nên cân nhắc bỏ "email" 
    // ra khỏi requiredFields để họ chỉ cần nhập Tên + SĐT là check-in được nhé!
    const requiredFields = [
      "full_name",
      "phone",
      "email",
    ];

    checkRequiredFields(requiredFields, cleanedData, this, "checkinController");

    // Gọi Service cập nhật
    const result = await ServiceProcess.checkinService(cleanedData);

    // Trả về kết quả
    return new successRes.UpdateSuccess(
      result,
      `Check-in successful! Your queue number is ${result.queue_number}`
    ).send(res);

  } catch (error) {
    logger.error("Error during checkin", {
      context: "AppointmentController.checkinController", // ĐÃ SỬA đúng tên context
      message: error.message,
      stack: error.stack,
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
  updateStatusController,
  checkinController,
  staffCreateController
};
