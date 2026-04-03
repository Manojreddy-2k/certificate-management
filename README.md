# Vital Records Ordering Frontend (Phases 1-4)

This repository contains a session-only frontend for vital records ordering with backend-connected payment and status flows, plus Keycloak-based OIDC login.

## Tech stack

- Next.js (App Router, JavaScript)
- Redux Toolkit + React Redux
- Tailwind CSS

## Implemented capabilities

- OIDC login flow with Keycloak (via NextAuth)
- Session-only state in Redux memory
- Multi-step certificate order flow
- Backend payment session creation
- Payment return page with status polling
- Backend-driven VERA submission status handling
- Forced state clear on logout/session expiry

## Session-only and no-PII persistence guardrails

- No `localStorage` or `sessionStorage` usage for order/auth data
- No PII in URL query params (only transaction/session reasons)
- Backend transaction persistence is in-memory only (no DB in current backend)
- No logging of applicant payloads in app code
- Global state reset through `sessionEnded` action

## Project structure

- `src/app/page.js`: landing page
- `src/app/login/page.js`: Keycloak login/logout page
- `src/app/order/page.js`: multi-step certificate order flow
- `src/app/checkout/page.js`: payment session creation and handoff
- `src/app/payment-return/page.js`: post-payment status polling
- `src/app/api/auth/[...nextauth]/route.js`: NextAuth auth route
- `src/components/SessionManager.js`: activity tracking and idle expiry reset
- `src/components/AuthSync.js`: NextAuth session to Redux sync
- `src/components/ProtectedRoute.js`: route guard
- `src/store/*`: Redux Toolkit store, slices, root reset
- `src/lib/auth/authOptions.js`: NextAuth Keycloak provider config
- `src/lib/api/paymentClient.js`: backend API adapter for payment/session/status

## Manual acceptance test matrix

1. Login and route guard
   - Open app and click Sign In.
   - Expected: user reaches `/order`.
   - Open `/checkout` directly without login.
   - Expected: redirect to `/login`.

2. Certificate order flow
   - Select certificate, fill applicant + shipping fields, review, and confirm.
   - Expected: Proceed to Checkout is enabled only after required data and review confirmation.

3. Checkout happy path
   - Create payment session.
   - Complete payment in Stripe Checkout (test mode), then return.
   - Expected: status converges to `submitted-to-vera`; VERA reference appears (after webhook processing).

4. Checkout failure and retry
   - Cancel payment in Stripe Checkout or use a failing test card flow.
   - Expected: status becomes `payment-failed`; retry is available from checkout.

5. Logout clearing behavior
   - Fill form data, then click Logout.
   - Sign in again.
   - Expected: order state is reset to initial values.

6. Session timeout behavior
   - Sign in and leave idle until timeout.
   - Expected: redirect to login with session expired message.
   - Sign in again.
   - Expected: previously entered order data is cleared.

7. Refresh-loss behavior
   - Fill order details, then refresh browser tab.
   - Expected: Redux in-memory state clears; user must re-enter data.

## Local run

1. Start Keycloak:
   - `docker compose -f infra/keycloak/docker-compose.yml up -d`
2. Configure Keycloak:
   - realm: `vital-records-dev`
   - client: `vital-frontend`
   - redirect URI: `http://localhost:3000/*`
3. Copy env file:
   - copy `.env.local.example` to `.env.local` and fill values
4. Install Node.js LTS (if not installed), then run:
   - `npm install`
   - `npm run dev`
5. Open `http://localhost:3000`

## Stripe (test mode) setup

1. Create a Stripe account and get your **test keys**.
2. **Backend (IntelliJ) env vars** (Run/Debug Configuration → Environment variables):
   - `STRIPE_SECRET_KEY` = your Stripe test secret key (`sk_test_...`)
   - `STRIPE_WEBHOOK_SECRET` = webhook signing secret (`whsec_...`)
   - `KEYCLOAK_ISSUER` = `http://localhost:8081/realms/vital-records-dev`
3. Start the backend (in IntelliJ).
4. Forward webhooks to your local backend.

### Stripe CLI via Docker (recommended)

1. Copy `infra/stripe/.env.example` to `infra/stripe/.env` and set:
   - `STRIPE_SECRET_KEY=sk_test_...`
2. Start Stripe webhook forwarding:
   - `docker compose -f infra/stripe/docker-compose.yml --env-file infra/stripe/.env up`
3. Get the webhook signing secret:
   - Run in another terminal:
     - `docker run --rm -it stripe/stripe-cli:latest listen --api-key sk_test_... --print-secret`
   - Copy `whsec_...` into your IntelliJ backend env var `STRIPE_WEBHOOK_SECRET`, then restart backend.

