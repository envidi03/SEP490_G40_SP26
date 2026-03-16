const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
    sepay_id: {
        type: String,
        required: true,
        unique: true, 
        index: true
    },
    invoice_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice', 
        default: null
    },
    invoice_code: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    reference_code: {
        type: String,
        default: ''
    },
    raw_content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['MATCHED', 'UNMATCHED', 'MANUAL_MATCHED'],
        default: 'UNMATCHED'
    },
    transaction_date: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentTransactionSchema, 'payment');