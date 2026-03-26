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
            enum: ["pending", "accept", "reject", "completed"],
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
            // Tham chiếu đến bảng MedicineCategory
            type: Schema.Types.ObjectId,
            ref: "MedicineCategory",
            required: true
        },

        dosage: {
            // Hàm lượng hoạt chất: VD 500mg, 2%, 250mg/5ml
            type: String,
            trim: true,
            default: null
        },

        dosage_form: {
            /**
             * Dạng bào chế dược học của thuốc.
             * Chỉ mô tả DẠNG THUỐC, không liên quan đến cách đóng gói hay bán hàng.
             * VD: Thuốc Panadol → dosage_form = 'Viên nang'
             */
            type: String,
            enum: [
                "Viên nén",
                "Viên nang",
                "Viên sủi",
                "Viên ngậm",
                "Dung dịch",
                "Siro",
                "Hỗn dịch",
                "Kem",
                "Gel",
                "Bột",
                "Nhỏ giọt"
            ],
            trim: true,
            default: null
        },

        selling_unit: {
            /**
             * Đơn vị BÁN RA cho bệnh nhân (đơn vị được lưu trữ và quản lý tồn kho).
             * Trường `quantity` sẽ tính theo đơn vị này.
             * VD: Panadol → selling_unit = 'Vỉ' (kho có 100 VỈ)
             */
            type: String,
            enum: ['Viên', 'Vỉ', 'Hộp', 'Chai', 'Lọ', 'Tuýp', 'Gói', 'Ống', 'Bộ'],
            required: true,
            trim: true
        },

        base_unit: {
            /**
             * Đơn vị nhỏ nhất dùng để kê đơn.
             * VD: Panadol → base_unit = 'Viên' (bác sĩ kê "2 Viên/lần")
             */
            type: String,
            enum: ['Viên', 'ml', 'mg', 'Gói', 'Ống', 'Giọt'],
            required: true,
            trim: true
        },

        units_per_selling_unit: {
            /** 
             * Số lượng đơn vị kê đơn (base_unit) có trong 1 đơn vị bán (selling_unit).
             * Giúp hệ thống tự động trừ kho chính xác khi bác sĩ kê đơn theo Viên nhưng kho quản lý theo Vỉ.
             * VD: 1 Vỉ (selling_unit) có 10 Viên (base_unit) -> units_per_selling_unit = 10.
             */
            type: Number,
            required: true,
            default: 1,
            min: 1
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

        batch_number: {
            // Số lô: VD PCT-2024-001
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
        collection: "medicines",
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

medicineSchema.pre("save", function () {
    const now = new Date();

    if (this.expiry_date && this.expiry_date < now) {
        this.status = "EXPIRED";
    } else if (this.quantity <= 0) {
        this.status = "OUT_OF_STOCK";
    } else {
        this.status = "AVAILABLE";
    }
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
medicineSchema.index({ selling_unit: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);
