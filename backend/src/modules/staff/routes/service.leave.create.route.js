const express = require("express");
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require("../controllers/staff.controller");

router.post('/leave', controller.createLeaveController);

module.exports = router;