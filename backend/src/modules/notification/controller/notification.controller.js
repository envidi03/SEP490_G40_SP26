const notificationService = require('../service/notification.service');

/**
 * POST /api/notification
 * Tạo thông báo mới và đẩy real-time qua Socket.IO.
 */
const createController = async (req, res, next) => {
    try {
        const sender_id = req.user?.id || req.user?._id;

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

module.exports = { createController, sendToRoleController, sendToUserController };
