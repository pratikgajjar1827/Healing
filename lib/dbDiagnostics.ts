import { URL } from 'url';

type DbEnvSummary = {
  isPresent: boolean;
  protocol?: string;
  host?: string;
  port?: string;
  database?: string;
  hasSslModeParam?: boolean;
};

export function getDatabaseEnvSummary(): DbEnvSummary {
  const value = process.env.DATABASE_URL;
  if (!value) {
    return { isPresent: false };
  }

  try {
    const parsed = new URL(value);
    return {
      isPresent: true,
      protocol: parsed.protocol,
      host: parsed.hostname,
      port: parsed.port,
      database: parsed.pathname.replace(/^\//, ''),
      hasSslModeParam: parsed.searchParams.has('sslmode'),
    };
  } catch {
    return { isPresent: true };
  }
}

