const express = require('express');
const { 
    stkPush, 
    mpesaCallback, 
    queryStatus, 
    getTransactionHistory 
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// STK Push initiation
router.post('/mpesa/stkpush', authenticate, stkPush);

// Query transaction status
router.get('/mpesa/status/:checkoutRequestId', authenticate, queryStatus);

// Get transaction history (Admin or current user - logic can be refined in controller)
router.get('/mpesa/history', authenticate, getTransactionHistory);

// M-Pesa Callback (No authentication needed for Safaricom)
router.post('/mpesa/callback', mpesaCallback);

module.exports = router;

