const mongoose = require("mongoose");
const { Schema } = mongoose;

const equipmentSchema = new Schema(
    {
        equipment_name: {
            type: String,
            required: true, // Bắt buộc nhập tên thiết bị
            trim: true
        },
        equipment_type: {
            type: String,
            required: true,
            trim: true
        },
        equipment_serial_number: {
            type: String,
            unique: true,
        },
        purchase_date: {
            type: Date,
            default: Date.now,
            immutable: true
        },
        supplier: {
            type: String,
            trim: true
        },
        warranty: {
            type: Date
        },
        status: {
            type: String,
            enum: [
                "READY",        // Sẵn sàng
                "IN_USE",       // Đang sử dụng
                "MAINTENANCE",  // Bảo trì
                "REPAIRING",    // Đang sửa chữa
                "FAULTY",       // Bị hỏng
                "STERILIZING"   // Đang khử trùng
            ],
            default: "READY",
            required: true
        },
        // Lịch sử bảo trì (Sửa lỗi chính tả từ 'maintence' trong ảnh thành 'maintenance')
        maintenance_history: [
            {
                room_id: {
                    type: Schema.Types.ObjectId,
                    ref: "Room"
                },
                appointment_id: {
                    type: Schema.Types.ObjectId,
                    ref: "Appointment"
                },
                maintenance_date: {
                    type: Date,
                    default: Date.now
                },
                issue_type: {
                    type: String,
                    enum: ["MALFUNCTION", "MAINTENANCE", "BROKEN", "MISSING", "OTHER"],
                    default: "OTHER"
                },
                severity: {
                    type: String,
                    enum: ["LOW", "MEDIUM", "HIGH"],
                    default: "LOW"
                },
                description: {
                    type: String
                },
                reported_by: {
                    type: Schema.Types.ObjectId,
                    ref: "Staff"
                },
                performed_by: {
                    type: String // Tên người thực hiện sửa chữa/bảo trì
                }
            }
        ],
        // Nhật ký sử dụng thiết bị
        equipments_log: [
            {
                doctor_id: {
                    type: Schema.Types.ObjectId,
                    ref: "Staff" 
                },
                usage_date: {
                    type: Date,
                    default: Date.now
                },
                purpose: {
                    type: String
                },
                note: {
                    type: String
                }
            }
        ]
    },
    {
        timestamps: true,
        collection: "equipments"
    }
);

module.exports = mongoose.model("Equipment", equipmentSchema);