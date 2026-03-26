const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');

router.patch('/checkin', controller.checkinController);

router.patch('/:id', auth.authenticate, controller.updateController);

module.exports = router;