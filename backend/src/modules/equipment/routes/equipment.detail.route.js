const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const equipmentController = require('../controllers/equipment.controller');

router.get('/:equipmentId', equipmentController.getEquipmentById);

module.exports = router;