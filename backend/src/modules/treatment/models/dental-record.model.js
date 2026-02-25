const mongoose = require("mongoose");
const { Schema } = mongoose;

const dentalRecordSchema = new Schema(
    {
        // --- KHÓA NGOẠI (FOREIGN KEYS) ---
        patient_id: {
            type: Schema.Types.ObjectId,
            ref: "Patient", 
            required: true
        },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: "Staff", 
            required: true
        },

        // --- THÔNG TIN CÁ NHÂN (Snapshot tại thời điểm tạo) ---
        full_name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        gender: {
            type: Boolean 
        },
        dob: {
            type: Date
        },

        // --- THÔNG TIN HỒ SƠ BỆNH ÁN ---
        record_name: {
            type: String,
            required: true,
            trim: true
        },
        diagnosis: {
            type: String,
            trim: true
        },
        tooth_status: {
            type: String,
            trim: true
        },
        start_date: {
            type: Date,
            default: Date.now 
        },
        end_date: {
            type: Date
        },
        total_amount: {
            type: Number,
            default: 0,
            min: [0, "Total amount cannot be negative"]
        },
        status: {
            type: String,
            enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            default: 'IN_PROGRESS'
        }
    },
    { 
        timestamps: true, 
        collection: "dental_records" 
    }
);

// Đánh Index để tăng tốc độ tìm kiếm danh sách bệnh án của 1 bệnh nhân
dentalRecordSchema.index({ patient_id: 1 });
dentalRecordSchema.index({ created_by: 1 });

module.exports = mongoose.model("DentalRecord", dentalRecordSchema);