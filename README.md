
# HealinginEast – MVP v2 (Auth + DB + Razorpay Live)

This version adds **NextAuth (credentials)**, **PostgreSQL (Prisma)**, and **Razorpay live order + webhook** stubs. It also includes a simple **logotype & favicon set** under `public/`.

## What’s new
- **Auth & RBAC**: Credentials provider (email/password with bcrypt). Middleware protects `/dashboard`; add `/provider-portal` and `/admin` when ready.
- **Database**: Prisma schema for users, providers, doctors, procedures, quotes, bookings, payments, visa cases.
- **Payments**: Razorpay order creation (`/api/payments/razorpay/order`) and **webhook verification** (`/api/payments/razorpay/webhook`).
- **Brand assets**: `public/logo.svg`, `public/logo.png`, `public/favicon.ico`, Apple/PNG favicons.

## Setup
1) **Install deps**
```bash
npm install
```
2) **Environment**
```bash
cp .env.example .env.local
# set DATABASE_URL, NEXTAUTH_SECRET, RAZORPAY_* and NEXTAUTH_URL
```
3) **Database**
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```
4) **Run**
```bash
npm run dev
```
5) **Seed (optional)**
Use `prisma studio` to add provider orgs and procedures or create a seed script.

## Razorpay integration
- **Create order**: Client sends **amount in subunits** (e.g., INR paise) to `/api/payments/razorpay/order`. Server uses **Basic auth** and returns the order payload.
- **Checkout**: Use `NEXT_PUBLIC_RAZORPAY_KEY_ID` on client with Checkout.js; verify signature server-side after success.
- **Webhook**: Configure to POST to `/api/payments/razorpay/webhook`. We verify `x-razorpay-signature` with `RAZORPAY_WEBHOOK_SECRET` via HMAC-SHA256.

## Auth
- **Sign up**: POST `/api/auth/signup` → stores hashed password (bcrypt). Sign-in via `/signin`.
- **RBAC**: `Role` enum in Prisma (PATIENT/PROVIDER/ADMIN). Extend middleware rules as needed.


## AWS Amplify build notes
- The repo includes an `amplify.yml` that forces a deterministic install (`npm ci --include=dev`) and runs `npx prisma generate` before `next build`.
- In Amplify, make sure `DATABASE_URL`, `NEXTAUTH_SECRET`, and Razorpay secrets are configured in environment variables/SSM for the target branch.

## Notes
- Ensure TLS in production, store secrets in Key Vault, implement audit/consent logs before PHI.
- Populate ProviderOrg with only **NABH/JCI** entries to align with compliance posture.

## Brand assets
- Colors: brand-500 `#10b981` (teal/green), neutrals from Tailwind slate.
- Logotype: monogram **He** with a subtle medical **cross** accent.
- Files: `public/logo.svg`, `public/logo.png`, favicons (`favicon.ico`, 16/32 PNGs, apple-touch-icon.png`).
