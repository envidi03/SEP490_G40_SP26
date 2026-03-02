const express = require("express");
const router = express.Router();
const controller = require("../controller/profile.controller");
const auth = require("../../../common/middlewares/auth.middleware");

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

module.exports = router;