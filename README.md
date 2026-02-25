
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
- The repo includes an `amplify.yml` that installs dependencies with `npm ci --include=dev` when `package-lock.json` exists (falls back to `npm install --include=dev` otherwise), then runs `npx prisma migrate deploy` and `npx prisma generate` before `next build`.
- In Amplify, make sure `DATABASE_URL`, `NEXTAUTH_SECRET`, and Razorpay secrets are configured in environment variables/SSM for the target branch.

## AWS Amplify deployment playbook (step-by-step)

If your Amplify deployment keeps failing, use this exact sequence.

### 1) Verify the app builds locally first
```bash
npm ci --include=dev
npx prisma generate
npm run build
```
If this fails locally, Amplify will fail too.

### 2) Confirm required environment variables in Amplify
In **Amplify Console → App settings → Environment variables**, set these for the target branch:

- `DATABASE_URL` (reachable from public internet unless using VPC setup)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (use your Amplify domain root only, e.g. `https://main.d123abc.amplifyapp.com`, no `/signup` path)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

> Tip: If `NEXTAUTH_URL` is wrong, auth callbacks/sign-in can fail even when build succeeds.

### 3) Check database network access
Amplify build and runtime must be able to reach your PostgreSQL host.

- If using RDS, set **Public access = Yes** OR attach Amplify runtime to a VPC path that can reach private subnets.
- Security group for RDS must allow inbound TCP `5432` from the network source used by Amplify runtime.
- Ensure SSL requirements in your `DATABASE_URL` match DB policy. For RDS, prefer `?sslmode=require`.
- Ensure your DB parameter/option groups are not enforcing a TLS mode that conflicts with your URL.

Quick runtime check after deploy:
```bash
curl -s https://<your-amplify-domain>/api/health/db | jq
```
This endpoint reports whether `DATABASE_URL` is present/parsable and whether Prisma can execute `SELECT 1` from Amplify runtime.


### 3.1) If `/api/health/db` is OK but `/signup` still fails
This means base connectivity works, but auth table operations are failing. Check these in order:

1. **Migrations were actually applied**
   - Ensure Amplify build logs show `npx prisma migrate deploy` completed successfully.
2. **Table permissions for DB user**
   - The user in `DATABASE_URL` must have `SELECT/INSERT/UPDATE/DELETE` on Prisma tables (especially `"User"`).
3. **Schema mismatch/search_path**
   - If tables are not in `public`, set the schema explicitly in `DATABASE_URL` (for Postgres, `?schema=...`).
4. **Connection pool exhaustion in serverless runtime (most common with Amplify + direct RDS)**
   - For direct RDS connections, use: `&connection_limit=1&pool_timeout=20&connect_timeout=15`.
   - This repo now auto-applies these params in Amplify runtime when missing, but setting them explicitly in `DATABASE_URL` is still recommended.
5. **Prefer RDS Proxy for production**
   - Point `DATABASE_URL` host to the **RDS Proxy endpoint** (same DB/user/SSL params). This stabilizes Lambda/SSR connection bursts.

You can also inspect the signup API response JSON in browser devtools/network; it now returns targeted hints for permission/schema/pool issues.

**Fast fix for your current symptom (`/api/health/db` works but signup fails):**
1. Update Amplify `DATABASE_URL` to include `sslmode=require&connection_limit=1&pool_timeout=20&connect_timeout=15`.
2. Re-deploy Amplify.
3. If still failing, switch host to **RDS Proxy endpoint** and redeploy.
4. Confirm with:
```bash
curl -s https://<your-amplify-domain>/api/health/db | jq
```
Then retry `/signup`.

### 4) Use the existing Amplify build spec
This repo already contains an `amplify.yml` that installs deps, validates required env vars, runs `prisma migrate deploy`, runs `prisma generate`, and then builds Next.js.

### 5) Connect repo and deploy
1. Open Amplify Console.
2. **New app → Host web app**.
3. Connect GitHub/GitLab/Bitbucket repo.
4. Pick branch.
5. Confirm Amplify detects `amplify.yml`.
6. Add environment variables.
7. Click **Save and deploy**.

### 6) If deployment fails, inspect the failing phase
In build logs, identify whether it fails in:
- `preBuild` (dependency/prisma issues)
- `build` (Next.js compile issues)
- runtime (API/auth/database after successful deploy)

### 7) Fast diagnosis by error pattern

- **`PrismaClientInitializationError` / engine not found**  
  Usually missing `npx prisma generate` in build or a bad `DATABASE_URL`.

- **`Environment variable not found`**  
  One or more required secrets are missing in Amplify branch env vars.

- **`next build` fails while pre-rendering**  
  A route is trying to access DB/secrets at build time. Make route dynamic or guard server code.

- **Auth works locally but not in Amplify**  
  `NEXTAUTH_URL` mismatch is the most common cause.

- **Every `/api/*` endpoint returns HTTP 403 in Amplify**  
  The app is likely deployed as static hosting instead of Next.js SSR/Web Compute. Re-deploy with Amplify's Next.js SSR support so API routes like `/api/auth/signup` are executable.


### What was actually breaking deployment in this repo
From the current codebase, the main hard failure was an invalid Prisma schema (missing opposite relation fields), which prevents `prisma generate` and therefore breaks Next.js build/runtime in Amplify. This has now been fixed in `prisma/schema.prisma`.

Also note: `!Failed to set up process.env.secrets` in Amplify logs usually means SSM parameters are missing under the expected path. If you already set values in Amplify **Environment variables**, this warning can be non-blocking; if not, create the missing variables (especially `DATABASE_URL` and `NEXTAUTH_SECRET`) for the branch.

### 8) After first successful deploy
- Re-run deployment once to validate cache stability.
- Test `/signin`, `/api/auth/*`, and payment endpoints in production.
- Rotate secrets and move them to SSM Parameter Store for production hygiene.

### 9) Optional hardening
- Add branch-specific env vars for `main` vs `dev`.
- Keep Prisma migrations out of build phase unless intentionally running CI migrations.
- Add health-check endpoint and monitor with CloudWatch/Synthetics.

## Notes
- Ensure TLS in production, store secrets in Key Vault, implement audit/consent logs before PHI.
- Populate ProviderOrg with only **NABH/JCI** entries to align with compliance posture.

## Brand assets
- Colors: brand-500 `#10b981` (teal/green), neutrals from Tailwind slate.
- Logotype: monogram **He** with a subtle medical **cross** accent.
- Files: `public/logo.svg`, `public/logo.png`, favicons (`favicon.ico`, 16/32 PNGs, apple-touch-icon.png`).
