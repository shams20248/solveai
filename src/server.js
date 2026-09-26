const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

const { authMiddleware, createDefaultAdmin } = require('./auth');
const { createRequest, listRequests, updateRequestStatus, createInvoiceByRequest, summarizeAdmin } = require('./auth');
const { loginUser, registerUser } = require('./auth');
const {
  sendContactNotification,
  sendClientConfirmation,
  sendRequestNotification,
  sendInvoiceEmail,
} = require('./email');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

createDefaultAdmin();

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: process.env.APP_NAME || 'SolveAI',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, company, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required.',
    });
  }

  const adminMail = await sendContactNotification({ name, email, company, message });
  const clientMail = await sendClientConfirmation({ name, email });

  return res.status(200).json({
    success: true,
    message: 'Your request has been received and will be reviewed by a human team member before any further action.',
    email: {
      admin: adminMail,
      client: clientMail,
    },
    data: { name, email, company: company || 'Not provided', message },
  });
});

app.post('/api/invoice', async (req, res) => {
  const { service, amount, company, contactName, email } = req.body || {};
  const numericAmount = Number(amount || 0);

  if (!service || !numericAmount || numericAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Service and valid amount are required.',
    });
  }

  const wallet = process.env.USDT_WALLET || '0x270eafea7449be0ebd4eb931e436dde3972dc1cf';
  const network = process.env.USDT_NETWORK || 'BSC';
  const invoiceNumber = `SVA-${Date.now()}`;

  const emailResult = email
    ? await sendInvoiceEmail({
        email,
        name: contactName || 'Client',
        service,
        amount: Number(numericAmount).toFixed(2),
        invoiceNumber,
        wallet,
        network,
      })
    : { success: false, message: 'No client email provided for invoice email.' };

  return res.status(200).json({
    success: true,
    invoiceNumber,
    service,
    amount: Number(numericAmount).toFixed(2),
    company: company || 'Not provided',
    contactName: contactName || 'Client',
    email: emailResult,
    payment: {
      currency: 'USDT',
      network,
      wallet,
      note: 'Send only USDT on BNB Smart Chain (BEP-20). Verify network before sending.',
    },
  });
});

app.get('/api/invoice/:id', (req, res) => {
  const invoiceId = req.params.id;
  const wallet = process.env.USDT_WALLET || '0x270eafea7449be0ebd4eb931e436dde3972dc1cf';
  const network = process.env.USDT_NETWORK || 'BSC';

  res.json({
    success: true,
    invoiceNumber: invoiceId,
    currency: 'USDT',
    network,
    wallet,
    status: 'pending_payment',
    message: 'Payment confirmation required before service commencement.',
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body || {};
  const result = registerUser({ name, email, password, confirmPassword });

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const result = loginUser({ email, password });

  if (!result.success) {
    return res.status(401).json(result);
  }

  return res.status(200).json(result);
});

app.get('/api/requests', authMiddleware, (_req, res) => {
  res.json({ success: true, data: listRequests() });
});

app.post('/api/requests', async (req, res) => {
  const { company_name, company_email, contact_name, contact_email, service_type, description, country, industry } = req.body || {};

  if (!contact_name || !contact_email || !service_type || !description) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  const request = createRequest({
    company_name,
    company_email,
    contact_name,
    contact_email,
    service_type,
    description,
    country,
    industry,
  });

  await sendRequestNotification({
    contactName: contact_name,
    contactEmail: contact_email,
    serviceType: service_type,
    companyName: company_name,
    description,
  });

  return res.status(201).json({
    success: true,
    message: 'Request submitted and will be reviewed by a human team member.',
    data: request,
  });
});

app.patch('/api/requests/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required.' });
  }
  const updated = updateRequestStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }
  return res.json({ success: true, data: updated });
});

app.post('/api/invoices', authMiddleware, async (req, res) => {
  const { service_request_id, amount, currency = 'USDT', email } = req.body || {};

  if (!service_request_id || !amount) {
    return res.status(400).json({ success: false, message: 'service_request_id and amount are required.' });
  }

  const invoice = createInvoiceByRequest({ service_request_id, amount, currency });

  if (email) {
    await sendInvoiceEmail({
      email,
      name: 'Client',
      service: `Service #${service_request_id}`,
      amount: Number(amount).toFixed(2),
      invoiceNumber: invoice.invoice_number,
      wallet: invoice.wallet_address,
      network: invoice.network,
    });
  }

  return res.status(201).json({
    success: true,
    data: invoice,
    payment_details: {
      network: process.env.USDT_NETWORK || 'BSC',
      wallet: process.env.USDT_WALLET || '0x270eafea7449be0ebd4eb931e436dde3972dc1cf',
      currency,
      note: 'Send only USDT on BNB Smart Chain (BEP-20). Verify the network before sending.',
    },
  });
});

app.get('/api/admin/summary', authMiddleware, (_req, res) => {
  res.json({ success: true, data: summarizeAdmin() });
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/legal/terms', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/legal/terms.html'));
});

app.get('/legal/privacy', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/legal/privacy.html'));
});

app.get('/legal/payment-policy', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/legal/payment-policy.html'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`SolveAI server running at http://localhost:${PORT}`);
});

module.exports = app;
