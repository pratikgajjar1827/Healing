const ENV_KEYS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'AUTH_SECRET',
  'NEXTAUTH_URL',
] as const;

let hydrated = false;

export function hydrateRuntimeEnv() {
  if (hydrated) return;
  hydrated = true;

  // 1) Direct process env values configured in Amplify env vars.
  for (const key of ENV_KEYS) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) {
      process.env[key] = value.trim();
    }
  }

  // 2) Amplify can also inject secrets as a JSON string in process.env.secrets.
  const secretsRaw = process.env.secrets;
  if (!secretsRaw) return;

  try {
    const parsed = JSON.parse(secretsRaw) as Record<string, string>;
    for (const key of ENV_KEYS) {
      if (!process.env[key] && parsed[key]) {
        process.env[key] = String(parsed[key]).trim();
      }
    }
  } catch {
    // ignore malformed secrets payload and continue with existing env vars
  }
}
