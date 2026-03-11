const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/index.controller');

router.get('/dental-record', controller.dental.getListController);

router.get('/patient/dental-record', auth.authenticate, auth.authorize("PATIENT"), controller.dental.getListOfPatientController);

router.get('/staff/patient/:id/dental-record', controller.dental.getListOfStaffController);

router.get("/patient", controller.dental.findUserByUserInfo);

router.get('/dental-records/plans', auth.authenticate, controller.dental.getListTreatmentPlansController);

module.exports = router;