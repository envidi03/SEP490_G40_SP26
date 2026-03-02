const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = new Schema(
    {
        patient_id: {
            type: Schema.Types.ObjectId,
            ref: "Patient", 
            required: false,
            default: null
        },
        doctor_id: {
            type: Schema.Types.ObjectId,
            ref: "Staff", 
            required: false,
            default: null
        },
        full_name: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        appointment_date: {
            type: Date,
            required: [true, "Appointment date is required"]
        },
        queue_number: {
            type: Number
        },
        appointment_time: {
            type: String, // Định dạng "HH:mm" (ví dụ: "14:30")
            required: [true, "Appointment time is required"]
        },
        reason: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: [
                "SCHEDULED", 
                "CHECKED_IN", 
                "IN_CONSULTATION", 
                "COMPLETED", 
                "CANCELLED", 
                "NO_SHOW"
            ],
            default: "SCHEDULED"
        },
        book_service: [
            {
                service_id: {
                    type: Schema.Types.ObjectId,
                    ref: "Service",
                    required: true
                },
                unit_price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ]
    },
    { 
        timestamps: true, 
        collection: "appointments" 
    }
);

// Đánh index để tăng tốc độ truy vấn
appointmentSchema.index({ appointment_date: 1, doctor_id: 1 });
appointmentSchema.index({ phone: 1 });

// --- ĐÃ SỬA LỖI LOGIC Ở ĐÂY ---
// Hàm static để lấy số thứ tự lớn nhất trong ngày
appointmentSchema.statics.getNextQueueNumber = async function(date) {
    // 1. Tạo mốc bắt đầu ngày (00:00:00.000)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // 2. Tạo mốc kết thúc ngày (23:59:59.999)
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 3. Tìm lịch hẹn có queue_number lớn nhất TRONG KHOẢNG thời gian đó
    const lastAppointment = await this.findOne({
        appointment_date: {
            $gte: startOfDay, // >= Đầu ngày
            $lte: endOfDay    // <= Cuối ngày
        },
        queue_number: { $exists: true, $ne: null } // Chỉ tìm những người đã được cấp số
    })
    .sort({ queue_number: -1 }) // Sắp xếp giảm dần để lấy số to nhất đưa lên đầu
    .select('queue_number')
    .lean();

    // 4. Nếu chưa có ai check-in hôm đó, trả về 1, ngược lại cộng thêm 1
    return lastAppointment && lastAppointment.queue_number 
        ? lastAppointment.queue_number + 1 
        : 1;
};

module.exports = mongoose.model("Appointment", appointmentSchema);