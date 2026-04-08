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
        status: filter by status;
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

    const { data, pagination } =
      await ServiceProcess.getListService(queryParams);

    const paginationData = new Pagination({
      page: pagination.page,
      size: pagination.size,
      totalItems: pagination.totalItems,
    });

    return new successRes.GetListSuccess(
      data,
      paginationData,
      "Lấy danh sách lịch hẹn thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error get Appointment", {
      context: "AppointmentController.getListController",
      message: error.message,
      stack: error.stack,
    });
    // Trả về message tiếng Việt chung cho các lỗi hệ thống
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
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
const getListOfPatientControllerWithDate = async (req, res) => {
  try {
    const queryParams = req.query;
    const { account_id } = req.user;
    if (!account_id) {
      logger.warn("Missing account_id in token", {
        context: "AppointmentController.getListOfPatientController",
        account_id: account_id,
      });
      throw new errorRes.UnauthorizedError(
        "Token không hợp lệ: Thiếu thông tin tài khoản",
      );
    }

    logger.debug("Get list appointment of patient request received", {
      context: "AppointmentController.getListOfPatientController",
      query: queryParams,
      account_id: account_id,
    });

    const { data, pagination } =
      await ServiceProcess.getListOfPatientServiceWithDate(
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
      "Lấy danh sách lịch hẹn thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error get Appointment", {
      context: "AppointmentController.getListController",
      message: error.message,
      stack: error.stack,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
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
        "Token không hợp lệ: Thiếu thông tin tài khoản",
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
      "Lấy danh sách lịch hẹn thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error get Appointment", {
      context: "AppointmentController.getListController",
      message: error.message,
      stack: error.stack,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
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
        "Token không hợp lệ: Thiếu thông tin tài khoản",
      );
    }
    const { staff } = await findStaffByAccountId(accountDoctorId);
    if (!staff) {
      logger.warn("No staff profile found for account_id", {
        context: context,
        accountDoctorId: accountDoctorId,
      });
      throw new errorRes.UnauthorizedError(
        "Không tìm thấy hồ sơ nhân viên cho tài khoản này",
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
      "Lấy danh sách lịch hẹn thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error get list appointment of doctor", {
      context: "AppointmentController.getListOfDoctorController",
      message: error.message,
      stack: error.stack,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
  }
};

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
      throw new errorRes.BadRequestError("Mã lịch hẹn là bắt buộc");
    }

    // Gọi service xử lý logic
    const service = await ServiceProcess.getByIdService(id);
    return new successRes.GetDetailSuccess(
      service,
      "Lấy thông tin lịch hẹn thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error get appointment by id", {
      context: "AppointmentController.getByIdController",
      message: error.message,
      stack: error.stack,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
  }
};

// create new appointment by patient (có token)
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

    // Regex validation
    const regex = {
      fullName: /^[a-zA-ZÀ-ỹ\s]{2,50}$/,
      phone: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };

    if (!regex.fullName.test(cleanedData.full_name)) {
      throw new errorRes.BadRequestError("Họ tên không hợp lệ (2-50 ký tự, không chứa số)");
    }
    if (!regex.phone.test(cleanedData.phone)) {
      throw new errorRes.BadRequestError("Số điện thoại không hợp lệ");
    }
    if (!regex.email.test(cleanedData.email)) {
      throw new errorRes.BadRequestError("Định dạng email không hợp lệ");
    }
    // Validate mảng book_service nếu client có gửi kèm dịch vụ
    if (cleanedData.book_service && Array.isArray(cleanedData.book_service)) {
      cleanedData.book_service.forEach((item, index) => {
        if (!item.service_id || item.unit_price === undefined) {
          throw new errorRes.BadRequestError(
            `Dịch vụ tại vị trí thứ ${index + 1} bị thiếu mã dịch vụ (service_id) hoặc đơn giá (unit_price)`,
          );
        }
      });
    }
    // 2. Chuyển dữ liệu sang Service để xử lý logic nghiệp vụ
    cleanedData.priority = 1;
    const newAppointment = await ServiceProcess.createService(
      cleanedData,
      account_id,
    );
    if (!newAppointment) {
      logger.warn("Failed to create new appointment");
      throw new errorRes.BadRequestError("Tạo lịch hẹn mới thất bại.");
    }
    // 3. Trả về response
    return new successRes.CreateSuccess(newAppointment, "Tạo lịch hẹn thành công").send(res);
  } catch (error) {
    logger.error("Error create new appointment controller", {
      context: "appointmentController.createController",
      message: error.message,
    });
    if (error.statusCode) throw error; // Ném lỗi ra để middleware error handler tổng bắt lấy
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
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
            `Dịch vụ tại vị trí thứ ${index + 1} bị thiếu mã dịch vụ (service_id) hoặc đơn giá (unit_price)`,
          );
        }
      });
    }

    // check duplicate
    if (
      await ServiceProcess.checkDuplicateFullNameAndPhoneAndAppointDateAndAppointTime(
        cleanedData.full_name,
        cleanedData.phone,
        cleanedData.appointment_date,
        cleanedData.appointment_time,
      )
    ) {
      logger.warn("Appointment is existed.");
      throw new errorRes.ConflictError("Lịch hẹn đã tồn tại.");
    }

    // 2. Chuyển dữ liệu sang Service để xử lý logic nghiệp vụ
    const newAppointment = await ServiceProcess.staffCreateService(cleanedData);

    if (!newAppointment) {
      logger.warn("Failed to create new appointment", {
        context: "appointmentController.staffCreateController",
        data: cleanedData,
      });
      throw new errorRes.BadRequestError("Tạo lịch hẹn mới thất bại.");
    }

    logger.debug("New appointment created successfully", {
      context: "appointmentController.staffCreateController",
      newAppointment: newAppointment,
    });

    logger.info("New appointment created successfully", {
      context: "appointmentController.staffCreateController",
      appointmentId: newAppointment._id,
    });

    // 3. Trả về response
    return new successRes.CreateSuccess(
      newAppointment,
      "Tạo lịch hẹn thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error appointm create new appointment controller", {
      context: "appointmentController.staffCreateController",
      message: error.message,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
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
      throw new errorRes.BadRequestError("Không có dữ liệu để cập nhật");
    }

    // 2. Gọi Service thực hiện cập nhật
    const updateData = {
      appointment_date,
      appointment_time,
      reason,
    };

    const updated = await ServiceProcess.updateService(id, updateData);

    // Gửi response thành công
    return new successRes.UpdateSuccess(
      updated,
      "Cập nhật lịch hẹn thành công",
    ).send(res);
  } catch (error) {
    // Logging lỗi chi tiết để debug
    logger.error("Error update appointment controller", {
      context: "AppointmentController.updateController",
      message: error.message,
      stack: error.stack,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
  }
};

// Bệnh nhân yêu cầu dời lịch
const patientRequestUpdateController = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUpdate = req.body || {};

    const { appointment_date, appointment_time, reason } = dataUpdate;

    if (!appointment_date && !appointment_time && reason === undefined) {
      throw new errorRes.BadRequestError("Không có dữ liệu để cập nhật");
    }

    const updateData = {
      appointment_date,
      appointment_time,
      reason,
      userRole: "PATIENT", // Ép Role để service tự động đổi thành PENDING_CONFIRMATION và báo lễ tân
    };

    const updated = await ServiceProcess.updateService(id, updateData);

    return new successRes.UpdateSuccess(
      updated,
      "Yêu cầu dời lịch hẹn thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error patient update appointment controller", {
      context: "AppointmentController.patientRequestUpdateController",
      message: error.message,
      stack: error.stack,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
  }
};

/**
 * Calculate total amount from appointment
 * * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const calculateTotalAmountFromAppointment = async (req, res, next) => {
  const context = "AppointmentController.calculateTotalAmountFromAppointment";

  try {
    const { id: appointmentId } = req.params;
    let totalAmount = 0;
    if (!appointmentId) {
      logger.warn("Appointment ID is null or missing.", {
        context,
        appointment_id: appointmentId,
      });
      return new errorRes.NotFoundError("Mã lịch hẹn không được để trống.");
    }
    totalAmount = await ServiceProcess.calculateTotalAmount(appointmentId);
    return new successRes.GetDetailSuccess(
      { totalAmount: totalAmount },
      "Tính toán tổng tiền lịch hẹn thành công.",
    ).send(res);
  } catch (err) {
    logger.error("Error calculating total amount from appointment.", {
      context,
      error: err,
    });
    if (err.statusCode) throw err;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
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
      "NO_SHOW",
    ];

    if (!status || !validStatuses.includes(status)) {
      logger.warn("Invalid or missing status value", {
        context: "AppointmentController.updateStatusController",
        status: status,
        allowed: validStatuses,
      });
      throw new errorRes.BadRequestError(
        `Trạng thái không hợp lệ. Các giá trị cho phép: ${validStatuses.join(", ")}`,
      );
    }

    if (status === "IN_CONSULTATION") {
      if (!doctorId) {
        logger.warn("Missing doctorId for IN_CONSULTATION status", {
          context: "AppointmentController.updateStatusController",
          status: status,
        });
        throw new errorRes.BadRequestError(
          "Bắt buộc phải có mã bác sĩ (doctorId) khi trạng thái là Đang khám (IN_CONSULTATION)",
        );
      }
    }

    // 3. Gọi Service cập nhật
    const result = await ServiceProcess.updateStatusOnly(id, status, doctorId);

    // Kiểm tra kết quả
    if (!result) {
      throw new errorRes.NotFoundError(
        "Không tìm thấy lịch hẹn hoặc cập nhật thất bại",
      );
    }

    logger.info("Appointment status updated successfully", {
      context: "AppointmentController.updateStatusController",
      appointmentId: result._id,
      newStatus: result.status,
    });

    // 4. Trả về kết quả
    return new successRes.UpdateSuccess(
      result,
      "Cập nhật trạng thái lịch hẹn thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error updating appointment status", {
      context: "AppointmentController.updateStatusController",
      message: error.message,
      stack: error.stack,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
  }
};

/*
  Check-in by full_name, phone, email. 
  If correct, auto change status to CHECKED_IN and generate queue number.
*/
const checkinController = async (req, res) => {
  try {
    const query = req.body || {};
    const cleanedData = cleanObjectData(query);

    logger.debug("Checkin appointment request received", {
      context: "AppointmentController.checkinController",
      query: cleanedData,
    });

    const requiredFields = ["full_name", "phone", "email"];

    checkRequiredFields(requiredFields, cleanedData, this, "checkinController");

    // Gọi Service cập nhật
    const result = await ServiceProcess.checkinService(cleanedData);

    // Trả về kết quả
    return new successRes.UpdateSuccess(
      result,
      `Check-in thành công! Số thứ tự của bạn là ${result.queue_number}`,
    ).send(res);
  } catch (error) {
    logger.error("Error during checkin", {
      context: "AppointmentController.checkinController",
      message: error.message,
      stack: error.stack,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
  }
};

const getListAppointmentToPaymentController = async (req, res) => {
  const context = "AppointmentController.getListAppointmentToPaymentController";
  try {
    const queryParams = req.query;
    logger.debug("Get list appointment to payment request received", {
      context: context,
      query: queryParams,
    });
    const { data, pagination } = await ServiceProcess.getListAppointmentToPayment(queryParams);
    const paginationData = new Pagination({
      page: pagination.current_page,
      size: pagination.limit,
      totalItems: pagination.total_items,
    });
    return new successRes.GetListSuccess(
      data,
      paginationData,
      "Lấy danh sách lịch hẹn chờ thanh toán thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error get list appointment to payment", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    if (error.statusCode) throw error;
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
  }
};

module.exports = {
  getListOfPatientController,
  getListController,
  getByIdController,
  createController,
  updateController,
  patientRequestUpdateController,
  updateStatusController,
  checkinController,
  staffCreateController,
  getListOfPatientControllerWithDate,
  getListOfDoctorController,
  calculateTotalAmountFromAppointment,
  getListAppointmentToPaymentController
};