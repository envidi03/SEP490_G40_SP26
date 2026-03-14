const Notification = require('../model/notification.model');
const { emitToUser, emitToRole } = require('../../../socket');
const { getIO } = require('../../../socket');


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
        // Gửi theo danh sách role
        if (target_roles?.length > 0) {
            target_roles.forEach(role => emitToRole(role, 'new_notification', payload));
        }
        // Gửi theo danh sách user ID
        if (recipient_ids?.length > 0) {
            recipient_ids.forEach(id => emitToUser(id.toString(), 'new_notification', payload));
        }

    } else if (scope === 'GLOBAL') {
        getIO().emit('new_notification', payload);
    }

    // Cập nhật trạng thái kênh in_app
    notification.channels.in_app.status = 'SENT';
    notification.channels.in_app.sent_at = new Date();
};


/**
 * Tạo một thông báo mới, lưu DB và đẩy ra các kênh được bật.
 *
 * @param {object} payload
 * @param {string}        payload.type           - NOTIFICATION_TYPES enum (bắt buộc)
 * @param {string}        payload.title          - Tiêu đề (bắt buộc)
 * @param {string}        payload.message        - Nội dung (bắt buộc)
 * @param {string}        [payload.scope]        - 'INDIVIDUAL' | 'GROUP' | 'GLOBAL' (default: 'INDIVIDUAL')
 * @param {string|null}   [payload.sender_id]    - ID người gửi (null = hệ thống)
 * @param {string|null}   [payload.recipient_id] - ObjectId user nhận (scope INDIVIDUAL)
 * @param {string[]}      [payload.recipient_ids]- Mảng ObjectId (scope GROUP theo IDs)
 * @param {string[]}      [payload.target_roles] - Mảng role nhận (scope GROUP theo role)
 * @param {string[]}      [payload.exclude_ids]  - Mảng ObjectId bị loại trừ
 * @param {string|null}   [payload.action_url]   - URL điều hướng khi click thông báo
 * @param {string|null}   [payload.thumbnail]    - URL ảnh thumbnail
 * @param {object}        [payload.metadata]     - { entity_id, entity_type, extra_data }
 * @param {object}        [payload.channels]     - { in_app, email, zalo } — enabled flag
 * @param {Date|null}     [payload.expires_at]   - Thời điểm tự xóa (null = không xóa)
 *
 * @returns {Promise<Document>} - Notification document đã được lưu
 */
const createNotification = async (payload) => {
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

    // Merge channels: giữ default từ schema, ghi đè bằng những gì caller truyền vào
    const channelsConfig = {
        in_app: { enabled: true, ...channels.in_app },
        email: { enabled: false, ...channels.email },
        zalo: { enabled: false, ...channels.zalo },
    };

    // 1. Lưu vào DB với trạng thái ban đầu
    const notification = await Notification.create({
        sender_id,
        scope,
        type,
        recipient_id: recipient_id || null,
        recipient_ids: recipient_ids || [],
        target_roles: target_roles || [],
        exclude_ids: exclude_ids || [],
        title,
        message,
        action_url,
        thumbnail,
        metadata,
        channels: channelsConfig,
        expires_at,
    });

    // 2. Dispatch từng kênh — bọc try/catch riêng từng kênh,
    //    tránh 1 kênh lỗi làm sập toàn bộ luồng
    const updatePromises = [];

    // ── in_app ──
    if (channelsConfig.in_app.enabled) {
        try {
            await _dispatchInApp(notification);
        } catch (err) {
            console.warn('[Notification] in_app dispatch failed:', err.message);
            notification.channels.in_app.status = 'FAILED';
        }
        updatePromises.push('in_app');
    }

    // ── email ── (placeholder, sẽ implement _dispatchEmail sau)
    if (channelsConfig.email.enabled) {
        // TODO: await _dispatchEmail(notification);
        console.info('[Notification] email channel enabled but _dispatchEmail not implemented yet.');
    }

    // ── zalo ── (placeholder, sẽ implement _dispatchZalo sau)
    if (channelsConfig.zalo.enabled) {
        // TODO: await _dispatchZalo(notification);
        console.info('[Notification] zalo channel enabled but _dispatchZalo not implemented yet.');
    }

    // 3. Lưu lại trạng thái channels sau khi dispatch
    if (updatePromises.length > 0) {
        await notification.save();
    }

    return notification;
};

module.exports = {
    createNotification,
};
