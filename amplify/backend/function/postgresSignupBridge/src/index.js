const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

function response(statusCode, payload) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

exports.handler = async (event) => {
  const sharedSecret = process.env.BRIDGE_SHARED_SECRET;
  const dbUrl = process.env.DATABASE_URL;

  if (!sharedSecret || !dbUrl) {
    return response(500, {
      ok: false,
      error: 'Bridge is not configured. DATABASE_URL and BRIDGE_SHARED_SECRET are required.',
    });
  }

  const secretFromHeader =
    event?.headers?.['x-bridge-secret'] ||
    event?.headers?.['X-Bridge-Secret'] ||
    event?.headers?.['x-Bridge-Secret'];

  if (secretFromHeader !== sharedSecret) {
    return response(403, { ok: false, error: 'Invalid bridge secret.' });
  }

  let payload;
  try {
    payload = event?.body ? JSON.parse(event.body) : {};
  } catch {
    return response(400, { ok: false, error: 'Invalid JSON body.' });
  }

  const name = payload?.name ?? null;
  const email = String(payload?.email || '').trim().toLowerCase();
  const password = String(payload?.password || '');

  if (!email || !password) {
    return response(400, { ok: false, error: 'Email and password are required.' });
  }

  const pool = new Pool({
    connectionString: dbUrl,
    max: 1,
    ssl: dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const existing = await pool.query('SELECT id FROM "User" WHERE email = $1 LIMIT 1', [email]);
    if (existing.rowCount > 0) {
      return response(400, { ok: false, error: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await pool.query(
      'INSERT INTO "User" (name, email, "hashedPassword", role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, email',
      [name, email, hashedPassword, 'PATIENT'],
    );

    return response(200, {
      ok: true,
      id: created.rows[0].id,
      email: created.rows[0].email,
      source: 'postgresSignupBridge',
    });
  } catch (error) {
    return response(500, {
      ok: false,
      error: 'Signup bridge failed.',
      details: error?.message || 'Unknown error',
    });
  } finally {
    await pool.end().catch(() => {});
  }
};
