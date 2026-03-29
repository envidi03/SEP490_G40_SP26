const logger = require('../utils/logger');
const SystemConfig = require('../models/system_config.model');

const ZALO_CONFIG_KEY = 'ZALO_AUTH';
const TOKEN_BUFFER_SECONDS = 300; // Refresh sớm 5 phút trước khi hết hạn để an toàn

/**
 * Zalo Service — quản lý token ZNS và gửi tin nhắn ZNS qua Zalo OA.
 * Token được lưu trong MongoDB (collection: SystemConfig) để bền vững
 * qua các lần restart server trên Render.
 */
class ZaloService {
    constructor() {
        this.appId = process.env.ZALO_APP_ID;
        this.appSecret = process.env.ZALO_APP_SECRET;
        this.znsApiUrl = 'https://business.openapi.zalo.me/message/template';
        this.tokenApiUrl = 'https://oauth.zaloapp.com/v4/oa/access_token';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2A — Seed token ban đầu từ .env vào DB (chỉ nếu chưa có trong DB)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Gọi 1 lần khi server khởi động (trong server.js).
     * Nếu DB chưa có token => lấy từ .env và lưu vào.
     * Nếu DB đã có token rồi => bỏ qua (không ghi đè).
     */
    async initTokens() {
        try {
            const existing = await SystemConfig.get(ZALO_CONFIG_KEY);
            if (existing && existing.access_token) {
                logger.info('[ZaloService] Zalo tokens already initialized in DB. Skipping.');
                return;
            }

            const accessToken = process.env.ZALO_OA_ACCESS_TOKEN;
            const refreshToken = process.env.ZALO_OA_REFRESH_TOKEN;

            if (!accessToken || !refreshToken) {
                logger.warn('[ZaloService] Missing ZALO_OA_ACCESS_TOKEN or ZALO_OA_REFRESH_TOKEN in .env. Zalo ZNS will be disabled.');
                return;
            }

            await SystemConfig.set(ZALO_CONFIG_KEY, {
                access_token: accessToken,
                refresh_token: refreshToken,
                // expires_at: 0 => sẽ refresh ngay lần đầu gọi
                expires_at: Date.now() - 1000,
            }, 'Zalo OA Access/Refresh Token for ZNS');

            logger.info('[ZaloService] ✅ Zalo tokens seeded from .env to DB successfully.');
        } catch (error) {
            logger.error('[ZaloService] Error initializing Zalo tokens:', { message: error.message });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2B — Tự động lấy Access Token hợp lệ (refresh nếu cần)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lấy Access Token hợp lệ từ DB.
     * Nếu token sắp hết hạn hoặc đã hết hạn => tự động refresh trước.
     * @returns {Promise<string|null>} Access Token hoặc null nếu thất bại
     */
    async getValidAccessToken() {
        try {
            const config = await SystemConfig.get(ZALO_CONFIG_KEY);

            if (!config) {
                logger.warn('[ZaloService] No Zalo token found in DB. Run initTokens() first.');
                return null;
            }

            const now = Date.now();
            const isExpiringSoon = config.expires_at <= now + TOKEN_BUFFER_SECONDS * 1000;

            if (isExpiringSoon) {
                logger.info('[ZaloService] Access Token expired or expiring soon. Refreshing...');
                const newAccessToken = await this.refreshTokens(config.refresh_token);
                return newAccessToken;
            }

            return config.access_token;
        } catch (error) {
            logger.error('[ZaloService] Error getting valid access token:', { message: error.message });
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2C — Gọi Zalo API để refresh token, lưu kết quả vào MongoDB
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Dùng Refresh Token để xin Access Token mới từ Zalo.
     * Lưu cả 2 token mới vào DB để bền vững.
     * @param {string} refreshToken - Refresh token hiện tại (lấy từ DB)
     * @returns {Promise<string|null>} Access Token mới hoặc null nếu thất bại
     */
    async refreshTokens(refreshToken) {
        try {
            if (!refreshToken || !this.appId || !this.appSecret) {
                logger.warn('[ZaloService] Missing credentials to refresh Zalo token.');
                return null;
            }

            const response = await fetch(this.tokenApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'secret_key': this.appSecret
                },
                body: new URLSearchParams({
                    refresh_token: refreshToken,
                    app_id: this.appId,
                    grant_type: 'refresh_token'
                })
            });

            const data = await response.json();

            if (!data.access_token) {
                logger.error('[ZaloService] Token refresh failed:', data);
                return null;
            }

            // Access token Zalo sống 1 tiếng (3600 giây)
            const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;

            // Lưu token mới vào MongoDB — bền vững qua các lần restart
            await SystemConfig.set(ZALO_CONFIG_KEY, {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: expiresAt,
            }, 'Zalo OA Access/Refresh Token for ZNS');

            logger.info('[ZaloService] ✅ Tokens refreshed and saved to DB successfully.');
            return data.access_token;

        } catch (error) {
            logger.error('[ZaloService] Error refreshing Zalo tokens:', { message: error.message });
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2D — Gửi tin nhắn ZNS thật qua Zalo API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Gửi ZNS Message via Zalo Official Account.
     * @param {string} phone - SĐT người nhận (định dạng: 84987654321 hoặc 0987654321)
     * @param {string} templateId - ID của Template ZNS đã được Zalo duyệt
     * @param {object} templateData - Object chứa các biến của template (ví dụ: { name: 'Nguyễn A', date: '01/01/2026' })
     * @returns {Promise<object>} - Kết quả từ Zalo API
     */
    async sendZNS(phone, templateId, templateData) {
        try {
            const accessToken = await this.getValidAccessToken();
            if (!accessToken) {
                logger.warn('[ZaloService] No valid Access Token. ZNS not sent.');
                return { error: -1, message: 'No valid Access Token' };
            }

            // Chuẩn hóa SĐT: 0xxx -> 84xxx
            let formattedPhone = phone ? phone.toString().replace(/\s/g, '') : '';
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '84' + formattedPhone.substring(1);
            }
            // Bỏ dấu +
            formattedPhone = formattedPhone.replace(/^\+/, '');

            const body = {
                phone: formattedPhone,
                template_id: templateId,
                template_data: templateData,
                tracking_id: `zns_${Date.now()}`
            };

            logger.info(`[ZaloService] Sending ZNS to ${formattedPhone} with template ${templateId}`);

            const response = await fetch(this.znsApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': accessToken
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (result.error !== 0) {
                logger.error('[ZaloService] ZNS send failed:', result);
            } else {
                logger.info(`[ZaloService] ✅ ZNS sent successfully to ${formattedPhone}`);
            }

            return result;
        } catch (error) {
            logger.error('[ZaloService] Error sending ZNS:', { message: error.message });
            return { error: -500, message: error.message };
        }
    }
}

module.exports = new ZaloService();
