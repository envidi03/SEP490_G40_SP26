const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");
const Pagination = require("../../../common/responses/Pagination");

const StaffModel = require("../../staff/models/staff.model");
const DentalRecordModel = require("../models/dental-record.model");
require("../../patient/model/patient.model");

const createDentalRecordService = async (accountId, payload) => {
  const staff = await StaffModel.findOne({ account_id: accountId });

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

const editDentalRecordService = async (accountId, recordId, payload = {}) => {
  const staff = await StaffModel.findOne({ account_id: accountId });
  if (!staff) throw new errorRes.NotFoundError("Staff not found");

  const record = await DentalRecordModel.findOne({
    _id: recordId,
    created_by: staff._id,
  });

  if (!record) {
    throw new errorRes.NotFoundError("Dental record not found");
  }

  if (
    payload.start_date &&
    payload.end_date &&
    new Date(payload.start_date) > new Date(payload.end_date)
  ) {
    throw new errorRes.BadRequestError("End date must be after start date");
  }

  Object.assign(record, payload);

  await record.save();

  return record;
};

const getDentalRecordsService = async (accountId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;

  const staff = await StaffModel.findOne({ account_id: accountId });
  if (!staff) throw new errorRes.NotFoundError("Staff not found");

  const filter = { created_by: staff._id };

  if (query.patient_id) {
    filter.patient_id = query.patient_id;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const total = await DentalRecordModel.countDocuments(filter);

  const data = await DentalRecordModel.find(filter)
    .populate("patient_id")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    page,
    size: limit,
    totalItems: total,
    totalPages: Math.ceil(total / limit),
    data,
  };
};

module.exports = { 
    createDentalRecordService, 
    editDentalRecordService,
    getDentalRecordsService
};