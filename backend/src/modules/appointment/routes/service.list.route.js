const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');

router.get('/patient', auth.authenticate, auth.authorize("PATIENT"), controller.getListOfPatientController);

router.get('/staff', controller.getListController);

router.get('/doctor/appointment', auth.authenticate, auth.authorize("DOCTOR"), controller.getListOfDoctorController);

module.exports = router;