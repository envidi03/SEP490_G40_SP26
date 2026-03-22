const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const equipmentController = require('../controllers/equipment.controller');

router.post('/:categoryId/items', equipmentController.addEquipmentItemsController);

router.post('/', equipmentController.createEquipment);

module.exports = router;