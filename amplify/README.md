# Amplify backend resources for PostgreSQL troubleshooting

This repository includes two Amplify backend Lambda resources:

1. `postgresConnectivityCheck`
   - Runs `SELECT 1` against `DATABASE_URL`
   - Confirms if backend Lambda networking can reach Postgres

2. `postgresSignupBridge` (out-of-the-box fallback)
   - Accepts signup payload over Lambda Function URL
   - Writes user row directly to Postgres using `pg`
   - Designed to bypass Next.js API runtime DB connectivity issues

## Required parameters
For `postgresConnectivityCheck`:
- `databaseUrl`
- `privateSubnetIds` (optional)
- `securityGroupIds` (optional)

For `postgresSignupBridge`:
- `databaseUrl`
- `bridgeSharedSecret`
- `privateSubnetIds` (optional)
- `securityGroupIds` (optional)

## Deploy backend resources
```bash
amplify env add   # if not already created
amplify push
```

## Wire signup fallback in app runtime
Set these environment variables in Amplify app branch settings:

- `SIGNUP_BRIDGE_URL=<output FunctionUrl from postgresSignupBridge stack>`
- `SIGNUP_BRIDGE_SECRET=<same value as bridgeSharedSecret>`

When Prisma initialization fails in `/api/auth/signup`, the app will automatically call the bridge URL.

Optional emergency switch:
- `FORCE_SIGNUP_BRIDGE=true` to always route signup writes through the bridge.

## If `amplify push` fails with `Found "{" where a key name was expected`
This is a JSON parsing failure in local Amplify files.

1. Run:
```bash
npm run validate:amplify
```
2. If validation passes but push still fails on Windows, re-checkout backend files to remove local encoding/merge artifacts:
```bash
git checkout -- amplify/backend
```
3. Re-run:
```bash
amplify push --verbose
```

