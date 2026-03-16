const express = require('express');
const router = express.Router();
const { paymentController, checkPaymentStatus} = require('../controllers/payment.controller');

router.post('/sepay-webhook', paymentController);
router.get('/invoices/check-status/:invoiceCode', checkPaymentStatus);
module.exports = router;
