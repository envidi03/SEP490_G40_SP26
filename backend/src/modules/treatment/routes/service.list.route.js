const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/index.controller');

router.get('/treatment', controller.treatment.getListController);

router.get('/dental-record', controller.dental.getListController);

module.exports = router;