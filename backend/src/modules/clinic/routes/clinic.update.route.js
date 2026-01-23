const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const clinicController = require('../controllers/clinic.controller');

// update clinic
/**
 * @swagger
 * /api/clinic/{clinicId}:
 *   patch:
 *     summary: Cập nhật thông tin phòng khám
 *     tags:
 *       - Clinic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *     responses:
 *       200:
 *         description: Cập nhật phòng khám thành công
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
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     clinic_name:
 *                       type: string
 *                     clinic_address:
 *                       type: string
 *                     logo:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     working_house:
 *                       type: string
 *                     tax_code:
 *                       type: string
 *                     license_number:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *             example:
 *               success: true
 *               statusCode: 200
 *               message: Clinic updated successfully
 *               data:
 *                 _id: "696edbf3b3f056e62cee450c"
 *                 clinic_name: "Phòng Khám Đa Khoa An Tâm 1"
 *                 clinic_address: "123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh"
 *                 logo: "https://example.com/images/clinic-logo-antam.png"
 *                 phone: "0901234567"
 *                 email: "lienhe@pkantam.com"
 *                 working_house: "Thứ 2 - Thứ 7: 07:00 - 17:00"
 *                 tax_code: "0312345678"
 *                 license_number: "GPHD12345"
 *                 latitude: 10.762622
 *                 longitude: 106.660172
 *                 status: "ACTIVE"
 *                 createdAt: "2023-10-01T08:00:00.000Z"
 *                 updatedAt: "2026-01-21T02:16:33.548Z"
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
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
 *             example:
 *               success: false
 *               statusCode: 400
 *               message: Dữ liệu không hợp lệ
 *       401:
 *         description: Không xác thực hoặc token hết hạn
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
 *             example:
 *               success: false
 *               statusCode: 401
 *               message: Unauthorized
 *       403:
 *         description: Không có quyền truy cập
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
 *             example:
 *               success: false
 *               statusCode: 403
 *               message: Forbidden
 *       404:
 *         description: Không tìm thấy phòng khám
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 message:
 *                   type: string
 *             example:
 *               success: false
 *               statusCode: 404
 *               message: Clinic not found
 *       409:
 *         description: |
 *           Xung đột dữ liệu (ví dụ: email hoặc số điện thoại đã tồn tại)
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
 *             example:
 *               success: false
 *               statusCode: 409
 *               message: Email đã tồn tại
 *       500:
 *         description: Lỗi server nội bộ
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
 *             example:
 *               success: false
 *               statusCode: 500
 *               message: Internal server error
 */
router.patch('/:clinicId', auth.authenticate, auth.authorize("ADMIN_CLINIC"), clinicController.updateClinic);

module.exports = router;