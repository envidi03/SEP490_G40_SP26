const mongoose = require("mongoose");
const errorRes = require("../../../common/errors");
const { Account, Profile } = require("../models/index.model");

const updateProfileService = async (accountId, payload = {}) => {
  if (!accountId) {
    throw new errorRes.UnauthorizedError("Unauthorized");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const profile = await Profile.findOne({ account_id: accountId }).session(session);

    if (!profile) {
      throw new errorRes.NotFoundError("Profile not found");
    }

    const account = await Account.findById(accountId).session(session);

    if (!account) {
      throw new errorRes.NotFoundError("Account not found");
    }

    // update profile fields
    const profileFields = ["full_name", "gender", "address", "avatar_url"];

    profileFields.forEach(field => {
      if (payload[field] !== undefined) {
        profile[field] = payload[field];
      }
    });

    // Validate dob
    if (payload.dob) {
      const dobDate = new Date(payload.dob);

      if (isNaN(dobDate.getTime())) {
        throw new errorRes.BadRequestError("Invalid date of birth format");
      }

      if (dobDate > new Date()) {
        throw new errorRes.BadRequestError("Date of birth cannot be in the future");
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
        throw new errorRes.BadRequestError("Email already exists");
      }

      account.email = payload.email;
    }

    if (payload.phone !== undefined) {
      account.phone = payload.phone;
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
    throw error;
  }
};

const getProfileService = async (accountId) => {
  if (!accountId) {
    throw new errorRes.UnauthorizedError("Unauthorized");
  }

  const profile = await Profile.findOne({ account_id: accountId })
    .populate("account_id", "-password -refresh_token");

  if (!profile) {
    throw new errorRes.NotFoundError("Profile not found");
  }

  return profile;
};

module.exports = {
  updateProfileService,
  getProfileService
};