const express = require('express');
const router = express.Router();
const {
    createController,
    sendToRoleController,
    sendToUserController,
    sendToGroupController,
    sendGlobalController,
    getListController,
    markAsReadController,
    markAllAsReadController,
    markAsSeenController,
    getUnreadCountController,
    deleteAllReadController,
    toggleReadStatusController,
    deleteNotificationController
} = require('../controller/notification.controller');
const { authenticate } = require('../../../common/middlewares/auth.middleware');

router.use(authenticate);


/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Quản lý thông báo trong hệ thống
 */

/**
 * @swagger
 * /api/notification:
 *   post:
 *     summary: Tạo thông báo mới và đẩy real-time qua Socket.IO
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [NEW_APPOINTMENT, APPOINTMENT_CANCELLED, INVOICE_READY, PATIENT_CHECKED_IN, NEW_PRESCRIPTION, LOW_STOCK, EXPIRING_MEDICINE, SYSTEM_ALERT]
 *               scope:
 *                 type: string
 *                 enum: [INDIVIDUAL, GROUP, GLOBAL]
 *                 default: INDIVIDUAL
 *               recipient_id:
 *                 type: string
 *                 description: ObjectId user nhận (khi scope = INDIVIDUAL)
 *               target_roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng role nhận (khi scope = GROUP)
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               action_url:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 properties:
 *                   entity_id:
 *                     type: string
 *                   entity_type:
 *                     type: string
 *                   extra_data:
 *                     type: object
 *     responses:
 *       201:
 *         description: Tạo thông báo thành công
 *       400:
 *         description: Thiếu field bắt buộc
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/', createController);

/**
 * @swagger
 * /api/notification/send-to-role:
 *   post:
 *     summary: Gửi thông báo đến tất cả user thuộc một hoặc nhiều role
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *               - type
 *               - title
 *               - message
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [admin, doctor, receptionist, pharmacist]
 *                 example: ["receptionist"]
 *               type:
 *                 type: string
 *                 enum: [NEW_APPOINTMENT, APPOINTMENT_CANCELLED, INVOICE_READY, PATIENT_CHECKED_IN, NEW_PRESCRIPTION, LOW_STOCK, EXPIRING_MEDICINE, SYSTEM_ALERT]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               action_url:
 *                 type: string
 *               exclude_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng ObjectId bị loại trừ không nhận thông báo
 *               metadata:
 *                 type: object
 *                 properties:
 *                   entity_id:
 *                     type: string
 *                   entity_type:
 *                     type: string
 *                   extra_data:
 *                     type: object
 *     responses:
 *       201:
 *         description: Gửi thành công
 *       400:
 *         description: Thiếu roles hoặc field bắt buộc
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/send-to-role', sendToRoleController);

/**
 * @swagger
 * /api/notification/send-to-user:
 *   post:
 *     summary: Gửi thông báo đến 1 user cụ thể theo recipient_id
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_id
 *               - type
 *               - title
 *               - message
 *             properties:
 *               recipient_id:
 *                 type: string
 *                 description: ObjectId của user nhận
 *                 example: "661a2b3c4d5e6f7a8b9c0d1e"
 *               type:
 *                 type: string
 *                 enum: [NEW_APPOINTMENT, APPOINTMENT_CANCELLED, INVOICE_READY, PATIENT_CHECKED_IN, NEW_PRESCRIPTION, LOW_STOCK, EXPIRING_MEDICINE, SYSTEM_ALERT]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               action_url:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 properties:
 *                   entity_id:
 *                     type: string
 *                   entity_type:
 *                     type: string
 *                   extra_data:
 *                     type: object
 *     responses:
 *       201:
 *         description: Gửi thành công
 *       400:
 *         description: Thiếu recipient_id hoặc field bắt buộc
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/send-to-user', sendToUserController);

/**
 * @swagger
 * /api/notification/send-to-group:
 *   post:
 *     summary: Gửi thông báo đến danh sách user ID cụ thể
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_ids
 *               - type
 *               - title
 *               - message
 *             properties:
 *               recipient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng ObjectId các user nhận
 *                 example: ["661a2b3c4d5e6f7a8b9c0d1e", "661a2b3c4d5e6f7a8b9c0d2f"]
 *               type:
 *                 type: string
 *                 enum: [NEW_APPOINTMENT, APPOINTMENT_CANCELLED, INVOICE_READY, PATIENT_CHECKED_IN, NEW_PRESCRIPTION, LOW_STOCK, EXPIRING_MEDICINE, SYSTEM_ALERT]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               action_url:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 properties:
 *                   entity_id:
 *                     type: string
 *                   entity_type:
 *                     type: string
 *                   extra_data:
 *                     type: object
 *     responses:
 *       201:
 *         description: Gửi thành công
 *       400:
 *         description: recipient_ids rỗng hoặc thiếu field bắt buộc
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/send-to-group', sendToGroupController);

/**
 * @swagger
 * /api/notification/send-global:
 *   post:
 *     summary: Broadcast thông báo đến toàn bộ hệ thống (GLOBAL)
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SYSTEM_ALERT, SYSTEM_MAINTENANCE]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               action_url:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 properties:
 *                   extra_data:
 *                     type: object
 *     responses:
 *       201:
 *         description: Broadcast thành công
 *       400:
 *         description: Thiếu field bắt buộc
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/send-global', sendGlobalController);

/**
 * @swagger
 * /api/notification:
 *   get:
 *     summary: Lấy danh sách thông báo của user hiện tại
 *     tags: [Notification]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số thông báo mỗi trang
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', getListController);

/**
 * @swagger
 * /api/notification/unread-count:
 *   get:
 *     summary: Lấy số lượng thông báo chưa đọc
 *     tags: [Notification]
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     unread_count:
 *                       type: integer
 *                       example: 5
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/unread-count', getUnreadCountController);

/**
 * @swagger
 * /api/notification/read-all:
 *   put:
 *     summary: Đánh dấu TẤT CẢ thông báo của user thành đã đọc
 *     tags: [Notification]
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Xóa (hoặc ẩn) TẤT CẢ thông báo ĐÃ ĐỌC của user
 *     tags: [Notification]
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/read-all', markAllAsReadController);

/**
 * @swagger
 * /api/notification/{id}/read:
 *   put:
 *     summary: Đánh dấu một thông báo là đã đọc
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId của thông báo
 *     responses:
 *       200:
 *         description: Thành công
 *       403:
 *         description: Không có quyền truy cập thông báo này
 *       404:
 *         description: Không tìm thấy thông báo
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/notification/{id}/seen:
 *   put:
 *     summary: Đánh dấu một thông báo là đã xem (Popup/Toast)
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId của thông báo
 *     responses:
 *       200:
 *         description: Thành công
 *       403:
 *         description: Không có quyền truy cập thông báo này
 *       404:
 *         description: Không tìm thấy thông báo
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id/seen', markAsSeenController);

router.put('/:id/read', markAsReadController);

router.delete('/read-all', deleteAllReadController);

/**
 * @swagger
 * /api/notification/{id}:
 *   delete:
 *     summary: Xóa (hoặc ẩn) một thông báo
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId của thông báo
 *     responses:
 *       200:
 *         description: Thành công
 *       403:
 *         description: Không có quyền truy cập thông báo này
 *       404:
 *         description: Không tìm thấy thông báo
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteNotificationController);

router.put('/:id/toggle-read', toggleReadStatusController);

module.exports = router;
