const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const USDT_WALLET = process.env.USDT_WALLET || '0x270eafea7449be0ebd4eb931e436dde3972dc1cf';
const USDT_NETWORK = process.env.USDT_NETWORK || 'BSC';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: process.env.APP_NAME || 'SolveAI',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, company, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Your request has been received and will be reviewed by a human before further action.',
    data: {
      name,
      email,
      company: company || 'Not provided',
      message
    }
  });
});

app.post('/api/invoice', (req, res) => {
  const { service, amount, company, contactName } = req.body || {};
  const numericAmount = Number(amount || 0);

  if (!service || !numericAmount || numericAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Service and valid amount are required.'
    });
  }

  const invoiceNumber = `SVA-${Date.now()}`;

  return res.status(200).json({
    success: true,
    invoiceNumber,
    service,
    amount: numericAmount.toFixed(2),
    company: company || 'Not provided',
    contactName: contactName || 'Client',
    payment: {
      currency: 'USDT',
      network: USDT_NETWORK,
      wallet: USDT_WALLET,
      note: 'Send only USDT on BNB Smart Chain (BEP-20). Verify the network before sending.'
    }
  });
});

app.get('/api/invoice/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    invoiceNumber: id,
    currency: 'USDT',
    network: USDT_NETWORK,
    wallet: USDT_WALLET,
    status: 'pending_payment',
    message: 'Payment confirmation required before service commencement.'
  });
});

app.get('/legal/terms', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/legal/terms.html'));
});

app.get('/legal/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/legal/privacy.html'));
});

app.get('/legal/payment-policy', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/legal/payment-policy.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`SolveAI server running at http://localhost:${PORT}`);
});
