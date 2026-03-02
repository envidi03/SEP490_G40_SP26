const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const clinicController = require('../controllers/clinic.controller');

/**
 * @swagger
 * /api/clinic:
 *   get:
 *     summary: Get all clinics
 *     description: Retrieve a list of all clinics.
 *     tags:
 *       - Clinic
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Clinic'
 */
router.get('/', auth.authenticate, auth.authorize("ADMIN_CLINIC"), clinicController.getAllClinics);

module.exports = router;
