const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");

const model = require("../models/index.model");
const {service: AppointmentService} = require("./../../appointment/index");

/**
 * get treatment by id populate medicine_usage.medicine_id
 * @param {ObjectId} id Treatment ID to find
 * @returns return treatment object if found, otherwise throw NotFoundError
 * @throws NotFoundError if treatment with given ID is not found
 * @throws InternalServerError if any error occurs during database operation
 * @description This function retrieves a treatment by its ID. It validates the ID format, checks if the treatment exists, and returns the treatment data. If the treatment is not found or if any error occurs, it throws appropriate errors.
 */
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

const createService = async (dataCreate) => {
    const context = "TreatmentService.createService";
    try {
        logger.debug("Raw data to create treatment", {
            context: context,
            dataCreate: dataCreate,
        });

        const newData = await model.Treatment.create(dataCreate);
        return newData;
    } catch (error) {
        logger.error("Error at create new treatment.", { 
            context: context, 
            message: error.message,
            stack: error.stack,
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`Error creating treatment: ${error.message}`);
    }
};

/**
 * update treatment by id
 * @param {*} treatmentId id of treatment to update
 * @param {*} data data to update, excluding 'status' and foreign keys
 */
const updateService = async (treatmentId, data) => {
    const context = "TreatmentService.updateService";
    try {
        logger.debug("Raw data to update treatment", {
            context: context,
            treatmentId: treatmentId,
            data: data,
        });

        const existingTreatment = await findById(treatmentId);
        if (!existingTreatment) {
            throw new errorRes.NotFoundError("Treatment not found");
        }

        if (existingTreatment.status === 'DONE' || existingTreatment.status === 'CANCELLED') {
            throw new errorRes.BadRequestError(`Cannot update treatment because it is already ${existingTreatment.status}`);
        }

        const dataUpdate = await model.Treatment.findByIdAndUpdate(
            treatmentId, 
            data, 
            { new: true, runValidators: true } 
        );

        return dataUpdate;

    } catch (error) {
        logger.error("Error at update treatment.", { 
            context: context, 
            treatmentId: treatmentId,
            message: error.message,
            stack: error.stack,
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`Error updating treatment: ${error.message}`);
    }
};
/**
 * get data raw treatment by id
 * @param {ObjectId} id treatment id to find
 * @returns treatment object or null if not found
 */
const findById = async (id) => {
    try {
        const data = await model.Treatment.findById(id);
        return data || null;
    } catch (error) {
        logger.error("Error finding treatment by id", {
            context: "TreatmentService.findById",
            treatmentId: id,
            message: error.message,
            stack: error.stack,
        });
        return null;
    }
}

/**
 * Update only status of treatment - cannot update status if current status is CANCELLED or DONE
 * @param {ObjectId} id treatment id to find
 * @param {string} status the new status to set
 * @returns treatment object or null if not found
 */
const updateStatusOnly = async (id, status) => {
    try {
        const treatment = await findById(id);
        if (!treatment) {
            throw new errorRes.NotFoundError("Treatment not found");
        }
        if (treatment.status === status) {
            return treatment; 
        }
        if (treatment.status === 'CANCELLED' || treatment.status === 'DONE') {
            throw new errorRes.BadRequestError(`Cannot change status from ${treatment.status}`);
        }

        if (status === "DONE") {
            const appoint = await AppointmentService.findByTreatmentId(treatment._id);
            if (!appoint) {
                logger.warn("Appointment not found by treatment", {
                    context: "TreatmentService.updateStatusOnly",
                    treatment: treatment
                });
                throw new errorRes.NotFoundError("Không tìm thấy lịch khám để cập nhật.")
            }
            await AppointmentService.updateStatusOnly(appoint._id, "COMPLETED");
        }

        const newData = await model.Treatment.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        ).populate('patient_id', 'full_name');

        // Gửi thông báo cho Dược sĩ nếu Ca khám đã XONG và Bác sĩ có kê đơn thuốc
        if (status === 'DONE' && newData.medicine_usage && newData.medicine_usage.length > 0) {
            try {
                const notificationService = require('../../notification/service/notification.service');
                const patientName = newData.patient_id?.full_name || 'Khách hàng';
                await notificationService.sendToRole(['PHARMACIST'], {
                    type: 'NEW_PRESCRIPTION',
                    title: 'Đơn thuốc mới cần chuẩn bị',
                    message: `Bác sĩ vừa kê đơn thuốc mới cho bệnh nhân ${patientName}. Vui lòng kiểm tra và chuẩn bị thuốc.`,
                    action_url: `/pharmacy/prescriptions`
                });
            } catch (err) {
                logger.error("Lỗi gửi thông báo Đơn thuốc mới cho Dược sĩ:", { message: err.message });
            }
        }

        return newData;
    } catch (error) {
        logger.error("Error updating treatment status.", {
            context: "TreatmentService.updateStatusOnly",
            treatmentId: id,
            status: status,
            message: error.message
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`Update fails: ${error.message}`);
    }
};

module.exports = {
    getByIdService,
    createService,
    updateService,
    updateStatusOnly,
};
