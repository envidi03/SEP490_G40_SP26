const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");

const model = require("../models/index.model");

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


const updateService = async (accountId, data) => {
    
};

/**
 * find treatment by id
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
 * Update only status of treatment - cannot update status if current status is CANCELLED or APPROVED
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
        if (treatment.status === 'CANCELLED' || treatment.status === 'APPROVED') {
            throw new errorRes.BadRequestError(`Cannot change status from ${treatment.status}`);
        }
        const newData = await model.Treatment.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );
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
