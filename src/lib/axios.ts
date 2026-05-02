import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { envVars } from '../utils/envVars';

// --- Configuration & Initialization ---
const baseURL = envVars.BRELLO_BASE_API;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// --- Helper Functions ---

/**
 * Retrieves the authentication token from storage.
 * @returns {string | null} The token or null if not found.
 */
function getAuthToken(): string | null {
  const authResponseStr = sessionStorage.getItem('auth_response');
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

/**
 * Handles clearing the session when a 401 Unauthorized occurs.
 */
function handleUnauthorizedClient() {
  // Clear the token and potentially trigger a redirect or auth state change
  sessionStorage.removeItem('auth_response');
  sessionStorage.removeItem('access_token');
  window.location.href = '/auth/login'; // Or use a global event/state manager
}

/**
 * Standardizes the error format to return predictable errors to the UI.
 */
function parseApiError(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    // API returned a specific error structure (status code out of 2xx range)
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

    // Explicit condition checking, avoiding nested if-else structures where possible
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
    // We only care about the data, so we can unwrap it for the rest of the application
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check for specific application-level unauthorized responses
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
          const authResponseStr = sessionStorage.getItem('auth_response');
          if (authResponseStr) {
            const auth = JSON.parse(authResponseStr);
            auth.data.access_token = newToken;
            sessionStorage.setItem('auth_response', JSON.stringify(auth));
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

    // Always reject with a standardized format to keep the UI logic clean
    const formattedError = parseApiError(error);
    return Promise.reject(formattedError);
  },
);
