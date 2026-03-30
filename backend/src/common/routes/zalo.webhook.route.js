const express = require('express');
const router = express.Router();
const Account = require('../../modules/auth/models/account.model');
const logger = require('../utils/logger');

/**
 * Zalo OA Webhook — nhận sự kiện từ Zalo Official Account.
 * Cấu hình URL này trong Zalo Developers > App > Webhook:
 *   https://sep490-g40-sp26.onrender.com/api/zalo/webhook
 *
 * Các sự kiện được xử lý:
 *   - follow     : Người dùng Follow OA → lưu zalo_user_id vào Account
 *   - unfollow   : Người dùng Unfollow OA → xóa zalo_user_id
 *   - user_send_text: Người dùng nhắn tin → lưu zalo_user_id (nếu chưa có)
 */

/**
 * GET /api/zalo/webhook
 * Zalo dùng để xác minh webhook URL khi bạn cấu hình lần đầu.
 */
router.get('/webhook', (req, res) => {
    logger.info('[ZaloWebhook] Webhook verification request received.');
    // Zalo gửi challenge, server phải trả về nguyên vẹn
    const challenge = req.query.challenge || 'ok';
    res.send(challenge);
});

/**
 * POST /api/zalo/webhook
 * Nhận các sự kiện từ Zalo OA (follow, unfollow, nhắn tin...).
 */
router.post('/webhook', async (req, res) => {
    try {
        // Luôn trả về 200 ngay cho Zalo (Zalo sẽ retry nếu không nhận được 200)
        res.status(200).json({ error: 0 });

        const event = req.body;
        logger.info('[ZaloWebhook] Event received:', { event_name: event.event_name, sender: event.sender?.id });

        const zaloUserId = event.sender?.id;
        if (!zaloUserId) return;

        // Xử lý sự kiện FOLLOW OA hoặc nhắn tin (user_send_text)
        // → Tìm Account có phone trùng + lưu zalo_user_id
        if (event.event_name === 'follow' || event.event_name === 'user_send_text') {
            await _saveZaloUserId(zaloUserId, event);
        }

        // Xử lý sự kiện UNFOLLOW OA → xóa zalo_user_id
        if (event.event_name === 'unfollow') {
            await Account.findOneAndUpdate(
                { zalo_user_id: zaloUserId },
                { $set: { zalo_user_id: null } }
            );
            logger.info(`[ZaloWebhook] Removed zalo_user_id for user ${zaloUserId} (unfollowed)`);
        }

    } catch (error) {
        logger.error('[ZaloWebhook] Error processing event:', { message: error.message });
    }
});

/**
 * Lưu zalo_user_id vào Account.
 * Zalo cung cấp shared_info (nếu người dùng đã đồng ý chia sẻ) trong event follow.
 * Zalo cũng cung cấp số điện thoại trong shared_info để khớp với Account.
 */
async function _saveZaloUserId(zaloUserId, event) {
    try {
        // Thử lấy số điện thoại từ shared_info (Zalo gửi khi follow có chia sẻ thông tin)
        const sharedPhone = event.follower?.shared_info?.phone
            || event.info?.phone
            || null;

        if (sharedPhone) {
            // Chuẩn hóa SĐT: 84xxxxxxxxx → 0xxxxxxxxx
            let normalizedPhone = sharedPhone.toString().replace(/^\+/, '');
            if (normalizedPhone.startsWith('84')) {
                normalizedPhone = '0' + normalizedPhone.substring(2);
            }

            const updated = await Account.findOneAndUpdate(
                { phone_number: normalizedPhone },
                { $set: { zalo_user_id: zaloUserId } },
                { new: true }
            );

            if (updated) {
                logger.info(`[ZaloWebhook] ✅ Linked zalo_user_id ${zaloUserId} to account ${updated._id} (phone: ${normalizedPhone})`);
                return;
            }
        }

        // Nếu không có SĐT shared, chỉ upsert zalo_user_id vào account đã có sẵn
        // (Trường hợp user đã từng link trước đó)
        const existing = await Account.findOne({ zalo_user_id: zaloUserId });
        if (!existing) {
            logger.info(`[ZaloWebhook] No matching account for zalo_user_id ${zaloUserId}. Will be matched when user links account.`);
        }

    } catch (error) {
        logger.error('[ZaloWebhook] Error saving zalo_user_id:', { message: error.message });
    }
}

module.exports = router;
