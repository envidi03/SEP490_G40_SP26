const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');

/**
 * @swagger
 * /api/clinic/public:
 *   get:
 *     summary: Get all clinics (Public)
 *     description: Retrieve a list of all clinics for public use (no authentication required).
 *     tags:
 *       - Clinic
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/public', clinicController.getPublicClinics);

module.exports = router;
