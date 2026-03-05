const AccountModel = require('../models/account.model');
const ProfileModel = require("../models/profile.model");
const PatientModel = require("../../../modules/patient/model/patient.model");
const { Staff: StaffModel } = require("../../../modules/staff/models/index.model");
const logger = require('../../../common/utils/logger');

/**
 * find account by id
 * @param {ObjectId} id account id user
 * @returns account object if found, otherwise null
 */
const findAccountById = async (id) => {
    const context = "AccountService.findAccountById";
    if (!id) return null;
    try {
        const account = await AccountModel.findById(id).lean();
        logger.debug("Data from DB", {
            context: context,
            accountId: id,
            account: account
        });
        return account;
    } catch (error) {
        logger.debug("Error get account by id", {
            context: context,
            error: error,
            accountId: id
        });
        return null;
    }
}

/**
 * Find a staff member by their account ID
 * @param {'ObjectId'} accountId account id user 
 * @returns obejct {account, staff, profile} if found, otherwise null
 */
const findStaffByAccountId = async (accountId) => {
    const context = "AccountService.findStaffByAccountId";
    try {
        const account = await findAccountById(accountId);
        const staff = await StaffModel.findOne({ account_id: accountId });
        const profile = await ProfileModel.findOne({ account_id: accountId });

        logger.debug("Data from DB", {
            context: context,
            accountId: accountId,
            account: account,
            staff: staff,
            profile: profile
        });

        return {account, staff, profile};
    } catch (error) {
        logger.debug("Error get account by id", {
            context: context,
            error: error,
            accountId: accountId
        });
        return null;
    }
};

/**
 * Find a patient by their account ID
 * @param {'ObjectId'} accountId account id user 
 * @returns obejct {account, patient, profile} if found, otherwise null
 */
const findPatientByAccountId = async (accountId) => {
    const context = "AccountService.findPatientByAccountId";
    try {
        const account = await findAccountById(accountId);
        const patient = await PatientModel.findOne({ account_id: accountId });
        const profile = await ProfileModel.findOne({ account_id: accountId });

        logger.debug("Data from DB", {
            context: context,
            accountId: accountId,
            account: account,
            patient: patient,
            profile: profile
        });
        
        return {account, patient, profile}
    } catch (error) {
        logger.debug("Error get account by id", {
            context: context,
            error: error,
            accountId: accountId
        });
        return null;
    }
};

module.exports = {
    findStaffByAccountId,
    findPatientByAccountId,
    findAccountById
};