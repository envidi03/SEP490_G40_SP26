const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
    {
        account_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },

        // Token hash (Bảo mật: không lưu raw token trong DB)
        refresh_token_hash: {
            type: String,
            required: true
        },

        ip: {
            type: String
        },
        user_agent: {
            type: String
        }, // Lưu tên trình duyệt/thiết bị

        expires_at: {
            type: Date,
            required: true,
            index: true
        },
        revoked_at: {
            type: Date,
            index: true
        },
        revoked_reason: {
            type: String
        }, // Lý do: "User logout", "Admin ban", "Security alert"
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'sessions'
    }
);

sessionSchema.index({ account_id: 1, revoked_at: 1 });
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);