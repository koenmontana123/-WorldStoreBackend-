const MpesaService = require('../services/MpesaService');
const MpesaTransaction = require('../models/MpesaTransaction');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

const stkPush = asyncHandler(async (req, res) => {
    const { phone, amount, orderIds } = req.body;
    
    if (!phone || !amount || !orderIds) {
        res.status(400);
        throw new Error('Phone, amount, and orderIds are required');
    }

    const ids = Array.isArray(orderIds) ? orderIds : [orderIds];

    // Create a consolidated Payment record
    const payment = new Payment({
        buyer: req.user.id,
        orders: ids,
        amount: amount,
        status: 'pending'
    });
    await payment.save();

    const data = await MpesaService.initiateStkPush(phone, amount, payment._id);
    
    if (data.ResponseCode === "0") {
        payment.transactionId = data.CheckoutRequestID;
        await payment.save();

        await Order.updateMany(
            { _id: { $in: ids } },
            { transactionId: data.CheckoutRequestID }
        );
    }

    res.json({
        success: true,
        message: data.CustomerMessage || 'STK Push initiated successfully',
        checkoutRequestId: data.CheckoutRequestID,
        paymentId: payment._id
    });
});

const mpesaCallback = asyncHandler(async (req, res) => {
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
        res.status(400);
        throw new Error('Invalid callback payload');
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    const updateData = {
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        status: ResultCode === 0 ? 'completed' : (ResultCode === 1032 ? 'cancelled' : 'failed')
    };

    if (ResultCode === 0 && CallbackMetadata) {
        updateData.callbackMetadata = CallbackMetadata.Item;
        const receiptItem = CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber');
        if (receiptItem) {
            updateData.mpesaReceiptNumber = receiptItem.Value;
        }

        const payment = await Payment.findOneAndUpdate(
            { transactionId: CheckoutRequestID },
            { 
                status: 'completed',
                metadata: updateData.callbackMetadata,
                transactionId: updateData.mpesaReceiptNumber
            },
            { new: true }
        );

        if (payment) {
            await Order.updateMany(
                { _id: { $in: payment.orders } },
                { 
                    paymentStatus: 'paid',
                    status: 'confirmed',
                    transactionId: updateData.mpesaReceiptNumber
                }
            );
        }
    } else {
        const payment = await Payment.findOneAndUpdate(
            { transactionId: CheckoutRequestID },
            { status: 'failed' }
        );

        if (payment) {
            await Order.updateMany(
                { _id: { $in: payment.orders } },
                { paymentStatus: 'failed' }
            );
        }
    }

    await MpesaTransaction.findOneAndUpdate(
        { checkoutRequestId: CheckoutRequestID },
        updateData
    );

    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
});

const queryStatus = asyncHandler(async (req, res) => {
    const { checkoutRequestId } = req.params;
    if (!checkoutRequestId) {
        res.status(400);
        throw new Error('checkoutRequestId is required');
    }

    const data = await MpesaService.queryTransactionStatus(checkoutRequestId);
    res.json({ success: true, status: data.ResultDesc, raw: data });
});

const getTransactionHistory = asyncHandler(async (req, res) => {
    const transactions = await MpesaTransaction.find().sort({ createdAt: -1 }).limit(50);
    res.json(transactions);
});

module.exports = { stkPush, mpesaCallback, queryStatus, getTransactionHistory };



