const notificationService = require('../service/notification.service');

/**
 * POST /api/notification
 * Tạo thông báo mới và đẩy real-time qua Socket.IO.
 */
const createController = async (req, res, next) => {
    try {
        const sender_id = req.user?.account_id;

        const notification = await notificationService.createNotification({
            ...req.body,
            sender_id,
        });

        res.status(201).json({
            status: 'success',
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/notification/send-to-role
 * Gửi thông báo đến tất cả user thuộc một hoặc nhiều role.
 */
const sendToRoleController = async (req, res, next) => {
    try {
        const { roles, ...data } = req.body;

        const notification = await notificationService.sendToRole(roles, data);

        res.status(201).json({
            status: 'success',
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/notification/send-to-user
 * Gửi thông báo đến 1 user cụ thể theo recipientId.
 */
const sendToUserController = async (req, res, next) => {
    try {
        const { recipient_id, ...data } = req.body;

        const notification = await notificationService.sendToUser(recipient_id, data);

        res.status(201).json({
            status: 'success',
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/notification/send-to-group
 * Gửi thông báo đến danh sách user ID cụ thể.
 */
const sendToGroupController = async (req, res, next) => {
    try {
        const { recipient_ids, ...data } = req.body;

        const notification = await notificationService.sendToGroup(recipient_ids, data);

        res.status(201).json({
            status: 'success',
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/notification/send-global
 * Broadcast thông báo đến toàn bộ hệ thống.
 */
const sendGlobalController = async (req, res, next) => {
    try {
        const notification = await notificationService.sendGlobal(req.body);

        res.status(201).json({
            status: 'success',
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/notification
 * Lấy danh sách thông báo của user hiện tại (phân trang).
 */
const getListController = async (req, res, next) => {
    try {
        const userId = req.user?.account_id;
        const userRole = req.user?.role?.name;
        const { page = 1, limit = 20 } = req.query;

        const result = await notificationService.getNotifications({ userId, userRole, page, limit });

        res.status(200).json({
            status: 'success',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createController, sendToRoleController, sendToUserController, sendToGroupController, sendGlobalController, getListController };
