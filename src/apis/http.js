import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("managerToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("managerToken");
      localStorage.removeItem("managerUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const IMAGE_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace('/api', '');

export const getMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  const cleanPath = (path || "").replace(/\\/g, '/');
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};

export default http;
