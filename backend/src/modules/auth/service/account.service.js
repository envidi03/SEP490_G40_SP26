const AccountModel = require('../models/account.model');
const ProfileModel = require("../models/profile.model");
const PatientModel = require("../../../modules/patient/model/patient.model");
const { Staff: StaffModel } = require("../../../modules/staff/models/index.model");

const checkAccountId = async(accountId) => {
    if (!(accountId || await AccountModel.findById(accountId))) return null;
}

const findStaffByAccountId = async (accountId) => {
    checkAccountId(accountId);
    return await StaffModel.findOne({ account_id: accountId });
};

const findPatientByAccountId = async (accountId) => {
    checkAccountId(accountId);
    return await PatientModel.findOne({account_id: accountId});
};

const findProfileByAccountId = async (accountId) => {
    checkAccountId(accountId);
    return await ProfileModel.findOne({account_id: accountId});
};

module.exports = {
    findStaffByAccountId,
    findPatientByAccountId,
    findProfileByAccountId
};