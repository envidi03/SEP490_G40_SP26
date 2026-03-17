const Notification = require('../model/notification.model');
const { emitToUser, emitToRole, getIO } = require('../../../socket');
const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const { dispatchEmail, dispatchZalo } = require('./notification.dispatcher');

const _dispatchInApp = async (notification) => {
    const payload = {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        action_url: notification.action_url,
        thumbnail: notification.thumbnail,
        metadata: notification.metadata,
        status: notification.status,
        is_seen: notification.is_seen,
        createdAt: notification.createdAt,
    };

    const { scope, recipient_id, recipient_ids, target_roles } = notification;

    if (scope === 'INDIVIDUAL' && recipient_id) {
        emitToUser(recipient_id.toString(), 'new_notification', payload);
    } else if (scope === 'GROUP') {
        if (target_roles?.length > 0) {
            target_roles.forEach(role => emitToRole(role, 'new_notification', payload));
        }
        if (recipient_ids?.length > 0) {
            recipient_ids.forEach(id => emitToUser(id.toString(), 'new_notification', payload));
        }
    } else if (scope === 'GLOBAL') {
        getIO().emit('new_notification', payload);
    }

    notification.channels.in_app.status = 'SENT';
    notification.channels.in_app.sent_at = new Date();
};

const createNotification = async (payload) => {
    try {
        const {
            type,
            title,
            message,
            scope = 'INDIVIDUAL',
            sender_id = null,
            recipient_id = null,
            recipient_ids = [],
            target_roles = [],
            exclude_ids = [],
            action_url = null,
            thumbnail = null,
            metadata = {},
            channels = {},
            expires_at = null,
        } = payload;

        if (!type) throw new errorRes.BadRequestError('type is required');
        if (!title) throw new errorRes.BadRequestError('title is required');
        if (!message) throw new errorRes.BadRequestError('message is required');

        const channelsConfig = {
            in_app: { enabled: true, ...channels.in_app },
            email: { enabled: false, ...channels.email },
            zalo: { enabled: false, ...channels.zalo },
        };

        const notification = await Notification.create({
            sender_id, scope, type,
            recipient_id: recipient_id || null,
            recipient_ids: recipient_ids || [],
            target_roles: target_roles || [],
            exclude_ids: exclude_ids || [],
            title, message, action_url, thumbnail, metadata,
            channels: channelsConfig,
            expires_at,
        });

        if (channelsConfig.in_app.enabled) {
            try {
                await _dispatchInApp(notification);
            } catch (err) {
                logger.warn('[Notification] in_app dispatch failed', { message: err.message });
                notification.channels.in_app.status = 'FAILED';
            }
        }

        if (channelsConfig.email.enabled) {
            // Gửi ngầm background, không block API
            dispatchEmail(notification);
        }

        if (channelsConfig.zalo.enabled) {
            // Gửi ngầm background Zalo ZNS
            dispatchZalo(notification);
        }

        await notification.save();
        return notification;

    } catch (error) {
        if (['BadRequestError', 'NotFoundError'].includes(error.name)) throw error;
        logger.error('Error in createNotification', {
            context: 'NotificationService.createNotification',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

/**
 * Gửi nhanh cho 1 user cụ thể (scope INDIVIDUAL).
 * @param {string} recipientId - ObjectId user nhận
 * @param {object} data        - { type, title, message, action_url?, metadata?, channels? }
 */
const sendToUser = async (recipientId, data) => {
    if (!recipientId) throw new errorRes.BadRequestError('recipientId is required');
    return createNotification({
        scope: 'INDIVIDUAL',
        recipient_id: recipientId,
        type: data.type,
        title: data.title,
        message: data.message,
        action_url: data.action_url || null,
        metadata: data.metadata || {},
        channels: data.channels || { in_app: { enabled: true } },
    });
};

/**
 * Gửi cho tất cả user thuộc một hoặc nhiều role (scope GROUP).
 * @param {string|string[]} roles - Role hoặc mảng roles nhận thông báo
 * @param {object}          data  - { type, title, message, action_url?, metadata?, exclude_ids?, channels? }
 */
const sendToRole = async (roles, data) => {
    try {
        if (!roles || (Array.isArray(roles) && roles.length === 0)) {
            throw new errorRes.BadRequestError('roles is required');
        }

        const target_roles = Array.isArray(roles) ? roles : [roles];

        return createNotification({
            scope: 'GROUP',
            target_roles,
            exclude_ids: data.exclude_ids || [],
            type: data.type,
            title: data.title,
            message: data.message,
            action_url: data.action_url || null,
            metadata: data.metadata || {},
            channels: data.channels || { in_app: { enabled: true } },
        });
    } catch (error) {
        if (['BadRequestError'].includes(error.name)) throw error;
        logger.error('Error in sendToRole', {
            context: 'NotificationService.sendToRole',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

/**
 * Gửi thông báo đến một danh sách user ID cụ thể (scope GROUP theo IDs).
 * @param {string[]} recipientIds - Mảng ObjectId user nhận
 * @param {object}   data         - { type, title, message, action_url?, metadata?, channels? }
 */
const sendToGroup = async (recipientIds, data) => {
    try {
        if (!recipientIds || recipientIds.length === 0) {
            throw new errorRes.BadRequestError('recipientIds is required and must not be empty');
        }

        return createNotification({
            scope: 'GROUP',
            recipient_ids: recipientIds,
            type: data.type,
            title: data.title,
            message: data.message,
            action_url: data.action_url || null,
            metadata: data.metadata || {},
            channels: data.channels || { in_app: { enabled: true } },
        });
    } catch (error) {
        if (['BadRequestError'].includes(error.name)) throw error;
        logger.error('Error in sendToGroup', {
            context: 'NotificationService.sendToGroup',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

/**
 * Broadcast thông báo đến toàn bộ hệ thống (scope GLOBAL).
 * @param {object} data - { type, title, message, action_url?, metadata?, channels? }
 */
const sendGlobal = async (data) => {
    try {
        return createNotification({
            scope: 'GLOBAL',
            type: data.type,
            title: data.title,
            message: data.message,
            action_url: data.action_url || null,
            metadata: data.metadata || {},
            channels: data.channels || { in_app: { enabled: true } },
        });
    } catch (error) {
        if (['BadRequestError'].includes(error.name)) throw error;
        logger.error('Error in sendGlobal', {
            context: 'NotificationService.sendGlobal',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

/**
 * Lấy danh sách thông báo của user hiện tại (phân trang, sort mới nhất trước).
 */
const getNotifications = async ({ userId, userRole, page = 1, limit = 20 }) => {
    try {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        // Lấy thông báo thuộc về user cụ thể, hoặc gửi theo role của họ, hoặc GLOBAL
        // Đồng thời BỎ QUA những thông báo user đã xoá (nằm trong deleted_by)
        const filter = {
            'deleted_by.user_id': { $ne: userId },
            'deleted_by._id': { $ne: userId }, // Fallback
            $or: [
                { recipient_id: userId },
                { target_roles: userRole },
                { scope: 'GLOBAL' },
            ]
        };

        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Notification.countDocuments(filter),
        ]);

        // Tính toán field is_read và is_seen thực tế cho từng thông báo trả về
        const formattedData = notifications.map(notif => {
            let is_read = false;
            let is_seen = false;

            // Xử lý cẩn thận do lúc trước code sinh nhầm `_id` mà không có `user_id`
            const hasRead = (notif.read_by || []).some(entry => {
                const checkedId = entry.user_id || entry._id; // Fallback cho dữ liệu lỗi lúc nãy
                return checkedId && checkedId.toString() === userId.toString();
            });

            const hasSeen = (notif.seen_by || []).some(entry => {
                const checkedId = entry.user_id || entry._id;
                return checkedId && checkedId.toString() === userId.toString();
            });

            if (notif.scope === 'INDIVIDUAL') {
                is_read = notif.status === 'READ';
                is_seen = notif.is_seen === true;
            } else {
                // GROUP, GLOBAL: đã đọc nếu userId nằm trong mảng read_by
                is_read = hasRead;
                is_seen = hasSeen;
            }
            return {
                ...notif,
                is_read, // Field phụ để frontend dùng dễ hiểu hơn
                is_seen  // Ghi đè lại is_seen gốc của document bằng is_seen thực tế
            };
        });

        return {
            data: formattedData,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            }
        };
    } catch (error) {
        logger.error('Error in getNotifications', {
            context: 'NotificationService.getNotifications',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

/**
 * Đếm số thông báo chưa đọc của user — dùng cho badge số đỏ trên chuông.
 */
const getUnreadCount = async ({ userId, userRole }) => {
    try {
        // Chỉ đếm các thông báo UNREAD VÀ (userId không nằm trong read_by) VÀ (userId không nằm trong deleted_by)
        const count = await Notification.countDocuments({
            status: 'UNREAD',
            'read_by.user_id': { $ne: userId },
            'read_by._id': { $ne: userId },
            'deleted_by.user_id': { $ne: userId },
            'deleted_by._id': { $ne: userId },
            $or: [
                { recipient_id: userId },
                { target_roles: userRole },
                { scope: 'GLOBAL' },
            ]
        });
        return { unread_count: count };
    } catch (error) {
        logger.error('Error in getUnreadCount', {
            context: 'NotificationService.getUnreadCount',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

/**
 * Đánh dấu 1 thông báo là đã đọc.
 * Khác với INDIVIDUAL (chỉ cập nhật status của doc),
 * với GROUP/GLOBAL ta cần lưu id người đọc vào mảng `read_by` 
 * để người khác đọc không bị báo đã đọc luôn.
 * @param {string} notificationId 
 * @param {string} userId
 */
const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            throw new errorRes.NotFoundError('Notification not found');
        }

        // Nếu thông báo gửi riêng (INDIVIDUAL), chỉ cần đổi status
        if (notification.scope === 'INDIVIDUAL') {
            if (notification.recipient_id.toString() !== userId.toString()) {
                throw new errorRes.ForbiddenError('Not your notification');
            }
            notification.status = 'READ';
        } else {
            // Nếu thông báo GROUP/GLOBAL, push user_id vào mảng read_by
            const existingRead = notification.read_by.some(entry => {
                const checkedId = entry.user_id || entry._id;
                return checkedId && checkedId.toString() === userId.toString();
            });

            if (!existingRead) {
                notification.read_by.push({ user_id: userId });
            }
        }

        await notification.save();
        return notification;
    } catch (error) {
        if (['NotFoundError', 'ForbiddenError'].includes(error.name)) throw error;
        logger.error('Error in markAsRead', {
            context: 'NotificationService.markAsRead',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

/**
 * Đánh dấu 1 thông báo là ĐÃ HIỂN THỊ TRÊN MÀN HÌNH (Seen - dùng cho popup toast).
 * Khác với "Read" (nằm trong hộp thư báo đỏ).
 * @param {string} notificationId 
 * @param {string} userId
 */
const markAsSeen = async (notificationId, userId) => {
    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            throw new errorRes.NotFoundError('Notification not found');
        }

        // Nếu thông báo gửi riêng (INDIVIDUAL), chỉ cần đổi field is_seen
        if (notification.scope === 'INDIVIDUAL') {
            if (notification.recipient_id.toString() !== userId.toString()) {
                throw new errorRes.ForbiddenError('Not your notification');
            }
            notification.is_seen = true;
        } else {
            // Nếu thông báo GROUP/GLOBAL, push user_id vào mảng seen_by
            const existingSeen = notification.seen_by.some(entry => {
                const checkedId = entry.user_id || entry._id;
                return checkedId && checkedId.toString() === userId.toString();
            });

            if (!existingSeen) {
                notification.seen_by.push({ user_id: userId });
            }
        }

        await notification.save();
        return notification;
    } catch (error) {
        if (['NotFoundError', 'ForbiddenError'].includes(error.name)) throw error;
        logger.error('Error in markAsSeen', {
            context: 'NotificationService.markAsSeen',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

/**
 * Đánh dấu toàn bộ thông báo chưa đọc của user thành đã đọc.
 * @param {string} userId
 * @param {string} userRole
 */
const markAllAsRead = async (userId, userRole) => {
    try {
        // 1. Cập nhật thông báo cá nhân (INDIVIDUAL) - đổi status thành READ
        const updateIndividual = Notification.updateMany(
            { recipient_id: userId, status: 'UNREAD', scope: 'INDIVIDUAL' },
            { $set: { status: 'READ' } }
        );

        // 2. Cập nhật thông báo chung (GROUP/GLOBAL) - push userId vào read_by
        const updateGroupGlobal = Notification.updateMany(
            {
                status: 'UNREAD',
                scope: { $in: ['GROUP', 'GLOBAL'] },
                'read_by.user_id': { $ne: userId },
                'read_by._id': { $ne: userId }, // Fallback thêm
                $or: [
                    { target_roles: userRole },
                    { scope: 'GLOBAL' }
                ]
            },
            {
                $push: { read_by: { user_id: userId } }
            }
        );

        await Promise.all([updateIndividual, updateGroupGlobal]);

        return { message: 'All notifications marked as read' };
    } catch (error) {
        logger.error('Error in markAllAsRead', {
            context: 'NotificationService.markAllAsRead',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

/**
 * Xóa/ẩn toàn bộ thông báo ĐÃ ĐỌC của user.
 * @param {string} userId
 * @param {string} userRole
 */
const deleteAllRead = async (userId, userRole) => {
    try {
        // 1. Cập nhật thông báo cá nhân (INDIVIDUAL) đã đọc -> Xóa cứng
        const deleteIndividual = Notification.deleteMany({
            recipient_id: userId,
            status: 'READ',
            scope: 'INDIVIDUAL'
        });

        // 2. Cập nhật thông báo chung (GROUP/GLOBAL) đã đọc -> Thêm vào deleted_by
        // (Điều kiện đã đọc: userId nằm trong mảng read_by)
        const hideGroupGlobal = Notification.updateMany(
            {
                scope: { $in: ['GROUP', 'GLOBAL'] },
                $or: [
                    { 'read_by.user_id': userId },
                    { 'read_by._id': userId } // Fallback
                ],
                // Chưa bị xóa/ẩn
                'deleted_by.user_id': { $ne: userId },
                'deleted_by._id': { $ne: userId }
            },
            {
                $push: { deleted_by: { user_id: userId } }
            }
        );

        await Promise.all([deleteIndividual, hideGroupGlobal]);

        return { message: 'All read notifications have been deleted/hidden' };
    } catch (error) {
        logger.error('Error in deleteAllRead', {
            context: 'NotificationService.deleteAllRead',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};
/**
 * Toggle trạng thái đọc của 1 thông báo.
 * @param {string} notificationId 
 * @param {string} userId
 */
const toggleReadStatus = async (notificationId, userId) => {
    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            throw new errorRes.NotFoundError('Notification not found');
        }

        if (notification.scope === 'INDIVIDUAL') {
            if (notification.recipient_id.toString() !== userId.toString()) {
                throw new errorRes.ForbiddenError('Not your notification');
            }
            notification.status = notification.status === 'READ' ? 'UNREAD' : 'READ';
        } else {
            const hasRead = notification.read_by.some(entry => {
                const checkedId = entry.user_id || entry._id;
                return checkedId && checkedId.toString() === userId.toString();
            });

            if (hasRead) {
                // Đánh dấu chưa đọc -> Xóa khỏi mảng read_by
                notification.read_by = notification.read_by.filter(entry => {
                    const checkedId = entry.user_id || entry._id;
                    return checkedId && checkedId.toString() !== userId.toString();
                });
            } else {
                // Đánh dấu đã đọc -> Push vào mảng read_by
                notification.read_by.push({ user_id: userId });
            }
        }

        await notification.save();
        return notification;
    } catch (error) {
        if (['NotFoundError', 'ForbiddenError'].includes(error.name)) throw error;
        logger.error('Error in toggleReadStatus', {
            context: 'NotificationService.toggleReadStatus',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

module.exports = {
    createNotification,
    sendToUser,
    sendToRole,
    sendToGroup,
    sendGlobal,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAsSeen,
    markAllAsRead,
    toggleReadStatus,
    deleteAllRead,
};
