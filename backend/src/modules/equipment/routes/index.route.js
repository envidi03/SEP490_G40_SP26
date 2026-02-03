const express = require('express');
const router = express.Router();

const viewListEquipmentRoute = require('./equipment.list.route');

router.use(viewListEquipmentRoute);

module.exports = router;