const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/index.controller');

router.get('/treatment', controller.treatment.getListController);

router.get('/dental-record', controller.dental.getListController);

router.get('/patient/dental-record', auth.authenticate, auth.authorize("PATIENT"), controller.dental.getListOfPatientController);

router.get('/staff/patient/:id/dental-record', controller.dental.getListOfStaffController);

router.get("/patient", controller.dental.findUserByUserInfo);

module.exports = router;