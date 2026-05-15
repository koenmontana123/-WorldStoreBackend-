const mongoose = require('mongoose');

const mpesaTransactionSchema = new mongoose.Schema({
    merchantRequestId: { type: String, required: true, index: true },
    checkoutRequestId: { type: String, required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    phoneNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    mpesaReceiptNumber: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'cancelled'], 
        default: 'pending' 
    },
    resultCode: { type: Number },
    resultDesc: { type: String },
    callbackMetadata: { type: Object },
    transactionDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MpesaTransaction', mpesaTransactionSchema);
