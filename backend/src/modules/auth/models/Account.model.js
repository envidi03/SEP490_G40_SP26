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
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        }, // select: false để không trả về password khi query thường

        role_id: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },

        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        // Trạng thái tài khoản (Login check cái này đầu tiên)
        status: {
            type: String,
            default: "ACTIVE",
            enum: ["ACTIVE", "INACTIVE", "LOCKED", "BANNED"],
            required: true
        },

        email_verified: { type: Boolean, default: false },
        phone_number: { type: String, unique: true, sparse: true, trim: true },
    },
    { timestamps: true, collection: "accounts" }
);

// Middleware Hash Password
accountSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

// Method kiểm tra pass
accountSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Account", accountSchema);