import axios from "axios";

// Prefer explicit VITE_API_BASE; fallback to localhost during dev, otherwise to current origin
const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000' : window.location.origin);
const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_BASE || window.location.origin;

export const api = axios.create({
  baseURL: API_BASE + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agronexus_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("agronexus_token");
      localStorage.removeItem("agronexus_user");
      // Use configured frontend base to avoid redirecting to an incorrect origin
      // and ensure we redirect only to the public SPA route.
      // Redirect to root to avoid SPA route 404 in some hosting environments
      window.location.href = `${FRONTEND_BASE}/`;
    }
    return Promise.reject(error);
  }
);

// Simple wrapper to return data or throw
export async function fetcher<T>(promise: Promise<any>): Promise<T> {
  const res = await promise;
  // Many backend list endpoints return { results, total, page, limit }
  // Unwrap `results` if present so frontend callers receive arrays directly.
  const data = res.data;
  return (data && data.results) ? (data.results as T) : (data as T);
}

export default api;
