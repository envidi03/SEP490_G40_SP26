const mongoose = require("mongoose");
const { Schema } = mongoose;

const dentalRecordSchema = new Schema(
    {
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
            trim: true
        },
        gender: {
            type: String,
            trim: true
        },
        dob: {
            type: Date,
            required: [true, "Date of birth is required"]
        },
        record_name: {
            type: String,
            required: [true, "Record name is required"],
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
            required: [true, "Start date is required"]
        },
        end_date: {
            type: Date
        },
        total_amount: {
            type: Number,
            required: [true, "Total amount is required"],
            min: 0
        },
        status: {
            type: String,
            enum: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
            default: "IN_PROGRESS"
        }
    },
    { timestamps: true, collection: "dental_records" }
);

module.exports = mongoose.model("DentalRecord", dentalRecordSchema);