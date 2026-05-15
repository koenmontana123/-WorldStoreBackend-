const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    amount: { type: Number, required: true },
    currency: { type: String, default: 'KES' },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'], 
        default: 'pending' 
    },
    paymentMethod: { type: String, default: 'mpesa' },
    transactionId: { type: String }, // CheckoutRequestID or MpesaReceiptNumber
    metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
