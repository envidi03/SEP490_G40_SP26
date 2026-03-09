const express = require('express');
const router = express.Router();
const { getListController, getByIdController, createController, updateStatusController, getStatsController } = require('../controller/invoice.controller');

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Quản lý hóa đơn cho Lễ Tân
 */

/**
 * @swagger
 * /api/billing:
 *   get:
 *     summary: Danh sách hóa đơn
 *     tags: [Billing]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo mã HĐ hoặc tên bệnh nhân
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, CANCELLED]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Thành công
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', getListController);

/**
 * @swagger
 * /api/billing/stats:
 *   get:
 *     summary: Thống kê hóa đơn (tổng thu, số lượng...)
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: Thành công
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/stats', getStatsController);

/**
 * @swagger
 * /api/billing/{id}:
 *   get:
 *     summary: Chi tiết hóa đơn
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID của hóa đơn
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy hóa đơn
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', getByIdController);

/**
 * @swagger
 * /api/billing:
 *   post:
 *     summary: Tạo hóa đơn mới
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - items
 *             properties:
 *               patient_id:
 *                 type: string
 *                 example: "69857c47e1599b377c9337b4"
 *               appointment_id:
 *                 type: string
 *                 example: "68ab3f1c2e..."
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [service_id]
 *                   properties:
 *                     service_id:
 *                       type: string
 *                       example: "699d1560e55c8a9dfeafa112"
 *                     quantity:
 *                       type: integer
 *                       default: 1
 *               note:
 *                 type: string
 *                 example: "Ghi chú thêm"
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Thiếu dữ liệu bắt buộc
 *       404:
 *         description: Không tìm thấy patient hoặc service
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', createController);

/**
 * @swagger
 * /api/billing/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái hóa đơn (Thanh toán / Hủy)
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [COMPLETED, CANCELLED]
 *                 example: "COMPLETED"
 *               note:
 *                 type: string
 *                 example: "Bệnh nhân chuyển khoản đủ"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Trạng thái không hợp lệ hoặc HĐ đã xử lý
 *       404:
 *         description: Không tìm thấy HĐ
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id/status', updateStatusController);

module.exports = router;
