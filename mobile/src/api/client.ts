import axios from 'axios';
import { getToken, clearToken } from '../auth/storage';

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------

// Expo exposes extra env vars prefixed with EXPO_PUBLIC_.
// Fallback to localhost for local dev.
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach the JWT from AsyncStorage to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear the stale token so the app redirects to login
// (The backend doesn't currently validate JWTs, but this keeps the pattern
//  correct for when real auth is wired up.)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearToken();
    }
    return Promise.reject(error);
  }
);
