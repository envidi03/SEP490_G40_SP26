const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/service.controller');

router.post('/', controller.createController);

module.exports = router;