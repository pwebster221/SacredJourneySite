/**
 * API Configuration
 *
 * Single source of truth for API base URL.
 * SSR context: uses environment variable with production fallback.
 * Client-side context: pages pass this value via define:vars.
 */

export const API_BASE = import.meta.env.PUBLIC_API_BASE || 'https://repository.dubtown-server.us';

/** V2 API path prefix. SSR: `${API_BASE}${V2_PREFIX}/cycles/active`  Client: `${getClientApiBase()}${V2_PREFIX}/cycles/active` */
export const V2_PREFIX = '/v2/sacred-journey';

/** Tailscale internal URL for local development */
export const API_BASE_LOCAL = 'http://100.117.79.64:8000';

/** Production Funnel URL */
export const API_BASE_PROD = 'https://repository.dubtown-server.us';

/**
 * Client-side API base detection.
 * Use this in client-side <script> tags where import.meta.env is unavailable.
 * Prefer using define:vars to pass API_BASE from SSR instead.
 */
export function getClientApiBase(): string {
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.startsWith('100.');
  return isLocalDev ? API_BASE_LOCAL : API_BASE_PROD;
}
