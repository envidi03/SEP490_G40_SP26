const mongoose = require("mongoose");
const { Schema } = mongoose;

const TreatmentSchema = new Schema(
  {
    record_id: {
      type: Schema.Types.ObjectId,
      ref: "DentalRecord",
      required: true,
    },
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    tooth_position: {
      type: String,
      required: true,
    },
    phase: {
      type: String,
      enum: ["PLAN", "SESSION"],
    },
    quantity: {
      type: Number,
      required: true,
    },
    planned_price: {
        type: Number,
        required: true,
    },
    planned_date: {
        type: Date,
        required: true,
    },
    performed_date: {
        type: Date,
        required: true,
    },
    result: {
        type: String,
        trim: true,
    },
    note: {
        type: String,
        trim: true,
    },
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
                min: 0
            },
            usage_instructions: {
                type: String,
                trim: true
            },
            note: {
                type: String,
                trim: true
            }
        }
    ],
    status: {
        type: String,
        enum: ["PLANNED", "APPROVED", "IN_PROGRESS", "DONE", "CANCELED"],
        default: "PLANNED"
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Treatment", TreatmentSchema);
