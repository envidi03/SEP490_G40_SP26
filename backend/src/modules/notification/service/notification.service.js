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

module.exports = {
    createNotification,
    sendToUser,
    sendToRole,
};
