const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/appointment.controller');

router.get('/:staffId', controller.getByIdController);

module.exports = router;