const mongoose = require("mongoose");
const { Schema } = mongoose;

const licenseSchema = new Schema(
    {
        license_number: {
            type: String,
            required: [true, "License number is required"],
            trim: true
        },
        document_url: [
            {
                type: String // Mảng chứa các đường dẫn tài liệu
            }
        ],
        issued_by: {
            type: String,
            trim: true
        },
        issued_date: {
            type: Date
        },
        doctor_id: {
            type: Schema.Types.ObjectId,
            ref: "Staff", // Tham chiếu đến bác sĩ sở hữu giấy phép
            required: true
        }
    },
    { 
        timestamps: true, 
        collection: "licenses" 
    }
);

// Index để tối ưu việc tra cứu giấy phép theo số hiệu hoặc theo bác sĩ
licenseSchema.index({ license_number: 1 });
licenseSchema.index({ doctor_id: 1 });

module.exports = mongoose.model("License", licenseSchema);