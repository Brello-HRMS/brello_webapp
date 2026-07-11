const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const raw = parts.pop()?.split(';').shift();
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
};

export const setCookie = (name: string, value: string): void => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
};

export const removeCookie = (name: string): void => {
  document.cookie = `${name}=; Max-Age=0; Path=/`;
};

/**
 * Persists the login response to the (JS-readable) `auth_response` cookie,
 * minus `refresh_token`. The backend already issues a separate HttpOnly
 * refresh cookie that /auth/refresh relies on via `withCredentials` — the
 * client never reads refresh_token back out of this cookie, so keeping it
 * here is pure unnecessary exposure to any injected script.
 */
export const persistAuthResponse = (data: { data: Record<string, unknown> }): void => {
  const { refresh_token: _refresh_token, ...rest } = data.data;
  setCookie('auth_response', JSON.stringify({ ...data, data: rest }));
};
