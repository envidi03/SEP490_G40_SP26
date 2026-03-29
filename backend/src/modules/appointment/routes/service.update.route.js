const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');

router.patch('/checkin', controller.checkinController);

router.patch('/request-update/:id', auth.authenticate, controller.patientRequestUpdateController);

router.patch('/:id', auth.authenticate, controller.updateController);

module.exports = router;