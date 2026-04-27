const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const successRes = require("../../../common/success");
const { cleanObjectData } = require("../../../common/utils/cleanObjectData");

const ServiceProcess = require("../services/treatment.service");
const dentalService = require("../services/dental.record.service");
const { checkRequiredFields } = require("../../../utils/checkRequiredFields");
const mongoose = require("mongoose");

/*
    get treatment by id
*/
const getByIdController = async (req, res) => {
  const context = "TreatmentController.getByIdController";
  try {
    const { id: treatmentId } = req.params;
    logger.debug("Get treatment by id request received", {
      context: context,
      treatmentId: treatmentId,
    });

    // check id empty
    if (!treatmentId) {
      logger.warn("Empty ID", {
        context: context,
        treatmentId: treatmentId,
      });
      throw new errorRes.BadRequestError("Mã điều trị là bắt buộc");
    }

    // Gọi service xử lý logic
    const service = await ServiceProcess.getByIdService(treatmentId);
    return new successRes.GetDetailSuccess(
      service,
      "Lấy thông tin điều trị thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error get treatment by id", {
      context: "TreatmentController.getByIdController",
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * create new treatment by dental record id and body must have appointment_id
 * - Lưu ý: Đây là controller dành cho việc tạo mới một treatment dựa trên một dental record đã tồn tại.
 * - Client sẽ gửi lên ID của dental record mà treatment này thuộc về, cùng với các thông tin cần thiết để tạo treatment.
 * - Controller sẽ lấy ID của dental record từ URL params, và các thông tin khác từ body request.
 * * @param {*} req
 * @param {*} res
 * @returns
 */
const createController = async (req, res) => {
  const context = "TreatmentController.createController";
  try {
    const { id: dentalRecordId } = req.params;
    logger.debug("Create treatment request received", {
      context: context,
      dentalRecordId: dentalRecordId,
      bodyData: req.body,
    });
    const cleanedData = cleanObjectData(req.body || {});
    if (!dentalRecordId) {
      throw new errorRes.BadRequestError("Mã bệnh án là bắt buộc trong URL");
    }

    /*
      Kiểm tra xem dental record có tồn tại không và có đang ở trạng thái IN_PROGRESS không
      - Nếu dental record không tồn tại, trả về lỗi NotFound
      - Nếu dental record tồn tại nhưng không ở trạng thái IN_PROGRESS, trả về lỗi BadRequest (vì chỉ có thể thêm treatment vào dental record đang tiến hành)
    */
    const dental = await dentalService.getDentalRecordById(dentalRecordId);
    if (!dental) {
      logger.warn("Dental record not found for given ID", {
        context,
        dentalRecordId,
      });
      throw new errorRes.NotFoundError("Không tìm thấy bệnh án");
    }
    if (dental.status !== "IN_PROGRESS") {
      logger.warn("Attempt to add treatment to a closed dental record", {
        context,
        dentalRecordId,
        status: dental.status,
        dental: dental,
      });
      throw new errorRes.BadRequestError(
        `Không thể thêm điều trị. Bệnh án hiện đang ở trạng thái ${dental.status}.`,
      );
    }
    cleanedData.record_id = dental._id;
    cleanedData.patient_id = dental.patient_id;

    /*
      nếu phase = SESSION, nếu là thực hiện luôn lần đầu chứ không phải là từ lần 2 thì lấy appointment_id ở trong dental
      Kiểm tra xem appointment có tồn tại không và có thuộc về cùng một bệnh nhân với dental record không
      - Nếu appointment không tồn tại, trả về lỗi NotFound
      - Nếu appointment tồn tại nhưng patient_id của appointment không khớp với patient_id của dental record, 
      trả về lỗi BadRequest (vì treatment phải liên quan đến một cuộc hẹn của cùng một bệnh nhân)
    */
    const requiredFields = ["record_id", "patient_id", "phase"];
    if (cleanedData.phase === "SESSION") {
      const appointmentService = require("../../appointment/services/appointment.service");
      const appointmentId = cleanedData.appointment_id || dental.appointment_id;
      const appointment = await appointmentService.findById(appointmentId);
      logger.debug("Fetched appointment for treatment creation", {
        context,
        appointmentId,
        appointment,
      });
      if (!appointment) {
        logger.warn("Appointment not found for given ID", {
          context,
          appointmentId: cleanedData.appointment_id,
        });
        throw new errorRes.NotFoundError("Không tìm thấy lịch hẹn");
      }
      if (String(appointment.patient_id) !== String(cleanedData.patient_id)) {
        logger.warn(
          "Appointment patient ID does not match dental record patient ID",
          {
            context,
            appointmentId: cleanedData.appointment_id,
            appointmentPatientId: appointment.patient_id,
            dentalRecordPatientId: cleanedData.patient_id,
          },
        );
        throw new errorRes.BadRequestError(
          "Lịch hẹn không thuộc cùng bệnh nhân với bệnh án",
        );
      }
      cleanedData.doctor_id = appointment.doctor_id;
      cleanedData.appointment_id = appointment._id;
      requiredFields.push("appointment_id");
    }

    logger.debug("Create new treatment request received", {
      context: context,
      requiredFields: requiredFields,
      dentalRecordId: dentalRecordId,
      bodyData: cleanedData,
    });

    checkRequiredFields(requiredFields, cleanedData, this, "createController");
    const newTreatment = await ServiceProcess.createService(cleanedData);
    if (!newTreatment) {
      logger.warn("Failed to create new treatment", {
        context,
        dentalRecordId,
      });
      throw new errorRes.BadRequestError("Tạo mới điều trị thất bại.");
    }
    logger.debug("New treatment created", {
      context: context,
      dentalRecordId: dentalRecordId,
      treatment: newTreatment,
    });
    logger.info("New treatment created successfully", {
      context,
      treatmentId: newTreatment._id,
      dentalRecordId: dentalRecordId,
    });
    return new successRes.CreateSuccess(
      newTreatment,
      "Tạo điều trị thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error create new treatment controller", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * update treatment by id
 * - Lưu ý: Controller này dành cho việc cập nhật thông tin của một treatment đã tồn tại.
 * @param {*} req
 * @param {*} res
 * @returns updated treatment object
 */
const updateController = async (req, res) => {
  const context = "TreatmentController.updateController";
  try {
    const { id: treatmentId } = req.params;
    const dataUpdate = req.body || {};
    logger.debug("Update treatment request received", {
      context: context,
      treatmentId: treatmentId,
      bodyData: dataUpdate,
    });
    // 1. Kiểm tra định dạng ID
    if (!mongoose.Types.ObjectId.isValid(treatmentId)) {
      throw new errorRes.BadRequestError("Định dạng mã điều trị không hợp lệ");
    }

    // Chỉ cho phép update những trường nội dung, cấm tuyệt đối cập nhật Khóa ngoại
    const allowedFields = [
      "tooth_position",
      "phase",
      "quantity",
      "planned_price",
      "planned_date",
      "performed_date",
      "result",
      "note",
      "medicine_usage",
      "status",
      "price",
    ];
    const safeData = {};
    for (const field of allowedFields) {
      if (dataUpdate[field] !== undefined) {
        safeData[field] = dataUpdate[field];
      }
    }
    const cleanedData = cleanObjectData(safeData);
    // 3. Kiểm tra xem có dữ liệu nào để update không
    if (Object.keys(cleanedData).length === 0) {
      throw new errorRes.BadRequestError("Không có dữ liệu hợp lệ để cập nhật");
    }

    // 4. Gọi Service
    const updated = await ServiceProcess.updateService(
      treatmentId,
      cleanedData,
    );

    return new successRes.UpdateSuccess(
      updated,
      "Cập nhật điều trị thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error update treatment", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * upate status of treatment
 * @param {*} req (status) mới và id của appointment cần cập nhật
 * @param {*} res
 * @returns {object} treatment đã được cập nhật
 */
const updateStatusController = async (req, res) => {
  const context = "TreatmentController.updateStatusController";
  try {
    // 1. Lấy ID của Appointment
    const { id } = req.params;
    const { status } = req.body || {};

    logger.debug("Update treatment status request received", {
      context: context,
      treatmentId: id,
      status: status,
    });

    // 2. Validate Status
    const validStatuses = [
      "PLANNED",
      "WAITING_APPROVAL",
      "APPROVED",
      "REJECTED",
      "IN_PROGRESS",
      "DONE",
      "CANCELLED",
    ];

    if (!status || !validStatuses.includes(status)) {
      logger.warn("Invalid or missing status value", {
        context: context,
        status: status,
        allowed: validStatuses,
      });
      throw new errorRes.BadRequestError(
        `Trạng thái không hợp lệ. Các giá trị cho phép: ${validStatuses.join(", ")}`,
      );
    }

    const result = await ServiceProcess.updateStatusOnly(id, status);

    // Kiểm tra kết quả
    if (!result) {
      throw new errorRes.NotFoundError("Không tìm thấy điều trị hoặc cập nhật thất bại");
    }

    logger.info("Treatment status updated successfully", {
      context: context,
      treatmentId: result._id,
      newStatus: result.status,
    });

    // 4. Trả về kết quả
    return new successRes.UpdateSuccess(
      result,
      "Cập nhật trạng thái điều trị thành công",
    ).send(res);
  } catch (error) {
    logger.error("Error updating treatment status", {
      context: context,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * get list treatment plan lte by date
 * (
 * search: search by full_name, phone, email;
 * status: filter by status;
 * filter_date: less than eq by date, default 3 day later;
 * sort: sort by appointment_date;
 * page
 * limit
 * )
 */
const getListTreatementWithAppointmentNull = async (req, res) => {
  const context = "TreatmentController.getListTreatement";
  try {
    const queryParams = req.query;
    // if null, default get 3 days later
    if (!queryParams.filter_date) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 6);

      queryParams.filter_date = targetDate;
    }
    logger.debug("Query filter.", {
      context: context,
      query: queryParams
    })
    const { data, pagination } = await ServiceProcess.getListTreatementWithAppointmentNull(queryParams);
    logger.debug("List treatment.", {
      context: context,
      data: data,
      pagination: pagination
    });
    return new successRes.GetListSuccess(data, pagination, "Lấy danh sách kế hoạch điều trị thành công.").send(res);
  } catch (error) {
    logger.error("Error cannot get list treatement", {
      context: context,
      error: error,
    });
    throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau");
  }
};

module.exports = {
  getByIdController,
  createController,
  updateController,
  updateStatusController,
  getListTreatementWithAppointmentNull,
};
