const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const equipmentController = require('../controllers/equipment.controller');

router.patch('/:equipmentId', equipmentController.updateEquipment);

module.exports = router;