const {Role: RoleModel, Account: AccountModel, Profile: ProfileModel } = require('../models/index.model');
const PatientModel = require("../../../modules/patient/model/patient.model");
const { Staff: StaffModel } = require("../../../modules/staff/models/index.model");
const logger = require('../../../common/utils/logger');

/**
 * find account by id
 * @param {ObjectId} id account id user
 * @returns object {account} if found, otherwise null
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
 * Find a role by account ID
 * 
 * @param {'ObjectId'} accountId account id user
 * @returns object {role} if found, otherwise null
 */
const findRoleByAccountId = async (accountId) => {
    const context = "AccountService.findRoleByAccountId";
    try {
        const account = await findAccountById(accountId);
        if (!account) {
            logger.debug("Account not found", {
                context: context,
                accountId: accountId
            });
            return null;
        }
        const role = await RoleModel.findById(account.role_id).lean();
        logger.debug("Data from DB", {
            context: context,
            accountId: accountId,
            role: role
        });
        return role;
    } catch (error) {
        logger.debug("Error get role by account id", {
            context: context,
            error: error,
            accountId: accountId
        });
        return null;
    }
}
/**
 * Find a staff member by their account ID
 * 
 * @param {'ObjectId'} accountId account id user 
 * @returns obejct {account, staff, profile, role} if found, otherwise null
 */
const findStaffByAccountId = async (accountId) => {
    const context = "AccountService.findStaffByAccountId";
    try {
        const account = await findAccountById(accountId);
        const staff = await StaffModel.findOne({ account_id: accountId });
        const profile = await ProfileModel.findOne({ account_id: accountId });
        const role = await findRoleByAccountId(accountId);

        logger.debug("Data from DB", {
            context: context,
            accountId: accountId,
            account: account,
            staff: staff,
            profile: profile,
            role: role
        });

        return {account, staff, profile, role};
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
 * 
 * @param {'ObjectId'} accountId account id user 
 * @returns obejct {account, patient, profile, role} if found, otherwise null
 */
const findPatientByAccountId = async (accountId) => {
    const context = "AccountService.findPatientByAccountId";
    try {
        const account = await findAccountById(accountId);
        const patient = await PatientModel.findOne({ account_id: accountId });
        const profile = await ProfileModel.findOne({ account_id: accountId });
        const role = await findRoleByAccountId(accountId);

        logger.debug("Data from DB", {
            context: context,
            accountId: accountId,
            account: account,
            patient: patient,
            profile: profile,
            role: role
        });
        return {account, patient, profile, role};
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
    findAccountById, 
    findRoleByAccountId
};