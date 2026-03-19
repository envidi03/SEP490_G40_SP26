const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const equipmentController = require('../controllers/equipment.controller');

router.patch('/category/:categoryId', equipmentController.updateCategoryController);

router.patch('/:equipmentId', equipmentController.updateEquipmentItemController);

module.exports = router;