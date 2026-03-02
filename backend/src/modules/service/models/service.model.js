const mongoose = require("mongoose");
const { Schema } = mongoose;

const serviceSchema = new Schema(
    {
        service_name: {
            type: String,
            required: [true, "Service name is required."],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            required: [true, "Service fees are mandatory."],
            min: [0, "Price must be a positive number"]
        },
        duration: {
            type: Number, // Thường tính bằng phút
            required: [true, "Duration of service is required."],
            min: [0, "Duration must be a positive number"]
        },
        icon: {
            type: String, // Lưu URL hoặc tên class icon
            default: ""
        },
        status: {
            type: String,
            enum: ["AVAILABLE", "UNAVAILABLE"],
            default: "AVAILABLE"
        },
        // Danh sách thiết bị cần thiết cho dịch vụ này
        equipment_service: [
            {
                equipment_id: {
                    type: Schema.Types.ObjectId,
                    ref: "Equipment",
                    required: true
                },
                required_qty: {
                    type: Number,
                    default: 1,
                    min: [1, "Minimum quantity is 1"]
                },
                note: {
                    type: String,
                    trim: true
                }
            }
        ]
    },
    { 
        timestamps: true, 
        collection: "services" 
    }
);

serviceSchema.index({ service_name: "text" });

module.exports = mongoose.model("Service", serviceSchema);