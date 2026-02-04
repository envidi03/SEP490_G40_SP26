const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const accountSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
                },
                message: 'Email không hợp lệ'
            }
        },
        password: {
            type: String,
            required: true,
            select: false
        },

        role_id: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },

        // Trạng thái tài khoản (Login check cái này đầu tiên)
        status: {
            type: String,
            default: "PENDING",
            enum: ["ACTIVE", "INACTIVE", "PENDING"],
            required: true
        },

        email_verified: { type: Boolean, default: false },
        phone_number: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^(0|\+84)[0-9]{9}$/.test(v);
                },
                message: 'Số điện thoại không hợp lệ (phải là 10 số bắt đầu bằng 0 hoặc +84)'
            }
        },
    },
    { timestamps: true, collection: "accounts" }
);

// Method kiểm tra pass
accountSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.Account || mongoose.model("Account", accountSchema);