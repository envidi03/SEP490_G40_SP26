const mongoose = require("mongoose");
const errorRes = require("../../../common/errors");
const { Account, Profile } = require("../models/index.model");

const updateProfileService = async (accountId, payload = {}) => {
  if (!accountId) {
    throw new errorRes.UnauthorizedError("Bạn chưa đăng nhập hoặc không có quyền thực hiện thao tác này.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const profile = await Profile.findOne({ account_id: accountId }).session(session);

    if (!profile) {
      throw new errorRes.NotFoundError("Không tìm thấy thông tin hồ sơ người dùng.");
    }

    const account = await Account.findById(accountId).session(session);

    if (!account) {
      throw new errorRes.NotFoundError("Không tìm thấy thông tin tài khoản.");
    }

    // update profile fields
    const profileFields = ["full_name", "gender", "address", "avatar_url", "phone"];

    profileFields.forEach(field => {
      if (payload[field] !== undefined) {
        profile[field] = payload[field];
      }
    });

    // Validate dob
    if (payload.dob) {
      const dobDate = new Date(payload.dob);

      if (isNaN(dobDate.getTime())) {
        throw new errorRes.BadRequestError("Định dạng ngày sinh không hợp lệ.");
      }

      if (dobDate > new Date()) {
        throw new errorRes.BadRequestError("Ngày sinh không được lớn hơn ngày hiện tại.");
      }

      profile.dob = dobDate;
    }

    // update account fields
    if (payload.email !== undefined) {
      // Check email duplicate
      const existingEmail = await Account.findOne({
        email: payload.email,
        _id: { $ne: accountId }
      });

      if (existingEmail) {
        throw new errorRes.BadRequestError("Email này đã được sử dụng bởi một tài khoản khác.");
      }

      account.email = payload.email;
    }

    if (payload.phone !== undefined) {
      account.phone_number = payload.phone;
    }

    await profile.save({ session });
    await account.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      ...profile.toObject(),
      account_id: account
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Ném lỗi gốc ra để Global Error Handler xử lý (ẩn lỗi 500 thành "Hệ thống lỗi vui lòng thực hiện sau")
    throw error; 
  }
};

const getProfileService = async (accountId) => {
  if (!accountId) {
    throw new errorRes.UnauthorizedError("Bạn chưa đăng nhập hoặc không có quyền thực hiện thao tác này.");
  }

  const profile = await Profile.findOne({ account_id: accountId })
    .populate({
      path: "account_id",
      select: "-password -refresh_token",
      populate: { path: "role_id", select: "name" }
    });

  if (!profile) {
    throw new errorRes.NotFoundError("Không tìm thấy thông tin hồ sơ người dùng.");
  }

  // Nếu là bệnh nhân (PATIENT), lấy thêm patient_id để dùng khi lọc hóa đơn
  const result = profile.toObject();
  const logger = require('../../../common/utils/logger');
  
  const roleName = profile.account_id?.role_id?.name;
  
  // Giữ nguyên log tiếng Anh cho Developer
  logger.debug('Profile role check', {
    hasAccountId: !!profile.account_id,
    roleName: roleName,
    isPatient: roleName === 'PATIENT'
  });

  if (roleName === 'PATIENT') {
    const PatientModel = require('../../patient/model/patient.model');
    const patient = await PatientModel.findOne({ account_id: accountId }).select('_id').lean();
    
    // Giữ nguyên log tiếng Anh cho Developer
    logger.debug('Patient lookup result', {
      accountId,
      foundPatient: !!patient,
      patientId: patient?._id
    });

    if (patient) {
      result.patient_id = patient._id;
    }
  } else if (['DOCTOR', 'RECEPTIONIST', 'PHARMACIST', 'PHARMACY', 'ASSISTANT', 'ADMIN_CLINIC'].includes(roleName)) {
    const StaffModel = require('../../staff/models/staff.model');
    const staff = await StaffModel.Staff.findOne({ account_id: accountId }).lean();
    if (staff) {
      result.staff_id = staff._id;
      result.degree = staff.degree;
      result.education = staff.education;
      result.note = staff.note;
      result.work_start = staff.work_start;
      result.work_end = staff.work_end;
    }
  }

  return result;
};

module.exports = {
  updateProfileService,
  getProfileService
};