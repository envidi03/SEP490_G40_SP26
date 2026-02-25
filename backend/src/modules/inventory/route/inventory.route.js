const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboard.controller");

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Quản lý kho thuốc
 */

/**
 * @swagger
 * /api/inventory/dashboard/stats:
 *   get:
 *     summary: Lấy thống kê dashboard kho thuốc
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMedicines:
 *                       type: number
 *                       example: 156
 *                     totalInventoryQuantity:
 *                       type: number
 *                       example: 12450
 *                     pendingOrders:
 *                       type: number
 *                       example: 0
 *                     lowStockCount:
 *                       type: number
 *                       example: 5
 *       500:
 *         description: Lỗi server
 */
router.get("/dashboard/stats", dashboardController.getDashboardStats);

/**
 * @swagger
 * /api/inventory/dashboard/low-stock:
 *   get:
 *     summary: Lấy danh sách thuốc sắp hết hàng
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Số lượng bản ghi trả về
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       medicine_name:
 *                         type: string
 *                         example: Vitamin C 1000mg
 *                       quantity:
 *                         type: number
 *                         example: 50
 *                       min_quantity:
 *                         type: number
 *                         example: 100
 *       500:
 *         description: Lỗi server
 */
router.get("/dashboard/low-stock", dashboardController.getLowStockMedicines);

/**
 * @swagger
 * /api/inventory/dashboard/near-expired:
 *   get:
 *     summary: Lấy danh sách thuốc sắp hết hạn
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Số ngày tính từ hôm nay
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       medicine_name:
 *                         type: string
 *                         example: Paracetamol 500mg
 *                       expiry_date:
 *                         type: string
 *                         format: date
 *                         example: 2026-03-10
 *                       quantity:
 *                         type: number
 *                         example: 80
 *       500:
 *         description: Lỗi server
 */
router.get("/dashboard/near-expired", dashboardController.getNearExpiredMedicines);

module.exports = router;