const ServiceProcess = require("../service/profile.service");
const successRes = require("../../../common/success");
const logger = require("../../../common/utils/logger");

const updateProfileController = async (req, res) => {
  try {
    const accountId = req.user?.account_id;

    const result = await ServiceProcess.updateProfileService(
      accountId,
      req.body
    );

    return new successRes.UpdateSuccess(
      result,
      "Update profile successfully"
    ).send(res);

  } catch (error) {
    logger.error("Update profile error", {
      context: "ProfileController.updateProfileController",
      message: error.message,
    });
    throw error;
  }
};

module.exports = {
  updateProfileController
};