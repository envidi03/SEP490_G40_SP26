const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const successRes = require("../../../common/success");
const { cleanObjectData } = require("../../../common/utils/cleanObjectData");
const Pagination = require("../../../common/responses/Pagination");
const {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} = require("../../../utils/cloudinaryHelper");

const ServiceProcess = require("../services/appointment.service");
const { checkRequiredFields } = require("../../../utils/checkRequiredFields");
const { findStaffByAccountId } = require("../../auth/service/account.service");

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
const getListOfPatientController = async (req, res) => {
  try {
    const queryParams = req.query;
    const { account_id } = req.user;
    if (!account_id) {
      logger.warn("Missing account_id in token", {
        context: "AppointmentController.getListOfPatientController",
        account_id: account_id,
      });
      throw new errorRes.UnauthorizedError(
        "Invalid token: account_id is missing",
      );
    }

    logger.debug("Get list appointment of patient request received", {
      context: "AppointmentController.getListOfPatientController",
      query: queryParams,
      account_id: account_id,
    });

    const { data, pagination } = await ServiceProcess.getListOfPatientService(
      queryParams,
      account_id,
    );

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
 * get list appointment of doctor with pagination and filter
 * (
     search: search by full_name, phone, email;
     filter: filter by status;
     sort: sort by appointment_date;
     page
     limit
 )
 only get appointment with account_id of doctor
 * @param {*} req 
 * @param {*} res 
 */
const getListOfDoctorController = async (req, res) => {
  const context = "AppointmentController.getListOfDoctorController";
  try {
    const queryParams = req.query;
    const { account_id: accountDoctorId } = req.user;
    if (!accountDoctorId) {
      logger.warn("Missing account_id in token", {
        context: context,
        accountDoctorId: accountDoctorId,
        queryParams: queryParams,
      });
      throw new errorRes.UnauthorizedError(
        "Invalid token: account_id is missing",
      );
    }
    const { staff } = await findStaffByAccountId(accountDoctorId);
    if (!staff) {
      logger.warn("No staff profile found for account_id", {
        context: context,
        accountDoctorId: accountDoctorId,
      });
      throw new errorRes.UnauthorizedError(
        "No staff profile found for this account",
      );
    }

    const { data, pagination } = await ServiceProcess.getListService(
      queryParams,
      staff._id,
    );

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
    logger.error("Error get list appointment of doctor", {
      context: "AppointmentController.getListOfDoctorController",
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/*
    get appointment by id
*/
const getByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    logger.debug("Get appointment by id request received", {
      context: "AppointmentController.getByIdController",
      appointmentId: id,
    });

    // check id empty
    if (!id) {
      logger.warn("Empty ID", {
        context: "AppointmentController.getByIdController",
        appointmentId: id,
      });
      throw new errorRes.BadRequestError("Appointment ID is required");
    }

    // Gọi service xử lý logic
    const service = await ServiceProcess.getByIdService(id);
    return new successRes.GetDetailSuccess(
      service,
      "Appointment retrieved successfully",
    ).send(res);
  } catch (error) {
    logger.error("Error get appointment by id", {
      context: "AppointmentController.getByIdController",
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const createController = async (req, res) => {
  try {
    const dataCreate = req.body || {};
    const cleanedData = cleanObjectData(dataCreate);

    // Lấy user_id từ token để gán làm người đặt lịch (patient_id)
    const { account_id } = req.user;

    // 1. Khai báo các fields bắt buộc dựa theo Schema
    const requiredFields = [
      "full_name",
      "phone",
      "email",
      "appointment_date",
      "appointment_time",
    ];

    // Kiểm tra validation cơ bản
    checkRequiredFields(requiredFields, cleanedData, this, "createController");
    // Validate mảng book_service nếu client có gửi kèm dịch vụ
    if (cleanedData.book_service && Array.isArray(cleanedData.book_service)) {
      cleanedData.book_service.forEach((item, index) => {
        if (!item.service_id || item.unit_price === undefined) {
          throw new Error(
            `service at the index ${index + 1} is missing service_id or unit_price`,
          );
        }
      });
    }
    // 2. Chuyển dữ liệu sang Service để xử lý logic nghiệp vụ
    const newAppointment = await ServiceProcess.createService(
      cleanedData,
      account_id,
    );
    if (!newAppointment) {
      logger.warn("Failed to create new appointment");
      throw new errorRes.BadRequestError("Create new appointment fails.")
    }
    // 3. Trả về response
    return new successRes.CreateSuccess(newAppointment).send(res);
  } catch (error) {
    logger.error("Error create new appointment controller", {
      context: "appointmentController.createController",
      message: error.message,
    });
    throw error; // Ném lỗi ra để middleware error handler tổng bắt lấy
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
// Cập nhật thông tin lịch hẹn (ngày, giờ, lý do)
const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUpdate = req.body || {};

    // 1. Chỉ lấy các trường cho phép
    const { appointment_date, appointment_time, reason } = dataUpdate;

    // Kiểm tra xem có dữ liệu nào để update không
    if (!appointment_date && !appointment_time && reason === undefined) {
      throw new errorRes.BadRequestError("No data provided for update");
    }

    const updateData = {
      appointment_date,
      appointment_time,
      reason
    };

    // 2. Gọi Service thực hiện cập nhật
    const updated = await ServiceProcess.updateService(id, updateData);

    // Gửi response thành công
    return new successRes.UpdateSuccess(updated, "Appointment updated successfully").send(res);
  } catch (error) {
    // Logging lỗi chi tiết để debug
    logger.error("Error update appointment controller", {
      context: "AppointmentController.updateController",
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * update appointment status only 
 * - Chỉ cập nhật trường status, không thay đổi các thông tin khác của appointment
 * - Kiểm tra tính hợp lệ của status mới (phải nằm trong danh sách các trạng thái cho phép)
 * - Nếu status mới là "IN_CONSULTATION", bắt buộc phải có doctorId để gán bác sĩ đang khám bệnh nhân này
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateStatusController = async (req, res) => {
  try {
    // 1. Lấy ID của Appointment
    const { id } = req.params;
    const { status, doctorId } = req.body || {};

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

    if (status === "IN_CONSULTATION") {
      if (!doctorId) {
        logger.warn("Missing doctorId for IN_CONSULTATION status", {
          context: "AppointmentController.updateStatusController",
          status: status,
        });
        throw new errorRes.BadRequestError(
          "doctorId is required when status is IN_CONSULTATION"
        );
      }

    }

    // 3. Gọi Service cập nhật (Đã sửa lỗi: truyền trực tiếp biến status dạng chuỗi)
    const result = await ServiceProcess.updateStatusOnly(id, status, doctorId);

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
  Check-in by full_name, phone, email. 
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
  getListController,
  getByIdController,
  createController,
  updateController,
  updateStatusController,
  checkinController,
  staffCreateController,
  getListOfDoctorController
};