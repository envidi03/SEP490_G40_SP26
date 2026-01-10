const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        account_id: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: true,
            unique: true,
            index: true
        },

        full_name: {
            type: String,
            required: true
        },
        dob: {
            type: Date
        },
        gender: {
            type: String,
            enum: ["MALE", "FEMALE", "OTHER"]
        },
        address: {
            type: String
        },
        avatar_url: {
            type: String,
            default: ""
        },

        // Các cờ cài đặt thông báo (User setting)
        notify_upcoming: {
            type: Boolean,
            default: true
        },
        notify_results: {
            type: Boolean,
            default: true
        },

        // Cờ đánh dấu nhanh loại user (để Frontend dễ render giao diện mà không cần check sâu role)
        is_doctor: {
            type: Boolean,
            default: false
        },
        is_patient: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true, collection: "users" }
);

module.exports = mongoose.model("User", userSchema);