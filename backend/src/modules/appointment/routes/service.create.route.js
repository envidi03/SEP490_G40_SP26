const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');

router.post('/', auth.authenticate, auth.authorize("PATIENT"), controller.createController);

module.exports = router;