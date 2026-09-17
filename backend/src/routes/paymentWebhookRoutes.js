const express = require('express');

const {
  handlePaymentWebhook,
} = require('../controllers/paymentWebhookController');

const router = express.Router();

router.post('/', handlePaymentWebhook);

module.exports = router;
