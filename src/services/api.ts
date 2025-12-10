import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

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
      window.location.href = "/marketplace";
    }
    return Promise.reject(error);
  }
);

// Simple wrapper to return data or throw
export async function fetcher<T>(promise: Promise<any>): Promise<T> {
  const res = await promise;
  return res.data as T;
}

export default api;
