const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = new Schema(
    {
        patient_id: {
            type: Schema.Types.ObjectId,
            ref: "Patient", // Giả định bạn có model Patient
            required: true
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
            lowercase: true,
            trim: true
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

// Tạo index để tối ưu truy vấn theo ngày và bác sĩ
appointmentSchema.index({ appointment_date: 1, doctor_id: 1 });
appointmentSchema.index({ phone: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);