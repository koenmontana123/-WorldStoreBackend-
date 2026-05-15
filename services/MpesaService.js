const axios = require('axios');
const MpesaTransaction = require('../models/MpesaTransaction');
require('dotenv').config();

class MpesaService {
    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        this.shortCode = process.env.MPESA_SHORTCODE;
        this.passkey = process.env.MPESA_PASSKEY;
        this.callbackUrl = process.env.MPESA_CALLBACK_URL;
        this.baseUrl = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
    }

    async getAccessToken() {
        const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
        try {
            const { data } = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: { Authorization: `Basic ${auth}` }
            });
            return data.access_token;
        } catch (err) {
            console.error('M-Pesa Token Error:', err.response?.data || err.message);
            throw new Error('Failed to generate M-Pesa access token');
        }
    }

    generateTimestamp() {
        return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    }

    generatePassword(timestamp) {
        return Buffer.from(this.shortCode + this.passkey + timestamp).toString('base64');
    }

    formatPhoneNumber(phone) {
        let formatted = phone.replace(/[^0-9]/g, '');
        if (formatted.startsWith('0')) {
            formatted = '254' + formatted.slice(1);
        } else if (formatted.startsWith('+')) {
            formatted = formatted.slice(1);
        }
        
        if (!formatted.startsWith('254') || formatted.length !== 12) {
            throw new Error('Invalid phone number format. Use 254XXXXXXXXX');
        }
        return formatted;
    }

    async initiateStkPush(phone, amount, orderId) {
        const formattedPhone = this.formatPhoneNumber(phone);
        const token = await this.getAccessToken();
        const timestamp = this.generateTimestamp();
        const password = this.generatePassword(timestamp);

        const payload = {
            BusinessShortCode: this.shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: formattedPhone,
            PartyB: this.shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: this.callbackUrl,
            AccountReference: `Order-${orderId ? orderId.toString().slice(-6) : 'N/A'}`,
            TransactionDesc: `Payment for Order ${orderId}`
        };

        try {
            const { data } = await axios.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.ResponseCode === "0") {
                // Log the transaction attempt
                await MpesaTransaction.create({
                    merchantRequestId: data.MerchantRequestID,
                    checkoutRequestId: data.CheckoutRequestID,
                    orderId: orderId,
                    phoneNumber: formattedPhone,
                    amount: amount,
                    status: 'pending'
                });
            }

            return data;
        } catch (err) {
            console.error('STK Push Request Error:', err.response?.data || err.message);
            throw err;
        }
    }

    async queryTransactionStatus(checkoutRequestId) {
        const token = await this.getAccessToken();
        const timestamp = this.generateTimestamp();
        const password = this.generatePassword(timestamp);

        const payload = {
            BusinessShortCode: this.shortCode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId
        };

        try {
            const { data } = await axios.post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        } catch (err) {
            console.error('Transaction Query Error:', err.response?.data || err.message);
            throw err;
        }
    }
}

module.exports = new MpesaService();
