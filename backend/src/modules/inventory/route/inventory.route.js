const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboard.controller");
const medicineController = require("../controller/medicine.controller");

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Quản lý kho thuốc
 */

// ======================== MEDICINE ROUTES ========================

/**
 * @swagger
 * /api/inventory/medicines:
 *   get:
 *     summary: Lấy danh sách thuốc (có phân trang, tìm kiếm, lọc)
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên thuốc hoặc nhà sản xuất
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục thuốc
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
 *                       category:
 *                         type: string
 *                         example: Giảm đau - Hạ sốt
 *                       manufacturer:
 *                         type: string
 *                         example: DHG Pharma
 *                       price:
 *                         type: number
 *                         example: 2000
 *                       quantity:
 *                         type: number
 *                         example: 500
 *                       expiry_date:
 *                         type: string
 *                         format: date
 *                         example: 2026-12-31
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                     totalPages:
 *                       type: number
 *                       example: 5
 *                     totalItems:
 *                       type: number
 *                       example: 50
 *                     itemsPerPage:
 *                       type: number
 *                       example: 10
 *       500:
 *         description: Lỗi server
 */
router.get("/medicines", medicineController.getMedicines);

/**
 * @swagger
 * /api/inventory/medicines/categories:
 *   get:
 *     summary: Lấy danh sách danh mục thuốc (cho dropdown filter)
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
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Giảm đau - Hạ sốt", "Kháng sinh", "Kháng viêm", "Kháng histamin", "Vitamin & Khoáng chất"]
 *       500:
 *         description: Lỗi server
 */
router.get("/medicines/categories", medicineController.getCategories);

/**
 * @swagger
 * /api/inventory/medicines:
 *   post:
 *     summary: Thêm thuốc mới
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicine_name
 *               - category
 *               - dosage_form
 *               - unit
 *               - price
 *               - manufacturer
 *               - expiry_date
 *               - quantity
 *               - min_quantity
 *             properties:
 *               medicine_name:
 *                 type: string
 *                 example: Paracetamol 500mg
 *               category:
 *                 type: string
 *                 example: Giảm đau - Hạ sốt
 *               dosage:
 *                 type: string
 *                 example: 500mg
 *               dosage_form:
 *                 type: string
 *                 example: Viên
 *               unit:
 *                 type: string
 *                 example: Viên
 *               price:
 *                 type: number
 *                 example: 2000
 *               manufacturer:
 *                 type: string
 *                 example: DHG Pharma
 *               distributor:
 *                 type: string
 *                 example: Công ty ABC
 *               expiry_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-31
 *               quantity:
 *                 type: number
 *                 example: 500
 *               min_quantity:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Thêm thuốc thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       409:
 *         description: Thuốc đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post("/medicines", medicineController.createMedicine);

// ======================== DASHBOARD ROUTES ========================

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