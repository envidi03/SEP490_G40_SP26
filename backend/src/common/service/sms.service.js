const logger = require('../utils/logger');

const ESMS_API_URL = 'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/';

/**
 * Gửi SMS qua ESMS API.
 * Tài liệu: https://esms.vn/tai-lieu-api
 *
 * @param {string|string[]} phones - SĐT hoặc mảng SĐT (định dạng: 0987654321)
 * @param {string} content - Nội dung SMS (tối đa 160 ký tự/tin, tự động chia nếu dài hơn)
 * @returns {Promise<object>} - Kết quả từ ESMS API
 */
const sendSMS = async (phones, content) => {
    try {
        const apiKey    = process.env.ESMS_API_KEY;
        const secretKey = process.env.ESMS_SECRET_KEY;
        const brandName = process.env.ESMS_BRAND_NAME || '';
        const smsType   = process.env.ESMS_SMS_TYPE   || '8';

        logger.info('[SMSService] Preparing to send SMS', { phones: phones, content: content });
        logger.info('[SMSService] Using ESMS API', {
            apiKey: apiKey,
            brandName: brandName,
            secretKey: secretKey,
            smsType: smsType,
            apiUrl: ESMS_API_URL
        });

        if (!apiKey || !secretKey) {
            logger.warn('[SMSService] Missing ESMS_API_KEY or ESMS_SECRET_KEY in .env');
            return { CodeResult: '-1', ErrorMessage: 'Missing ESMS credentials' };
        }

        // Chuẩn hóa danh sách SĐT
        const phoneList = Array.isArray(phones) ? phones : [phones];
        const normalizedPhones = phoneList
            .map(p => {
                let phone = p.toString().replace(/\s/g, '');
                // 0xxx → 84xxx
                if (phone.startsWith('0')) phone = '84' + phone.substring(1);
                // Bỏ dấu +
                phone = phone.replace(/^\+/, '');
                return phone;
            })
            .filter(Boolean)
            .join(',');

        if (!normalizedPhones) {
            logger.warn('[SMSService] No valid phone numbers to send SMS');
            return { CodeResult: '-1', ErrorMessage: 'No valid phone numbers' };
        }

        const body = {
            ApiKey: apiKey,
            SecretKey: secretKey,
            Phone: normalizedPhones,
            Content: content,
            Brandname: brandName,
            SmsType: smsType,
            IsUnicode: content.match(/[^\x00-\x7F]/) ? '1' : '0', // Tự detect unicode (tiếng Việt)
            Sandbox: process.env.NODE_ENV === 'production' ? '0' : '1' // Sandbox khi dev
        };

        logger.info(`[SMSService] Sending SMS to ${normalizedPhones}`);

        const response = await fetch(ESMS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (result.CodeResult === '100') {
            logger.info(`[SMSService] ✅ SMS sent successfully to ${normalizedPhones}`);
        } else {
            logger.warn(`[SMSService] SMS failed: Code=${result.CodeResult}, Message=${result.ErrorMessage}`);
        }

        return result;

    } catch (error) {
        logger.error('[SMSService] Error sending SMS:', { message: error.message });
        return { CodeResult: '-500', ErrorMessage: error.message };
    }
};

module.exports = { sendSMS };
