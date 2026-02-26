const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');
const dentalRecordController = require('../controllers/dental.record.controller');

router.post('/', auth.authenticate, auth.authorize("PATIENT"), controller.createController);

router.post('/staff', controller.staffCreateController);

router.post('/dental-record', auth.authenticate, auth.authorize("DOCTOR"), dentalRecordController.createDentalRecordController);

module.exports = router;