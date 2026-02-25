import { URL } from 'url';

type AuthEnvSummary = {
  nextAuthUrlPresent: boolean;
  nextAuthSecretPresent: boolean;
  nextAuthUrl?: string;
  origin?: string;
  protocol?: string;
  host?: string;
  pathname?: string;
  hasQueryOrHash?: boolean;
  isValidAbsoluteUrl?: boolean;
  hasPathBeyondRoot?: boolean;
  recommendations: string[];
};

export function getAuthEnvSummary(): AuthEnvSummary {
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const summary: AuthEnvSummary = {
    nextAuthUrlPresent: Boolean(nextAuthUrl),
    nextAuthSecretPresent: Boolean(process.env.NEXTAUTH_SECRET),
    nextAuthUrl,
    recommendations: [],
  };

  if (!nextAuthUrl) {
    summary.recommendations.push('Set NEXTAUTH_URL to your Amplify branch origin (no path).');
    return summary;
  }

  try {
    const parsed = new URL(nextAuthUrl);
    const hasPathBeyondRoot = Boolean(parsed.pathname && parsed.pathname !== '/');
    const hasQueryOrHash = Boolean(parsed.search || parsed.hash);

    summary.isValidAbsoluteUrl = true;
    summary.protocol = parsed.protocol;
    summary.host = parsed.host;
    summary.pathname = parsed.pathname;
    summary.origin = parsed.origin;
    summary.hasPathBeyondRoot = hasPathBeyondRoot;
    summary.hasQueryOrHash = hasQueryOrHash;

    if (!/^https?:$/.test(parsed.protocol)) {
      summary.recommendations.push('NEXTAUTH_URL should use http:// or https://.');
    }
    if (hasPathBeyondRoot) {
      summary.recommendations.push('NEXTAUTH_URL should not include a path; keep only the origin.');
    }
    if (hasQueryOrHash) {
      summary.recommendations.push('NEXTAUTH_URL should not include query params or hash fragments.');
    }
  } catch {
    summary.isValidAbsoluteUrl = false;
    summary.recommendations.push('NEXTAUTH_URL is not a valid absolute URL.');
  }

  if (!summary.nextAuthSecretPresent) {
    summary.recommendations.push('Set NEXTAUTH_SECRET in Amplify environment variables for this branch.');
  }

  return summary;
}
