import axios from "axios";
import { jwtDecode } from "jwt-decode";

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
  // AUTH ROUTES
  auth: {
    login: "/user/login",
    register: "/user/create-account",
  },

  // USER ROUTES
  user: {
    getUsers: "/user/get-users",
    getUser: (id) => `/user/get/${id}`,
    create: "/user/add-user",
    update: (id) => `/user/update-user/${id}`,
    delete: (id) => `/user/delete-user/${id}`,
  },

  // RBAC ROUTES
  rbac: {
    getRoles: "/rbac/get-roles",
  },

  // ITEMS ROUTES
  items: {
    // ITEMS CODE ROUTES
    createItemsCode: "/items/create-items-code",
    getAllItemsCode: "/items/get-all-items-code",
    getItemsCodeById: (id) => `/items/get-items-code-by-id/${id}`,
    updateItemsCode: (id) => `/items/update-items-code/${id}`,
    deleteItemsCode: (id) => `/items/delete-items-code/${id}`,

    // ITEMS ROUTES
    createItem: "/items/create-item",
    getAllItems: "/items/get-all-items",
    getItemById: (id) => `/items/get-item-by-id/${id}`,
    updateItem: (id) => `/items/update-item/${id}`,
    deleteItem: (id) => `/items/delete-item/${id}`,
  },

  // LOCATIONS ROUTES
  locations: {
    createLocation: "/locations/create-location",
    getAllLocations: "/locations/get-all-locations",
    updateLocation: (id) => `/locations/update-location/${id}`,
    deleteLocation: (id) => `/locations/delete-location/${id}`,
  },
};

export { endpoints };
export default api;
