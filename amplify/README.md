# Amplify backend resource: PostgreSQL connectivity check

This repository now includes an Amplify backend **Lambda** resource at:

- `amplify/backend/function/postgresConnectivityCheck`

It is intended to verify that an Amplify backend runtime can reach your PostgreSQL (RDS) instance.

## What it does
- Reads `DATABASE_URL` from Lambda environment variables.
- Attempts to connect to PostgreSQL and runs `SELECT 1`.
- Returns a JSON payload with `ok: true/false`, latency, and error details.

## Required configuration
Set the following Amplify function parameters before pushing backend resources:

- `databaseUrl` → your PostgreSQL URL
- `privateSubnetIds` (optional but recommended for private RDS)
- `securityGroupIds` (optional but recommended for private RDS)

## Deploy backend resources
```bash
amplify env add   # if not already created
amplify push
```

After deployment, invoke the Lambda in AWS console to validate connectivity.
