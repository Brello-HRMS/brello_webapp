import { envVars } from './envVars';

/**
 * Resolve a server-returned asset URL into one the browser can fetch.
 *
 * S3 (production) URLs come back fully qualified — pass through.
 * DATABASE-backed assets (dev) come back as relative paths like
 * `/api/v1/documents/<id>/view?sig=...&exp=...` — prefix with the API origin
 * (without the api/v1 suffix, which is already in the path).
 */
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^(?:https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  try {
    const origin = new URL(envVars.BRELLO_BASE_API).origin;
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  } catch {
    return url;
  }
}
