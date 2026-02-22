import axios from 'axios';

import { env } from '../config/env';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here (e.g. logging out on 401)
    return Promise.reject(error);
  },
);
