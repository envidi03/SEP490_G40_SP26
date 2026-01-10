const mongoose = require("mongoose");
const { Schema } = mongoose;

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
        at: { type: Date, default: Date.now, index: true, expires: 60 * 60 * 24 * 30 },
    },
    { timestamps: true, collection: "login_attempts" }
);

// Index giúp tìm kiếm nhanh số lần đăng nhập sai từ 1 IP hoặc Email
loginAttemptSchema.index({ email: 1, at: -1 });
loginAttemptSchema.index({ ip: 1, at: -1 });

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);