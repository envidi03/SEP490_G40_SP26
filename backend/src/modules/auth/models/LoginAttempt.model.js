const mongoose = require("mongoose");
const { Schema } = mongoose;

// TTL cho login attempts (30 ngày)
const LOGIN_ATTEMPT_TTL_DAYS = 30;
const LOGIN_ATTEMPT_TTL_SECONDS = 60 * 60 * 24 * LOGIN_ATTEMPT_TTL_DAYS;

const loginAttemptSchema = new Schema(
    {
        ip: {
            type: String
        },
        email: {
            type: String,
            trim: true
        },
        ok: {
            type: Boolean,
            required: true
        }, // true: Đăng nhập thành công, false: Thất bại
        reason: {
            type: String
        }, // Lý do thất bại: "Sai mật khẩu", "Tài khoản bị khóa"

        account_id: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            index: true
        },
        user_agent: {
            type: String
        },

        // Tự động xóa log sau 30 ngày để giảm tải DB
        at: { type: Date, default: Date.now, index: true, expires: LOGIN_ATTEMPT_TTL_SECONDS },
    },
    { timestamps: true, collection: "login_attempts" }
);

// Index giúp tìm kiếm nhanh số lần đăng nhập sai từ 1 IP hoặc Email
loginAttemptSchema.index({ email: 1, at: -1 });
loginAttemptSchema.index({ ip: 1, at: -1 });

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);