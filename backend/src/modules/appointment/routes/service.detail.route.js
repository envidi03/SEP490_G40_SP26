const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');

router.get("/amount/:id", controller.calculateTotalAmountFromAppointment);

router.get('/:id', controller.getByIdController);

module.exports = router;