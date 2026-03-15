const express = require('express');
const router = express.Router();
const EquipmentController = require('../controllers/equipment.controller');

// POST /api/equipment/report-incident/:equipmentId
router.post('/report-incident/:equipmentId', EquipmentController.reportIncident);

module.exports = router;
