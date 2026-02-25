import { URL } from 'url';

type DbEnvSummary = {
  isPresent: boolean;
  protocol?: string;
  host?: string;
  port?: string;
  database?: string;
  hasSslModeParam?: boolean;
  hasConnectionLimitParam?: boolean;
  hasPoolTimeoutParam?: boolean;
  hasConnectTimeoutParam?: boolean;
  isAmplifyRuntime?: boolean;
  isPrismaAccelerateUrl?: boolean;
  directDatabaseUrlPresent?: boolean;
};

export function getDatabaseEnvSummary(): DbEnvSummary {
  const value = process.env.DATABASE_URL;
  if (!value) {
    return { isPresent: false };
  }

  const isPrismaAccelerateUrl = value.startsWith('prisma://');

  try {
    const parsed = new URL(value);
    return {
      isPresent: true,
      protocol: parsed.protocol,
      host: parsed.hostname,
      port: parsed.port,
      database: parsed.pathname.replace(/^\//, ''),
      hasSslModeParam: parsed.searchParams.has('sslmode'),
      hasConnectionLimitParam: parsed.searchParams.has('connection_limit'),
      hasPoolTimeoutParam: parsed.searchParams.has('pool_timeout'),
      hasConnectTimeoutParam: parsed.searchParams.has('connect_timeout'),
      isAmplifyRuntime: Boolean(process.env.AWS_BRANCH || process.env.AWS_APP_ID || process.env.AWS_EXECUTION_ENV),
      isPrismaAccelerateUrl,
      directDatabaseUrlPresent: Boolean(process.env.DIRECT_DATABASE_URL),
    };
  } catch {
    return {
      isPresent: true,
      isPrismaAccelerateUrl,
      directDatabaseUrlPresent: Boolean(process.env.DIRECT_DATABASE_URL),
    };
  }
}
