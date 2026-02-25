const { Client } = require('pg');

function redactUrl(value) {
  if (!value) return value;
  try {
    const parsed = new URL(value);
    if (parsed.password) parsed.password = '***';
    if (parsed.username) parsed.username = '***';
    return parsed.toString();
  } catch {
    return 'INVALID_DATABASE_URL';
  }
}

exports.handler = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return {
      ok: false,
      error: 'DATABASE_URL is not set for postgresConnectivityCheck Lambda.',
    };
  }

  const client = new Client({
    connectionString: databaseUrl,
    statement_timeout: 12000,
    connectionTimeoutMillis: 12000,
    ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    const start = Date.now();
    await client.query('SELECT 1');
    const elapsedMs = Date.now() - start;

    return {
      ok: true,
      message: 'PostgreSQL connectivity check succeeded from Amplify backend Lambda.',
      elapsedMs,
      target: redactUrl(databaseUrl),
    };
  } catch (error) {
    return {
      ok: false,
      error: 'PostgreSQL connectivity check failed from Amplify backend Lambda.',
      details: {
        name: error?.name,
        code: error?.code,
        message: error?.message,
      },
      target: redactUrl(databaseUrl),
      hint: 'If this Lambda is in a VPC, ensure subnet routing + SG rules allow outbound traffic to RDS:5432.',
    };
  } finally {
    await client.end().catch(() => {});
  }
};
