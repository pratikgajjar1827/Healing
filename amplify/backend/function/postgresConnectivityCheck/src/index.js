const { Pool } = require('pg');

exports.handler = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'DATABASE_URL is not configured.' }),
    };
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const result = await pool.query('SELECT 1 AS healthy');
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        message: 'PostgreSQL connectivity confirmed from Lambda runtime.',
        result: result.rows[0] ?? null,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: 'Failed to connect/query PostgreSQL.',
        details: error?.message || 'Unknown error',
      }),
    };
  } finally {
    await pool.end().catch(() => {});
  }
};
