# HealinginEast – MVP v2 (Auth + DB + Razorpay)

This app uses **Next.js 14**, **NextAuth v4 (credentials)**, **Prisma + PostgreSQL**, and Razorpay payment endpoints.

## What’s included
- Auth & RBAC with NextAuth credentials provider.
- PostgreSQL models via Prisma.
- Razorpay order + webhook APIs.
- Tailwind UI + brand assets.

## Local setup
1) Install dependencies
```bash
npm install
```

2) Configure environment
```bash
cp .env.example .env.local
```
Set:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `RAZORPAY_*`

3) Generate Prisma client and apply migrations
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4) Run locally
```bash
npm run dev
```

---

## Deploy to AWS Amplify (SSR)
This repo includes an `amplify.yml` that installs dependencies (using `npm install`), generates Prisma client, and builds Next.js.

### 1) Connect repo
- Amplify Console → **New app** → **Host web app**
- Connect your Git provider and select this branch.

### 2) Build settings
- Keep the repository `amplify.yml` (it uses `npm install`, so lockfile is optional).
- Framework auto-detect should show **Next.js SSR**.

### 3) Environment variables in Amplify
Add these in **App settings → Environment variables**:
- `NEXTAUTH_URL` = your Amplify domain (or custom domain), e.g. `https://main.xxxxx.amplifyapp.com`
- `NEXTAUTH_SECRET` = strong random secret (32+ chars)
- `DATABASE_URL` = `postgresql://postgres:<PASSWORD>@database-1.cjo6ma0gqnu3.ap-south-1.rds.amazonaws.com:5432/database-1?schema=public&sslmode=require`
- `NEXT_PUBLIC_BASE_URL` = same as `NEXTAUTH_URL`
- `CONTACT_EMAIL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

> Do not commit real credentials. Keep them only in Amplify environment variables / secret manager.

### 4) Database migration strategy
Because Amplify builds should stay deterministic, run production migrations separately (not in build):
- From a secure machine/CI with DB access:
```bash
npm ci
npx prisma migrate deploy
```

### 5) Redeploy
Trigger a new Amplify deployment after setting env vars.

---

## Required AWS Console manual checks

### RDS / PostgreSQL
1. **Public accessibility or network reachability**
   - Ensure the DB endpoint is reachable from Amplify-hosted app runtime.
2. **Security Group inbound rule**
   - Allow TCP `5432` from the source that hosts your app runtime.
   - Prefer least-privilege networking (avoid open `0.0.0.0/0` in production).
3. **Database user permissions**
   - User in `DATABASE_URL` must have schema/table read-write access for Prisma.
4. **SSL**
   - Keep `sslmode=require` in `DATABASE_URL`.

### Amplify hosting
1. Confirm branch has all required env vars.
2. If using a custom domain, update `NEXTAUTH_URL` to that exact HTTPS URL.
3. After first successful deploy, validate:
   - signup/signin
   - protected routes
   - DB-backed pages
   - Razorpay order API + webhook endpoint

### Recommended hardening (optional but important)
- Use **RDS Proxy** for connection pooling and resilience with serverless/SSR traffic.
- Rotate DB password and Razorpay secrets regularly.
- Restrict DB access by network controls and monitoring alarms.

---

## Useful commands
```bash
npm run lint
npm run build
npm run prisma:generate
npm run prisma:migrate -- --name init
```
