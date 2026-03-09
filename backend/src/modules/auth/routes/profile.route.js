const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../controller/profile.controller");
const auth = require("../../../common/middlewares/auth.middleware");
const { uploadToCloudinary } = require("../../../utils/cloudinaryHelper");
const Profile = require("../models/profile.model");

// Multer memory storage for Cloudinary upload
const upload = multer({ storage: multer.memoryStorage() });

router.patch(
  "/update",
  auth.authenticate,
  controller.updateProfileController
);

router.get(
  "/",
  auth.authenticate,
  controller.getProfileController
);

/**
 * POST /api/profile/upload-avatar
 * Upload avatar lên Cloudinary và cập nhật avatar_url trong profile
 * Body: multipart/form-data với field "avatar"
 * Response: { data: { avatar_url: "https://res.cloudinary.com/..." } }
 */
router.post(
  "/upload-avatar",
  auth.authenticate,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "Vui lòng chọn một file ảnh!",
        });
      }

      // Upload to Cloudinary in "avatars" folder
      const url = await uploadToCloudinary(req.file, "avatars");

      // Update profile avatar_url
      const accountId = req.user?.account_id;
      const profile = await Profile.findOneAndUpdate(
        { account_id: accountId },
        { avatar_url: url },
        { new: true }
      );

      if (!profile) {
        return res.status(404).json({
          status: "error",
          message: "Profile not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Upload avatar thành công",
        data: { avatar_url: url },
      });
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

module.exports = router;