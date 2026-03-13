const mongoose = require("mongoose");
const { Schema } = mongoose;

const subServiceSchema = new Schema(
    {
        // Tham chiếu về dịch vụ cha
        parent_id: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: [true, "Parent service ID is required"]
        },

        sub_service_name: {
            type: String,
            required: [true, "Sub-service name is required"],
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        price: {
            type: Number,
            min: [0, "Price must be a positive number"],
            default: 0
        },

        duration: {
            type: Number, // Tính bằng phút
            min: [0, "Duration must be a positive number"],
            default: 0
        },

        icon: {
            type: String,
            default: ""
        },
        images: {
            type: [String], // Mảng URL ảnh bổ sung
            default: []
        },

        status: {
            type: String,
            enum: ["AVAILABLE", "UNAVAILABLE"],
            default: "AVAILABLE"
        },

        note: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "sub_services"
    }
);

// Index để query nhanh theo parent_id
subServiceSchema.index({ parent_id: 1 });
subServiceSchema.index({ sub_service_name: "text" });

module.exports = mongoose.model("SubService", subServiceSchema);
