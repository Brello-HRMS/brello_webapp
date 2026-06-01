import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { envVars } from '../utils/envVars';
import { getCookie, setCookie, removeCookie } from '../utils/cookieUtils';

const baseURL = envVars.BRELLO_BASE_API;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

function getAuthToken(): string | null {
  const authResponseStr = getCookie('auth_response');
  if (authResponseStr) {
    try {
      const authResponse = JSON.parse(authResponseStr);
      if (authResponse?.data?.access_token) {
        return authResponse.data.access_token;
      }
    } catch {
      // Ignored
    }
  }
  return null;
}

function handleUnauthorizedClient() {
  removeCookie('auth_response');
  window.location.href = '/auth/login';
}

function parseApiError(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    return {
      message: error.response.data?.message || 'An error occurred while processing your request.',
      status: error.response.status,
      data: error.response.data,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, status: 500, data: null };
  }

  return { message: 'An unknown error occurred.', status: 500, data: null };
}

// --- Request Interceptor ---

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// --- Response Interceptor ---
let isRefreshing = false;
let failedQueue: {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        const data = response.data?.data;
        const newToken = data?.access_token;

        if (newToken) {
          const authResponseStr = getCookie('auth_response');
          if (authResponseStr) {
            const auth = JSON.parse(authResponseStr);
            auth.data.access_token = newToken;
            setCookie('auth_response', JSON.stringify(auth));
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          processQueue(null, newToken);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleUnauthorizedClient();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const formattedError = parseApiError(error);
    return Promise.reject(formattedError);
  },
);
