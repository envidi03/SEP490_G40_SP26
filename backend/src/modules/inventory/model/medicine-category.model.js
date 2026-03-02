const mongoose = require("mongoose");
const { Schema } = mongoose;

const medicineCategorySchema = new Schema(
    {
        name: {
            // VD: "Kháng sinh", "Kháng viêm", "Kháng histamin", "Giảm đau - Hạ sốt", "Vitamin & Khoáng chất"
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            trim: true,
            default: null
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true,
        collection: "medicine_categories"
    }
);

module.exports = mongoose.model("MedicineCategory", medicineCategorySchema);
