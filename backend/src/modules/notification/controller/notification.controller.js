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

/**
 * GET /api/notification/unread-count
 * Đếm số thông báo chưa đọc của user.
 */
const getUnreadCountController = async (req, res, next) => {
    try {
        const userId = req.user?.account_id;
        const userRole = req.user?.role?.name;

        const result = await notificationService.getUnreadCount({ userId, userRole });

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/notification/:id/read
 * Đánh dấu 1 thông báo là đã đọc.
 */
const markAsReadController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.account_id;

        const result = await notificationService.markAsRead(id, userId);

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/notification/read-all
 * Đánh dấu toàn bộ thông báo là đã đọc.
 */
const markAllAsReadController = async (req, res, next) => {
    try {
        const userId = req.user?.account_id;
        const userRole = req.user?.role?.name;

        const result = await notificationService.markAllAsRead(userId, userRole);

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/notification/:id/seen
 * Đánh dấu 1 thông báo là đã xem (hiển thị popup/toast).
 */
const markAsSeenController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.account_id;

        const result = await notificationService.markAsSeen(id, userId);

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/notification/read-all
 * Xóa/ẩn toàn bộ thông báo ĐÃ ĐỌC.
 */
const deleteAllReadController = async (req, res, next) => {
    try {
        const userId = req.user?.account_id;
        const userRole = req.user?.role?.name;

        const result = await notificationService.deleteAllRead(userId, userRole);

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/notification/:id
 * Xóa/ẩn 1 thông báo.
 */
/**
 * PUT /api/notification/:id/toggle-read
 * Đảo trạng thái đã đọc/chưa đọc.
 */
const toggleReadStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.account_id;

        const result = await notificationService.toggleReadStatus(id, userId);

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

const deleteNotificationController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.account_id;

        await notificationService.deleteNotification(id, userId);

        res.status(200).json({ status: 'success', message: 'Notification deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createController,
    sendToRoleController,
    sendToUserController,
    sendToGroupController,
    sendGlobalController,
    getListController,
    getUnreadCountController,
    markAsReadController,
    markAllAsReadController,
    markAsSeenController,
    deleteAllReadController,
    toggleReadStatusController,
    deleteNotificationController
};
