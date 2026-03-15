const Notification = require('../model/notification.model');
const { emitToUser, emitToRole, getIO } = require('../../../socket');
const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');

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
            // TODO: await _dispatchEmail(notification);
            logger.info('[Notification] email channel: _dispatchEmail not implemented yet.');
        }

        if (channelsConfig.zalo.enabled) {
            // TODO: await _dispatchZalo(notification);
            logger.info('[Notification] zalo channel: _dispatchZalo not implemented yet.');
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
        const pageNum  = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip     = (pageNum - 1) * limitNum;

        // Lấy thông báo thuộc về user cụ thể, hoặc gửi theo role của họ, hoặc GLOBAL
        const filter = {
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

        // Tính toán field is_read thực tế cho từng thông báo trả về
        const formattedData = notifications.map(notif => {
            let is_read = false;
            // Xử lý cẩn thận do lúc trước code sinh nhầm `_id` mà không có `user_id`
            const hasRead = (notif.read_by || []).some(entry => {
                const checkedId = entry.user_id || entry._id; // Fallback cho dữ liệu lỗi lúc nãy
                return checkedId && checkedId.toString() === userId.toString();
            });

            if (notif.scope === 'INDIVIDUAL') {
                is_read = notif.status === 'READ';
            } else {
                // GROUP, GLOBAL: đã đọc nếu userId nằm trong mảng read_by (trường user_id hoặc fallback _id)
                is_read = hasRead;
            }
            return {
                ...notif,
                is_read // Field phụ để frontend dùng dễ hiểu hơn
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
        // Chỉ đếm các thông báo UNREAD VÀ (userId không nằm trong read_by.user_id VÀ read_by._id)
        const count = await Notification.countDocuments({
            status: 'UNREAD',
            'read_by.user_id': { $ne: userId },
            'read_by._id': { $ne: userId }, // Fallback thêm cho những data lỡ tạo sai lúc nãy
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

module.exports = {
    createNotification,
    sendToUser,
    sendToRole,
    sendToGroup,
    sendGlobal,
    getNotifications,
    getUnreadCount,
    markAsRead,
};
