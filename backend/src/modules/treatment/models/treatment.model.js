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
                medicine_id: {
                    type: Schema.Types.ObjectId,
                    ref: "Medicine", 
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
                },
                dispensed: {
                    type: Boolean,
                    default: false
                },
                dispensed_at: {
                    type: Date,
                    default: null
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

// =========================================================================
// --- MIDDLEWARE CHẠY NGẦM (HOOKS) XỬ LÝ AUTO-COMPLETE DENTAL RECORD ---
// =========================================================================

// Hàm Helper dùng chung để hệ thống quét và chốt Bệnh án
const checkAndCompleteDentalRecord = async function(recordId) {
    if (!recordId) return;
    
    try {
        const mongoose = require("mongoose");
        // Gọi model theo cách này để tránh lỗi "Circular Dependency" (2 model gọi chéo nhau)
        const Treatment = mongoose.model("Treatment");
        const DentalRecord = mongoose.model("DentalRecord");

        // 1. Lấy tất cả các Treatment thuộc về Bệnh án này
        const allTreatments = await Treatment.find({ record_id: recordId }).lean();

        if (allTreatments.length > 0) {
            // 2. Kiểm tra xem TẤT CẢ các điều trị đã được chốt sổ chưa?
            const isAllFinished = allTreatments.every(
                (t) => t.status === 'DONE' || t.status === 'CANCELLED'
            );

            // 3. Nếu tất cả đã xong, tiến hành tự động ĐÓNG Bệnh án
            if (isAllFinished) {
                const updatedRecord = await DentalRecord.findOneAndUpdate(
                    { 
                        _id: recordId, 
                        status: 'IN_PROGRESS' 
                    },
                    { 
                        status: 'COMPLETED', 
                        end_date: new Date() 
                    },
                    { new: true }
                );

                if (updatedRecord) {
                    console.log(`[System Background] Auto-completed DentalRecord: ${recordId}`);
                }
            }
        }
    } catch (error) {
        console.error("[Treatment Hook] Error auto-completing DentalRecord:", error);
    }
};

// Kích hoạt khi Bác sĩ/Nhân viên cập nhật Treatment (Dùng updateController)
treatmentSchema.post('findOneAndUpdate', async function(doc) {
    if (doc) {
        await checkAndCompleteDentalRecord(doc.record_id);
    }
});

// Đánh Index để tăng tốc độ truy vấn sau này
treatmentSchema.index({ patient_id: 1, appointment_id: 1 });

module.exports = mongoose.model("Treatment", treatmentSchema);