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

/*
    get list with infor (
        account: -password, -role_id, -email_verifiled, -__v
        profile: -status, -__v
    ) with pagination and filter 
    (
        search: search by name customer, ; 
        filter: filter by gender; 
        sort: sort by full_name
        page 
        limit
    )
*/
const getListController = async (req, res) => {
  try {
    const queryParams = req.query;
    logger.debug("Get services request received", {
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
      "Staff retrieved successfully",
    ).send(res);
  } catch (error) {
    logger.error("Error get staffs", {
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
      "Staff retrieved successfully",
    ).send(res);
  } catch (error) {
    logger.error("Error get staffs", {
      context: "AppointmentController.getListController",
      message: error.message,
      stack: error.stack,
    });
    throw error;
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
    logger.error("Error update staff", {
      context: "AppointmentController.updateController",
      message: error.message,
      stack: error.stack, // Nên log thêm stack trace để dễ sửa lỗi
    });
    throw error;
  }
};

// update equipment status only
const updateStatusController = async (req, res) => {
  try {
    // 1. Lấy ID (Giả định đây là accountId)
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
        `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      );
    }

    // 3. Gọi Service cập nhật
    // Lưu ý: updateService trả về object chứa { account, profile, staff, license }
    const result = await ServiceProcess.updateStaffStatusOnly(accountId, {
      status,
    });

    // Kiểm tra kết quả
    if (!result || !result.staff) {
      throw new errorRes.NotFoundError("Staff not found");
    }

    logger.info("Staff status updated successfully", {
      context: "AppointmentController.updateStatusController",
      staffId: result.staff._id,
      newStatus: result.staff.status,
    });

    // 4. Trả về kết quả
    return new successRes.UpdateSuccess(
      result,
      "Staff status updated successfully",
    ).send(res);
  } catch (error) {
    logger.error("Error update staff status", {
      context: "AppointmentController.updateStatusController",
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
};
