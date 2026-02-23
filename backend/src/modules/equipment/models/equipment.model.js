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
                    ref: "Room" // LƯU Ý: Thay 'Room' bằng tên model Phòng của bạn nếu khác
                },
                maintenance_date: {
                    type: Date,
                    default: Date.now
                },
                description: {
                    type: String
                },
                performed_by: {
                    type: String // Tên người thực hiện
                }
            }
        ],
        // Nhật ký sử dụng thiết bị
        equipments_log: [
            {
                doctor_id: {
                    type: Schema.Types.ObjectId,
                    ref: "User" // LƯU Ý: Thay 'User' hoặc 'Doctor' tùy theo tên model Bác sĩ của bạn
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