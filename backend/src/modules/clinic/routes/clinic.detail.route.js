const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const clinicController = require('../controllers/clinic.controller');

/**
 * @swagger
 * /api/clinic/{clinicId}:
 *   get:
 *     summary: Get clinic information by ID
 *     description: Retrieve detailed information about a specific clinic by its ID. Requires authentication and "ADMIN_CLINIC" authorization.
 *     tags:
 *       - Clinic
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the clinic to retrieve
 *     responses:
 *       200:
 *         description: Clinic information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "696edbf3b3f056e62cee450c"
 *                     clinic_name:
 *                       type: string
 *                       example: "Phòng Khám Đa Khoa An Tâm"
 *                     clinic_address:
 *                       type: string
 *                       example: "123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh"
 *                     logo:
 *                       type: string
 *                       example: "https://example.com/images/clinic-logo-antam.png"
 *                     phone:
 *                       type: string
 *                       example: "0901234567"
 *                     email:
 *                       type: string
 *                       example: "lienhe@pkantam.com"
 *                     working_house:
 *                       type: string
 *                       example: "Thứ 2 - Thứ 7: 07:00 - 17:00"
 *                     tax_code:
 *                       type: string
 *                       example: "0312345678"
 *                     license_number:
 *                       type: string
 *                       example: "GPHD12345"
 *                     latitude:
 *                       type: number
 *                       example: 10.762622
 *                     longitude:
 *                       type: number
 *                       example: 106.660172
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *       404:
 *         description: Clinic not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "No clinics found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.get('/:clinicId', auth.authenticate, auth.authorize("ADMIN_CLINIC"), clinicController.getInforClinics);

module.exports = router;