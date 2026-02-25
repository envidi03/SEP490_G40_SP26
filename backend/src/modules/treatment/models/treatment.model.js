const mongoose = require("mongoose");
const { Schema } = mongoose;

const treatmentSchema = new Schema(
    {
        // --- CÁC TRƯỜNG KHÓA NGOẠI (FOREIGN KEYS) ---
        record_id: {
            type: Schema.Types.ObjectId,
            ref: "DentalRecord", 
            required: true
        },
        appointment_id: {
            type: Schema.Types.ObjectId,
            ref: "Appointment", 
            required: true
        },
        patient_id: {
            type: Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },
        doctor_id: {
            type: Schema.Types.ObjectId,
            ref: "Staff", 
            required: true
        },

        // --- THÔNG TIN ĐIỀU TRỊ ---
        tooth_position: {
            type: String,
            trim: true
        },
        phase: {
            type: String,
            enum: ['PLAN', 'SESSION'],
            required: true
        },
        quantity: {
            type: Number,
            min: [0, "Quantity cannot be negative"]
        },
        planned_price: {
            type: Number,
            min: [0, "Price cannot be negative"]
        },
        planned_date: {
            type: Date
        },
        performed_date: {
            type: Date
        },
        result: {
            type: String,
            trim: true
        },
        note: {
            type: String,
            trim: true
        },

        // --- SỬ DỤNG THUỐC (MẢNG LỒNG NHAU) ---
        medicine_usage: [
            {
                medicine_id: { // Đã sửa lỗi chính tả 'medicien_id' trong ảnh
                    type: Schema.Types.ObjectId,
                    ref: "Medicine", // Đổi tên ref theo đúng model Thuốc của bạn
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [0, "Medicine quantity cannot be negative"]
                },
                usage_instruction: {
                    type: String,
                    trim: true
                },
                note: {
                    type: String,
                    trim: true
                }
            }
        ],

        // --- TRẠNG THÁI ---
        status: {
            type: String,
            enum: ['PLANNED', 'APPROVED', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
            default: 'PLANNED'
        }
    },
    { 
        timestamps: true, 
        collection: "treatments" 
    }
);

// Đánh Index để tăng tốc độ truy vấn sau này (Ví dụ: tìm tất cả điều trị của 1 bệnh nhân)
treatmentSchema.index({ patient_id: 1, appointment_id: 1 });

module.exports = mongoose.model("Treatment", treatmentSchema);