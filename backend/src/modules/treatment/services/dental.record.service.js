const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");
const Pagination = require("../../../common/responses/Pagination");

const StaffModel = require("../models/index.model");
const DentalRecordModel = require("../models/dental-record.model");

const createDentalRecordService = async (accountId, payload) => {
  const staff = await StaffModel.Staff.findOne({ account_id: accountId });

  if (!staff) throw new errorRes.NotFoundError("Staff not found");

  if (!payload.patient_id) {
    throw new errorRes.BadRequestError("Patient is required");
  }

  if (payload.end_date && new Date(payload.start_date) > new Date(payload.end_date)) {
    throw new errorRes.BadRequestError("End date must be after start date");
  }

  const record = await DentalRecordModel.create({
    ...payload,
    created_by: staff._id,
  });

  return record;
};

module.exports = { createDentalRecordService };