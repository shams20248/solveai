const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'solveai-secret-key-change-me';

const appState = {
  users: [],
  requests: [],
  invoices: [],
  payments: []
};

const createDefaultAdmin = () => {
  if (appState.users.length > 0) return;

  const defaultPasswordHash = bcrypt.hashSync('Admin@123', 10);
  appState.users.push({
    id: randomUUID(),
    name: 'Admin',
    email: 'almoizaledrisi@gmail.com',
    passwordHash: defaultPasswordHash,
    role: 'admin',
    createdAt: new Date().toISOString()
  });
};

const hashPassword = (password) => bcrypt.hashSync(password, 10);
const comparePassword = (password, hash) => bcrypt.compareSync(password, hash);

const generateToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const registerUser = ({ name, email, password, confirmPassword }) => {
  if (!name || !email || !password) {
    return { success: false, message: 'Name, email, and password are required.' };
  }

  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  const exists = appState.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return { success: false, message: 'User already exists.' };
  }

  const user = {
    id: randomUUID(),
    name,
    email: String(email).toLowerCase(),
    passwordHash: hashPassword(password),
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  appState.users.push(user);

  return {
    success: true,
    token: generateToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
};

const loginUser = ({ email, password }) => {
  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  const user = appState.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  const valid = comparePassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, message: 'Invalid password.' };
  }

  return {
    success: true,
    token: generateToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
};

const createRequest = ({ company_name, company_email, contact_name, contact_email, service_type, description, country, industry }) => {
  const request = {
    id: String(appState.requests.length + 1),
    company_name: company_name || 'Not provided',
    company_email: company_email || 'Not provided',
    contact_name,
    contact_email,
    service_type,
    description,
    country: country || 'Not provided',
    industry: industry || 'Not provided',
    status: 'new',
    createdAt: new Date().toISOString()
  };

  appState.requests.unshift(request);
  return request;
};

const listRequests = () => appState.requests;

const updateRequestStatus = (id, status) => {
  const request = appState.requests.find((item) => item.id === String(id));
  if (!request) return null;
  request.status = status;
  return request;
};

const createInvoiceByRequest = ({ service_request_id, amount, currency = 'USDT' }) => {
  const invoice = {
    id: String(appState.invoices.length + 1),
    service_request_id: String(service_request_id),
    invoice_number: `SVA-${Date.now()}`,
    amount: Number(amount).toFixed(2),
    currency,
    network: process.env.USDT_NETWORK || 'BSC',
    wallet_address: process.env.USDT_WALLET || '0x270eafea7449be0ebd4eb931e436dde3972dc1cf',
    status: 'pending_payment',
    createdAt: new Date().toISOString()
  };

  appState.invoices.unshift(invoice);
  return invoice;
};

const summarizeAdmin = () => ({
  totalRequests: appState.requests.length,
  totalInvoices: appState.invoices.length,
  totalUsers: appState.users.length,
  recentRequests: appState.requests.slice(0, 5),
  recentInvoices: appState.invoices.slice(0, 5)
});

module.exports = {
  authMiddleware,
  createDefaultAdmin,
  registerUser,
  loginUser,
  createRequest,
  listRequests,
  updateRequestStatus,
  createInvoiceByRequest,
  summarizeAdmin,
  appState
};
