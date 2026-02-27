const Profile = require("../models/profile.model");
const errorRes = require("../../../common/errors");

const updateProfileService = async (accountId, payload = {}) => {
  if (!accountId) {
    throw new errorRes.UnauthorizedError("Unauthorized");
  }

  const profile = await Profile.findOne({ account_id: accountId });

  if (!profile) {
    throw new errorRes.NotFoundError("Profile not found");
  }

  // Không cho sửa account_id
  delete payload.account_id;

  // Validate dob nếu có gửi lên
  if (payload.dob) {
    const dobDate = new Date(payload.dob);

    if (isNaN(dobDate.getTime())) {
      throw new errorRes.BadRequestError("Invalid date of birth format");
    }

    if (dobDate > new Date()) {
      throw new errorRes.BadRequestError(
        "Date of birth cannot be in the future"
      );
    }

    payload.dob = dobDate;
  }

  Object.assign(profile, payload);

  await profile.save();

  return profile;
};

module.exports = {
  updateProfileService
};