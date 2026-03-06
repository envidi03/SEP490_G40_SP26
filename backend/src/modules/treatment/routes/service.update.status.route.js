const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/index.controller');

router.patch('/treatment/status/:id', controller.treatment.updateStatusController);

module.exports = router;