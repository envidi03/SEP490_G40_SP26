const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const Pagination = require('../../../common/responses/Pagination');

const ServiceProcess = require('../services/dental.record.service');

const createDentalRecordController = async (req, res) => {
  try {
    const accountId = req.user.account_id;

    const result = await ServiceProcess.createDentalRecordService(
      accountId,
      req.body
    );

    return new successRes.CreateSuccess(
      result,
      "Create dental record successfully"
    ).send(res);

  } catch (error) {
    logger.error("Create dental record error", {
      context: "DentalRecordController.createDentalRecordController",
      message: error.message,
    });
    throw error;
  }
};

const editDentalRecordController = async (req, res) => {
  try {
    const accountId = req.user.account_id;
    const { id } = req.params;

    const result = await ServiceProcess.editDentalRecordService(
      accountId,
      id,
      req.body
    );

    return new successRes.UpdateSuccess(
      result,
      "Update dental record successfully"
    ).send(res);

  } catch (error) {
    logger.error("Edit dental record error", {
      context: "DentalRecordController.editDentalRecordController",
      message: error.message,
    });
    throw error;
  }
};

const getDentalRecordsController = async (req, res) => {
  try {
    const accountId = req.user.account_id;

    const result = await ServiceProcess.getDentalRecordsService(
      accountId,
      req.query
    );

    return new successRes.Success(result).send(res);

  } catch (error) {
    logger.error("Get dental records error", {
      context: "DentalRecordController.getDentalRecordsController",
      message: error.message,
    });
    throw error;
  }
};

module.exports = {
  createDentalRecordController,
  editDentalRecordController,
  getDentalRecordsController,
};