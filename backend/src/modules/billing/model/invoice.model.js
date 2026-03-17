const mongoose = require('mongoose');
const { Schema } = mongoose;

const invoiceSchema = new Schema(
    {
        // Mã hóa đơn tự động tăng: INV001, INV002...
        invoice_code: {
            type: String,
            unique: true,
            index: true
        },

        patient_id: {
            type: Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
            index: true
        },

        appointment_id: {
            type: Schema.Types.ObjectId,
            ref: 'Appointment',
            required: false,
            index: true
        },

        invoice_date: {
            type: Date,
            default: Date.now
        },

        // Danh sách dịch vụ trong hóa đơn
        items: [
            {
                service_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Service',
                    required: true
                },
                sub_service_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'SubService',
                    required: false,
                    default: null
                },
                service_name: {
                    type: String,   // lưu lại tên dịch vụ tại thời điểm tạo HĐ
                    required: true  // tránh bị ảnh hưởng nếu service bị đổi tên
                },
                sub_service_name: {
                    type: String,
                    required: false
                },
                unit_price: {
                    type: Number,
                    required: true,
                    min: 0
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                    min: 1
                },
                amount: {
                    type: Number,   // = unit_price * quantity, tính tự động
                    required: true,
                    min: 0
                }
            }
        ],

        total_amount: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },

        // PENDING    → HĐ vừa tạo, chờ lễ tân xác nhận
        // COMPLETED  → Lễ tân đã xác nhận bệnh nhân thanh toán xong
        // CANCELLED  → Hủy (bác sĩ kê nhầm, cần tạo lại)
        status: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
            default: 'PENDING',
            required: true
        },

        // Nhân viên lễ tân tạo hóa đơn
        created_by: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            required: false
        },

        note: {
            type: String,
            default: ''
        },
        payment_method: {
            type: String,
            enum: ['CASH', 'TRANSFER'],
            default: 'CASH',
            required: true
        }
    },
    { timestamps: true, collection: 'invoices' }
);

// Tự động tạo invoice_code trước khi save (INV000001, INV000002...)
invoiceSchema.pre('save', async function () {
    if (!this.invoice_code) {
        const count = await mongoose.model('Invoice').countDocuments();
        this.invoice_code = `INV${String(count + 1).padStart(6, '0')}`;
    }
});

// Tự động tính amount của từng item trước khi save
invoiceSchema.pre('save', function () {
    if (this.items && this.items.length > 0) {
        this.items.forEach(item => {
            item.amount = item.unit_price * item.quantity;
        });
        this.total_amount = this.items.reduce((sum, item) => sum + item.amount, 0);
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
