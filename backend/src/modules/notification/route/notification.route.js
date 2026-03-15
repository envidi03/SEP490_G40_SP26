const express = require('express');
const router = express.Router();
const { createController, sendToRoleController, sendToUserController } = require('../controller/notification.controller');

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

module.exports = router;
