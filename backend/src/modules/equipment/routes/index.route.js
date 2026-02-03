const express = require('express');
const router = express.Router();

const createEquipmentRoute = require('./equipment.create.route');
const viewDetailEquipmentRoute = require('./equipment.detail.route');
const viewListEquipmentRoute = require('./equipment.list.route');
const updateEquipmentRoute = require('./equipment.update.route');
const updateStatusRoute = require('./equipment.update.status.route');

router.use(viewListEquipmentRoute);
router.use(viewDetailEquipmentRoute);
router.use(createEquipmentRoute);
router.use(updateEquipmentRoute);
router.use(updateStatusRoute);

module.exports = router;