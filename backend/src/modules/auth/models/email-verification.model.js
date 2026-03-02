const mongoose = require("mongoose");
const { Schema } = mongoose;

const emailVerificationSchema = new Schema(
    {
        token_hash: {
            type: String,
            required: true
        },
        expires_at: {
            type: Date,
            required: true,
            index: true
        },
        used: {
            type: Boolean,
            default: false,
            index: true
        },

        account_id: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: true,
            index: true
        },
    },
    { timestamps: true, collection: "email_verifications" }
);

// Tự động xóa bản ghi khi hết hạn
emailVerificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EmailVerification", emailVerificationSchema);