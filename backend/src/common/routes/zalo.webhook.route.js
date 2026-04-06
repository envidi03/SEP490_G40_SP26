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
    const challenge = req.query.challenge || 'ok';
    res.send(challenge);
});

/**
 * GET /api/zalo/link-url?accountId=xxx
 * Tạo link follow OA kèm accountId để webhook có thể tự động match.
 * Frontend gọi API này, lấy link rồi hiển thị nút "Liên kết Zalo OA" cho bệnh nhân.
 *
 * Cách hoạt động:
 *   1. Bệnh nhân bấm link này trên Zalo app
 *   2. Zalo mở trang OA → bệnh nhân Follow
 *   3. Zalo gửi webhook với extra_data = accountId
 *   4. Server match accountId → lưu zalo_user_id tự động
 */
router.get('/link-url', (req, res) => {
    const { accountId } = req.query;
    if (!accountId) {
        return res.status(400).json({ success: false, message: 'accountId is required' });
    }

    const oaId = process.env.ZALO_OA_ID;
    if (!oaId) {
        return res.status(500).json({ success: false, message: 'ZALO_OA_ID not configured in .env' });
    }

    // Link follow OA với extra_data = accountId
    // Khi user follow qua link này, Zalo gửi webhook kèm extra_data
    const followLink = `https://zalo.me/h/${oaId}?extraData=${encodeURIComponent(accountId)}`;

    return res.json({
        success: true,
        link: followLink,
        message: 'Chia sẻ link này cho bệnh nhân để họ Follow OA và liên kết tài khoản tự động.'
    });
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
 * Lưu zalo_user_id vào Account theo thứ tự ưu tiên:
 * 1. extra_data trong event (account_id truyền qua link follow) — chính xác nhất
 * 2. shared_info.phone (Zalo gửi nếu user đồng ý chia sẻ)
 * 3. Log để admin biết cần link thủ công
 */
async function _saveZaloUserId(zaloUserId, event) {
    try {
        // ── Cách 1: extra_data chứa account_id (khi dùng link liên kết từ web) ──
        // Link tạo từ API /api/zalo/link-url?accountId=xxx
        // Khi bệnh nhân bấm link đó để follow → Zalo đính kèm extra_data
        const extraData = event.extra_data || event.message?.text || null;
        if (extraData) {
            try {
                // extra_data có thể là JSON hoặc plain accountId string
                let accountId = extraData;
                if (extraData.startsWith('{')) {
                    const parsed = JSON.parse(extraData);
                    accountId = parsed.accountId || parsed.account_id || null;
                }
                if (accountId) {
                    const updated = await Account.findByIdAndUpdate(
                        accountId,
                        { $set: { zalo_user_id: zaloUserId } },
                        { new: true }
                    );
                    if (updated) {
                        logger.info(`[ZaloWebhook] ✅ Linked via extra_data: zalo_user_id ${zaloUserId} → account ${updated._id}`);
                        return;
                    }
                }
            } catch (_) { /* extra_data không phải JSON, bỏ qua */ }
        }

        // ── Cách 2: shared_info.phone (Zalo gửi khi user đồng ý chia sẻ) ──
        const sharedPhone = event.follower?.shared_info?.phone
            || event.info?.phone
            || null;

        if (sharedPhone) {
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
                logger.info(`[ZaloWebhook] ✅ Linked via phone: zalo_user_id ${zaloUserId} → account ${updated._id} (phone: ${normalizedPhone})`);
                return;
            }
        }

        // ── Không match được → log để biết ──
        logger.warn(`[ZaloWebhook] ⚠️ Cannot match zalo_user_id ${zaloUserId} to any account. Patient needs to use the link from the portal to link their Zalo.`);

    } catch (error) {
        logger.error('[ZaloWebhook] Error saving zalo_user_id:', { message: error.message });
    }
}

module.exports = router;
