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
            required: [true, "Họ và tên không được để trống"],
            trim: true
        },
        phone: {
            type: String,
            required: [true, "Số điện thoại không được để trống"],
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        appointment_date: {
            type: Date,
            required: [true, "Ngày hẹn không được để trống"]
        },
        queue_number: {
            type: Number
        },
        appointment_time: {
            type: String,
            required: [true, "Giờ hẹn không được để trống"]
        },
        reason: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: {
                values: ["SCHEDULED", "PENDING_CONFIRMATION", "CHECKED_IN", "IN_CONSULTATION", "COMPLETED", "CANCELLED", "NO_SHOW"],
                message: "Trạng thái '{VALUE}' không hợp lệ"
            },
            default: "SCHEDULED"
        },
        book_service: [
            {
                service_id: {
                    type: Schema.Types.ObjectId,
                    ref: "Service",
                    required: [true, "Vui lòng chọn dịch vụ"]
                },
                sub_service_id: {
                    type: Schema.Types.ObjectId,
                    ref: "SubService",
                    default: null
                },
                unit_price: {
                    type: Number,
                    required: [true, "Đơn giá không được để trống"],
                    min: [0, "Đơn giá không được nhỏ hơn 0"]
                }
            }
        ],
        priority: {
            type: Number,
            default: 2, // 1: Cao, 2: Bình thường, 3: Thấp
        },
        reminders_sent: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true,
        collection: "appointments"
    }
);

appointmentSchema.index({ appointment_date: 1, doctor_id: 1 });
appointmentSchema.index({ phone: 1 });

appointmentSchema.statics.getNextQueueNumber = async function (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const lastAppointment = await this.findOne({
        appointment_date: { $gte: startOfDay, $lte: endOfDay },
        queue_number: { $exists: true, $ne: null }
    })
        .sort({ queue_number: -1 })
        .select('queue_number')
        .lean();

    return lastAppointment && lastAppointment.queue_number ? lastAppointment.queue_number + 1 : 1;
};

module.exports = mongoose.model("Appointment", appointmentSchema);