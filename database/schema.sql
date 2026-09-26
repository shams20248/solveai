CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  country VARCHAR(100),
  industry VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_requests (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  service_type VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(100) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  service_request_id INT REFERENCES service_requests(id),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDT',
  network VARCHAR(50) DEFAULT 'BSC',
  wallet_address VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_payment',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  invoice_id INT REFERENCES invoices(id),
  tx_hash VARCHAR(255),
  sender_address VARCHAR(255),
  amount DECIMAL(12,2),
  network VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending_confirmation',
  created_at TIMESTAMP DEFAULT NOW()
);
