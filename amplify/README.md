# Amplify backend resources in this repo

This Amplify backend now includes three Lambda resources:

- `medicsaltour2cbbb858` (existing)
- `postgresConnectivityCheck` (new) – runtime DB connectivity probe (`SELECT 1`)
- `postgresSignupBridge` (new) – optional signup write bridge into Postgres from Lambda

## Configure function parameters

Before `amplify push`, set function parameters (or update them in `amplify/backend/function/<name>/parameters.json`):

### `postgresConnectivityCheck`
- `databaseUrl`: full Postgres URL (use SSL params for RDS)
- `privateSubnetIds` (optional): comma-separated private subnet IDs
- `securityGroupIds` (optional): comma-separated SG IDs
- `CloudWatchRule` (optional): cron/rate expression; keep `NONE` to disable schedule

### `postgresSignupBridge`
- `databaseUrl`: full Postgres URL
- `bridgeSharedSecret`: shared secret required in `x-bridge-secret` header
- `privateSubnetIds` (optional)
- `securityGroupIds` (optional)

## Deploy

```bash
amplify env checkout <env>
amplify push
```

## Wire bridge into application

After deploy, capture the function URL output for `postgresSignupBridge` and set app env vars:

```bash
SIGNUP_BRIDGE_URL=<lambda_function_url>
SIGNUP_BRIDGE_SECRET=<same_bridgeSharedSecret>
FORCE_SIGNUP_BRIDGE=false
```

`/api/auth/signup` already supports automatic fallback to this bridge when Prisma runtime DB connectivity fails.

## Verify connectivity end-to-end

1) Invoke connectivity lambda:
```bash
aws lambda invoke --function-name postgresConnectivityCheck-<env> out.json && cat out.json
```

2) Verify app runtime DB path:
```bash
curl -s https://<app-domain>/api/health/db | jq
```

3) Verify signup bridge path (optional):
```bash
curl -s -X POST "$SIGNUP_BRIDGE_URL" \
  -H 'content-type: application/json' \
  -H "x-bridge-secret: $SIGNUP_BRIDGE_SECRET" \
  -d '{"name":"Demo","email":"demo@example.com","password":"ChangeMe123!"}' | jq
```
