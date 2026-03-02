const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/service.controller');

router.get('/:id', controller.getByIdController);

module.exports = router;