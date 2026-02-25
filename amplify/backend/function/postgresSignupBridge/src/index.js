const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  const expectedSecret = process.env.BRIDGE_SHARED_SECRET || '';
  const providedSecret = event?.headers?.['x-bridge-secret'] || event?.headers?.['X-Bridge-Secret'] || '';

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return json(401, { error: 'Unauthorized bridge request.' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return json(500, { error: 'DATABASE_URL missing in bridge lambda.' });
  }

  let payload;
  try {
    payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const name = payload?.name || null;
  const email = String(payload?.email || '').trim().toLowerCase();
  const password = String(payload?.password || '');

  if (!email || !password) {
    return json(400, { error: 'Email and password required.' });
  }

  const client = new Client({
    connectionString: databaseUrl,
    statement_timeout: 12000,
    connectionTimeoutMillis: 12000,
    ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();

    const existing = await client.query('SELECT id FROM "User" WHERE email = $1 LIMIT 1', [email]);
    if (existing.rowCount > 0) {
      return json(400, { error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const inserted = await client.query(
      'INSERT INTO "User" (id, name, email, "hashedPassword", role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email',
      [crypto.randomUUID(), name, email, hashedPassword, 'PATIENT'],
    );

    return json(200, { id: inserted.rows[0].id, email: inserted.rows[0].email, via: 'postgresSignupBridge' });
  } catch (error) {
    return json(500, {
      error: 'Bridge signup failed.',
      details: { name: error?.name, code: error?.code, message: error?.message },
    });
  } finally {
    await client.end().catch(() => {});
  }
};
