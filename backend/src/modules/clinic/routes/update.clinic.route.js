const express = require('express');
const router = express.Router();
const auth = require('./../../../common/middlewares/index');
const clinicController = require('../controllers/clinic.controller');

// update clinic
/**
 * 
 */
router.patch('/:clinicId', auth.authenticate, auth.authorize("ADMIN_CLINIC"), clinicController.updateClinic);

module.exports = router;