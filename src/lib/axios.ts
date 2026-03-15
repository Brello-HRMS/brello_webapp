import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { envVars } from '../utils/envVars';

// --- Configuration & Initialization ---
const baseURL = envVars.BRELLO_BASE_API;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Helper Functions ---

/**
 * Retrieves the authentication token from storage.
 * @returns {string | null} The token or null if not found.
 */
function getAuthToken(): string | null {
  // Replace this with standard auth token retrieval logic (e.g., localStorage, Zustand store, etc.)
  // Keeping it isolated here per the "keep functions small and single-responsibility" rule.
  return localStorage.getItem('auth_token');
}

/**
 * Handles clearing the session when a 401 Unauthorized occurs.
 */
function handleUnauthorizedClient() {
  // Clear the token and potentially trigger a redirect or auth state change
  localStorage.removeItem('auth_token');
  window.location.href = '/login'; // Or use a global event/state manager
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

apiClient.interceptors.response.use(
  (response) => {
    // We only care about the data, so we can unwrap it for the rest of the application
    return response.data;
  },
  (error: AxiosError) => {
    // Check for specific application-level unauthorized responses
    if (error.response?.status === 401) {
      handleUnauthorizedClient();
    }

    // Always reject with a standardized format to keep the UI logic clean
    const formattedError = parseApiError(error);
    return Promise.reject(formattedError);
  },
);
