const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');
const dentalRecordController = require('../controllers/dental.record.controller');

router.patch('/checkin', controller.checkinController);

router.patch('/:id', controller.updateController);

router.patch('/dental-record/:id', auth.authenticate, auth.authorize("DOCTOR"), dentalRecordController.editDentalRecordController);

module.exports = router;