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

        dosage_form: {
            type: String,
            required: true,
            trim: true
        },

        unit: {
            type: String,
            required: true,
            trim: true
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
            type: Number,
            required: true,
            min: [0, "Số lượng tồn kho không được âm"],
            default: 0
        },

        medicine_restock_requests: {
            type: [medicineRestockRequestSchema],
            default: []
        },

        status: {
            /**
             * AVAILABLE   – Còn trong kho, trong hạn, sẵn sàng kê đơn
             * OUT_OF_STOCK – Hết số lượng nhưng vẫn trong danh mục
             * EXPIRED     – Quá hạn sử dụng, không được kê đơn
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

medicineSchema.index({ medicine_name: "text" });
medicineSchema.index({ status: 1 });
medicineSchema.index({ expiry_date: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);
