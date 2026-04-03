# Phase 2 Backend Skeleton (`/backend`)

Spring Boot backend skeleton for certificate ordering with payment redirect and auto-submit to VERA.

## Core design choices

- No database; transaction state is in-memory only (`ConcurrentHashMap`).
- No PII persistence; only minimal operational fields are stored:
  - `transactionId`
  - `certificateType`
  - `amount`
  - status/error metadata
- Payment success webhook automatically triggers VERA submission.
- APIs are protected by JWT bearer auth (Keycloak issuer), except payment webhook.

## Run

```bash
mvn spring-boot:run
```

Service runs at `http://localhost:8080`.

## Authentication

- Set `KEYCLOAK_ISSUER` (example in `.env.example`).
- Backend validates bearer JWT tokens using the configured issuer.
- Protected endpoints require `Authorization: Bearer <access-token>`.
- Public endpoint:
  - `POST /api/payments/webhook` (kept public for payment gateway callbacks)

## Endpoints

### 1) Create payment session

- `POST /api/payments/session`
- Auth required: yes
- Request body:

```json
{
  "certificateType": "birth",
  "amount": "39.00"
}
```

- Response body:

```json
{
  "transactionId": "TX-ABCDEF123456",
  "paymentRedirectUrl": "https://mock-payment.local/checkout/TX-ABCDEF123456",
  "status": "PAYMENT_PENDING"
}
```

### 2) Payment webhook (authoritative)

- `POST /api/payments/webhook`
- Auth required: no (signature required)
- Required header: `X-Payment-Signature: mock-payment-secret`
- Request body:

```json
{
  "transactionId": "TX-ABCDEF123456",
  "eventType": "PAYMENT_SUCCEEDED"
}
```

`PAYMENT_SUCCEEDED` triggers automatic VERA submission without user interaction.

Supported event types:
- `PAYMENT_SUCCEEDED`
- `PAYMENT_FAILED`

### 3) Transaction status

- `GET /api/transactions/{transactionId}/status`
- Auth required: yes

Example response:

```json
{
  "transactionId": "TX-ABCDEF123456",
  "status": "VERA_SUBMITTED",
  "veraReferenceId": "VERA-TX-ABCDEF123456",
  "error": null
}
```

### 4) Retry failed VERA submission

- `POST /api/transactions/{transactionId}/retry-vera`
- Allowed only when status is `VERA_SUBMIT_FAILED`.
- Auth required: yes

### 5) Manual submit endpoint (internal/testing)

- `POST /api/vera/submit/{transactionId}`
- Auth required: yes

## State machine

- `CHECKOUT_STARTED`
- `PAYMENT_PENDING`
- `PAYMENT_SUCCEEDED` -> `VERA_SUBMITTING` -> `VERA_SUBMITTED`
- `PAYMENT_FAILED`
- `VERA_SUBMIT_FAILED`

## Notes for next step

- Replace mock webhook secret verification with gateway signature verification.
- Replace `VeraService` mock with real VERA API client + retries/backoff.
- Add SAML auth/session enforcement middleware before public endpoint use.
