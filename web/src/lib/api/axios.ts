import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor to attach JWT token to outgoing requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("safesphere_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET requests for offline mode
    if (typeof window !== "undefined" && response.config.method?.toUpperCase() === "GET") {
      try {
        const urlKey = response.config.url || "";
        localStorage.setItem(`cache_${urlKey}`, JSON.stringify(response.data));
      } catch (e) {
        console.warn("Could not cache response:", e);
      }
    }
    return response;
  },
  (error) => {
    // Return cached data if offline, otherwise reject. NO MORE FAKE DEMO DATA.
    if (typeof window !== "undefined" && (!error.response || error.code === "ERR_NETWORK")) {
      const url = error.config?.url || "";
      if (error.config?.method?.toUpperCase() === "GET") {
        const cached = localStorage.getItem(`cache_${url}`);
        if (cached) {
          return Promise.resolve({ data: JSON.parse(cached), status: 200, statusText: "OK (Cached)", headers: {}, config: error.config });
        }
      }
    }
    return Promise.reject(error);
  }
);
