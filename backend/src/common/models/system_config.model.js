const mongoose = require('mongoose');

/**
 * SystemConfig — Bảng lưu cấu hình động của hệ thống (key-value).
 * Dùng để lưu Zalo Access Token/Refresh Token (và các config khác nếu cần).
 */
const systemConfigSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

/**
 * Lấy giá trị theo key. Trả về null nếu không tìm thấy.
 */
systemConfigSchema.statics.get = async function (key) {
    const doc = await this.findOne({ key }).lean();
    return doc ? doc.value : null;
};

/**
 * Lưu (upsert) giá trị theo key.
 */
systemConfigSchema.statics.set = async function (key, value, description = '') {
    return this.findOneAndUpdate(
        { key },
        { key, value, description },
        { upsert: true, new: true }
    );
};

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

module.exports = SystemConfig;
