const mongoose = require("mongoose");
const { Schema } = mongoose;

const patientSchema = new Schema(
    {
        account_id: {
            type: Schema.Types.ObjectId,
            ref: "Account",
            required: true,
            unique: true,
            index: true
        },

        profile_id: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
            unique: true,
            index: true
        },

        patient_code: {
            type: String,
            unique: true,
            index: true
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            required: true
        }
    },
    { timestamps: true, collection: "patients" }
);

// Tự động tạo patient_code trước khi save
patientSchema.pre('save', async function (next) {
    if (!this.patient_code) {
        const count = await mongoose.model('Patient').countDocuments();
        this.patient_code = `PT${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model("Patient", patientSchema);
