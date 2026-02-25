const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');

router.patch('/status/:id', controller.updateStatusController);

router.patch('/checkin', controller.checkinController);

module.exports = router;