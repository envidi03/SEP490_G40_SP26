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
      "Cập nhật thông tin cá nhân thành công"
    ).send(res);

  } catch (error) {
    logger.error("Update profile error", {
      context: "ProfileController.updateProfileController",
      message: error.message,
    });
    throw error;
  }
};

const getProfileController = async (req, res) => {
  try {
    const accountId = req.user?.account_id;

    const result = await ServiceProcess.getProfileService(accountId);

    return new successRes.GetListSuccess(
      result,
      "Lấy thông tin cá nhân thành công"
    ).send(res);

  } catch (error) {
    logger.error("Get profile error", {
      context: "ProfileController.getProfileController",
      message: error.message,
    });
    throw error;
  }
};

module.exports = {
  updateProfileController,
  getProfileController
};