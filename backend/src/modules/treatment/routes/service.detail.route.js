const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/index.controller');

router.get('/treatment/:id', controller.treatment.getByIdController);

router.get('/dental-record/:id', controller.dental.getByIdController);

module.exports = router;