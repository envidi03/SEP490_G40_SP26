const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/index.controller');

router.patch('/treatment/:id', controller.treatment.updateController);

router.patch('/dental-record/:id', controller.dental.updateController);

module.exports = router;