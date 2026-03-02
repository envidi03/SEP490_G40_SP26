const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');
const dentalRecordController = require('../controllers/dental.record.controller');

router.get('/patient', auth.authenticate, auth.authorize("PATIENT"), controller.getListOfPatientController);
router.get('/staff', controller.getListController);
router.get('/dental-record', auth.authenticate, auth.authorize("DOCTOR"), dentalRecordController.getDentalRecordsController);

module.exports = router;