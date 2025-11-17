import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5002/api";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - automatically add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const endpoints = {
  auth: {
    login: "/user/login",
    register: "/user/create-account",
  },
  user: {
    list: "/user/get-users",
    detail: (id) => `/user/get/${id}`,
    create: "/user/add-user",
    update: (id) => `/user/update-user/${id}`,
    delete: (id) => `/user/delete-user/${id}`,
  },
};

export { endpoints };
export default api;
