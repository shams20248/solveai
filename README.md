# SolveAI

SolveAI is a professional business services platform for companies seeking structured technical analysis, operational support, and lawful service proposals. This project is intentionally designed for consent-based business communication only.

## Overview

The platform includes:
- Modern responsive landing page
- Request/contact form for businesses
- Service packages and pricing
- USDT payment flow on BNB Smart Chain (BEP-20)
- Invoice generation API
- Human review gate before finance or formal reporting is sent
- Safe legal communication language

## Tech Stack
- Frontend: Static HTML/CSS/JS
- Backend: Node.js + Express
- Database: PostgreSQL-ready schema (included)
- Payment integration: USDT wallet flow on BSC
- Deployment: Docker ready

## Directory Structure

```text
solveai/
├─ public/
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  └─ legal/
│     ├─ terms.html
│     ├─ privacy.html
│     └─ payment-policy.html
├─ src/
│  └─ server.js
├─ database/
│  └─ schema.sql
├─ docs/
│  └─ README.md
├─ .env.example
├─ .gitignore
├─ docker-compose.yml
├─ package.json
├─ README.md
└─ LICENSE
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start the server:

```bash
npm start
```

4. Open the site:

```text
http://localhost:3000
```

## Business Payment Details

- Currency: USDT
- Network: BNB Smart Chain (BEP-20)
- Wallet: `0x270eafea7449be0ebd4eb931e436dde3972dc1cf`

Important:
- Send USDT only on BNB Smart Chain.
- Verify transaction hash and network before confirming payment.
- Never expose your private key or seed phrase.

## Legal Notice

This project is designed for lawful, consent-based communication and service intake only. It does not support unauthorized access, exploitation, or malicious activity.

## License

MIT
