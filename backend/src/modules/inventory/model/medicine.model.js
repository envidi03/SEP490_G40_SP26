const mongoose = require("mongoose");
const { Schema } = mongoose;

const medicineRestockRequestSchema = new Schema(
    {
        request_by: {
            type: Schema.Types.ObjectId,
            ref: "Staff",
            required: true
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String,
            trim: true,
            default: null
        },
        reason: {
            type: String,
            trim: true,
            required: true
        },
        quantity_requested: {
            type: Number,
            required: true,
            min: [1, "Số lượng yêu cầu phải lớn hơn 0"]
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accept", "reject"],
            default: "pending",
            required: true
        }
    },
    { _id: true }
);

const medicineSchema = new Schema(
    {
        medicine_name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        category: {
            // Danh mục: Kháng sinh, Kháng viêm, Kháng histamin, Giảm đau...
            type: String,
            required: true,
            trim: true
        },

        dosage: {
            // Hàm lượng: VD 500mg, 2%, 250mg/5ml
            type: String,
            trim: true,
            default: null
        },

        dosage_form: {
            // Dạng bào chế: Viên, Nang, Dung dịch, Kem, Bột...
            type: String,
            required: true,
            trim: true
        },

        unit: {
            // Đơn vị tính: Viên, Hộp, Chai, Tuýp...
            type: String,
            required: true,
            trim: true
        },

        price: {
            // Giá bán / đơn vị (VNĐ)
            type: Number,
            required: true,
            min: [0, "Giá không được âm"]
        },

        manufacturer: {
            type: String,
            required: true,
            trim: true
        },

        distributor: {
            type: String,
            trim: true,
            default: null
        },

        expiry_date: {
            type: Date,
            required: true
        },

        quantity: {
            // Số lượng tồn kho hiện tại
            type: Number,
            required: true,
            min: [0, "Số lượng tồn kho không được âm"],
            default: 0
        },

        min_quantity: {
            // Tồn kho tối thiểu → cảnh báo khi quantity <= min_quantity
            type: Number,
            required: true,
            min: [0, "Tồn kho tối thiểu không được âm"],
            default: 0
        },

        last_import_date: {
            // Ngày nhập kho lần cuối
            type: Date,
            default: null
        },

        medicine_restock_requests: {
            type: [medicineRestockRequestSchema],
            default: []
        },

        status: {
            /**
             * AVAILABLE    – Còn trong kho, trong hạn, sẵn sàng kê đơn
             * OUT_OF_STOCK – Hết số lượng nhưng vẫn trong danh mục
             * EXPIRED      – Quá hạn sử dụng, không được kê đơn
             */
            type: String,
            enum: ["AVAILABLE", "OUT_OF_STOCK", "EXPIRED"],
            default: "AVAILABLE",
            required: true
        }
    },
    {
        timestamps: true,
        collection: "medicines"
    }
);

medicineSchema.pre("save", function (next) {
    const now = new Date();

    if (this.expiry_date && this.expiry_date < now) {
        this.status = "EXPIRED";
    } else if (this.quantity <= 0) {
        this.status = "OUT_OF_STOCK";
    } else {
        this.status = "AVAILABLE";
    }

    next();
});

// Virtual: kiểm tra thuốc sắp hết hàng (quantity <= min_quantity)
medicineSchema.virtual("is_low_stock").get(function () {
    return this.quantity <= this.min_quantity && this.quantity > 0;
});

medicineSchema.index({ medicine_name: "text" });
medicineSchema.index({ status: 1 });
medicineSchema.index({ expiry_date: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ quantity: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);
