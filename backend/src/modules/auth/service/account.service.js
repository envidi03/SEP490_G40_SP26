const { Role: RoleModel, Account: AccountModel, Profile: ProfileModel } = require('../models/index.model');
const PatientModel = require("../../../modules/patient/model/patient.model");
const { Staff: StaffModel } = require("../../../modules/staff/models/index.model");
const logger = require('../../../common/utils/logger');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');

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

        return { account, staff, profile, role };
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
        return { account, patient, profile, role };
    } catch (error) {
        logger.debug("Error get account by id", {
            context: context,
            error: error,
            accountId: accountId
        });
        return null;
    }
};

const findAccountByPhone = async (phone) => {
    const context = "AccountService.findAccountByPhone";
    try {
        const account = await AccountModel.findOne({
            phone_number: phone
        }).lean();

        logger.debug("Account found successfully", {
            context: context,
            phone: phone,
            account: account
        });

        return account;
    } catch (error) {
        logger.error("Error getting account by phone", {
            context: context,
            error: error.message,
            phone: phone
        });
        return null;
    }
};

const createAccount = async (accountData, session) => {
    const context = "AccountService.createAccount";
    try {
        const newAccount = new AccountModel(accountData);
        // Truyền session vào hàm save()
        const savedAccount = await newAccount.save({ session });
        logger.debug("Account created successfully", {
            context: context,
            accountData: accountData,
            savedAccount: savedAccount
        });
        return savedAccount;
    } catch (error) {
        logger.error("Error creating account", {
            context: context,
            error: error.message,
            accountData: accountData
        });
        throw error;
    }
};

const createProfile = async (profileData, session) => {
    const context = "AccountService.createProfile";
    try {
        const newProfile = new ProfileModel(profileData);
        const savedProfile = await newProfile.save({ session });
        logger.debug("Profile created successfully", {
            context: context,
            profileData: profileData,
            savedProfile: savedProfile
        });
        return savedProfile;
    } catch (error) {
        logger.error("Error creating profile", {
            context: context,
            error: error.message,
            profileData: profileData
        });
        throw error;
    }
};

const createPatient = async (patientData, session) => {
    const context = "AccountService.createPatient";
    try {
        const newPatient = new PatientModel(patientData);
        const savedPatient = await newPatient.save({ session });
        logger.debug("Patient created successfully", {
            context: context,
            patientData: patientData,
            savedPatient: savedPatient
        });
        return savedPatient;
    } catch (error) {
        logger.error("Error creating patient", {
            context: context,
            error: error.message,
            patientData: patientData
        });
        throw error;
    }
};

const createPatientFromUserProfile = async (full_name, phone) => {
    const context = "AccountService.createPatientFromUserProfile";

    // 1. Khởi tạo session và bắt đầu transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const hashPassword = await bcryptjs.hash(phone, 10);
        const role = await RoleModel.findOne({ name: "PATIENT" }).session(session);
        const roleId = role._id;
        const accountSaved = await createAccount({
            username: phone,
            full_name: full_name,
            phone_number: phone,
            password: hashPassword,
            email_verified: true,
            role_id: roleId,
            status: "ACTIVE"
        }, session);

        const profileSaved = await createProfile({
            account_id: accountSaved._id,
            full_name: full_name,
            status: "ACTIVE"
        }, session);

        const patientSaved = await createPatient({
            account_id: accountSaved._id,
            profile_id: profileSaved._id,
            status: "active"
        }, session);

        await session.commitTransaction();

        return patientSaved;
    } catch (error) {
        await session.abortTransaction();
        logger.error("Error creating account from appointment", {
            context: context,
            error: error.message,
            accountData: { full_name, email, phone }
        });
        throw error;
    } finally {
        session.endSession();
    }
};

module.exports = {
    findStaffByAccountId,
    findPatientByAccountId,
    findAccountById,
    findRoleByAccountId,
    createAccount,
    createProfile,
    createPatient,
    createPatientFromUserProfile,
    findAccountByPhone
};