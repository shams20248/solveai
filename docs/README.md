# SolveAI Documentation

## Overview

SolveAI is a business-oriented platform that facilitates formal, human-reviewed communications and service proposals for companies in need of problem analysis, operational guidance, and technical assessment.

## Safety and Scope

This project is intentionally designed under the following safety constraints:
- No unauthorized access
- No intrusion or exploitation
- No mass unsolicited messaging
- No threats, pressure, or coercion
- Human review required before any external contact or report is sent
- Only consent-based business interactions are allowed

## Payment Flow

- Currency: USDT
- Network: BNB Smart Chain (BEP-20)
- Wallet: `0x270eafea7449be0ebd4eb931e436dde3972dc1cf`

The application includes invoice generation and status tracking, but it does not auto-transfer funds or perform financial actions without clear human authorization.

## Local Development

```bash
npm install
cp .env.example .env
npm start
```

## API Endpoints

- `GET /api/health` — health check
- `POST /api/contact` — request intake
- `POST /api/invoice` — create an invoice
- `GET /api/invoice/:id` — invoice status

## Notes

This repository is a prototype / starter implementation suited for a lawful business process workflow. It is not an exploitation toolkit and should be used only in compliant, consent-based scenarios.
