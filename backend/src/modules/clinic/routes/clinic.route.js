const express = require('express');
const router = express.Router();
const auth = require('./../../../common/middlewares/index');
const clinicController = require('../controllers/clinic.controller');

// update clinic
/**
 * 
 */
router.patch('/', auth.authenticate, auth.authorize("ADMIN_CLINIC"), clinicController.updateClinic);

// get all clinics
router.get('/', auth.authenticate, auth.authorize("ADMIN_CLINIC"), clinicController.getInforClinics);

module.exports = router;