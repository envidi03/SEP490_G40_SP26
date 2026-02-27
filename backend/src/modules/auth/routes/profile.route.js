const express = require("express");
const router = express.Router();
const controller = require("../controller/profile.controller");
const auth = require("../../../common/middlewares/auth.middleware");

router.patch(
  "/update",
  auth.authenticate,
  controller.updateProfileController
);

module.exports = router;