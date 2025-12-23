import axios from "axios";
import { jwtDecode } from "jwt-decode";

// LOCALHOST API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
// PRODUCTION API URL
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://202.90.138.42:5002/api";
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.1.102:5002/api";
//const API_BASE_URL = import.meta.env.VITE_API_URL || "http://fms.ndc.gov.ph:5002/api";

// Base URL for static files (served outside /api, e.g. /concernfiles)
// If API_BASE_URL ends with /api, strip it; otherwise reuse as-is
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies (httpOnly cookies)
});

// Request interceptor - cookies are automatically sent with withCredentials: true
// No need to manually add Authorization header anymore
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically included with withCredentials: true
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
    logout: "/user/logout",
    verify: "/user/verify",
  },

  // USER ROUTES
  user: {
    getUsers: "/user/get-users",
    getUser: (id) => `/user/get/${id}`,
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

  // ACTION LOGS ROUTES
  actionlogs: {
    getAll: "/action-logs/get-all-action-logs",
    create: "/action-logs/create-action-log",
  },

  // CONCERNS ROUTES
  concerns: {
    getAll: "/concerns",
    getById: (id) => `/concerns/${id}`,
    getByControlNumber: (controlNumber) => `/concerns/control-number/${controlNumber}`,
    create: "/concerns",
    update: (id) => `/concerns/${id}`,
    delete: (id) => `/concerns/${id}`,
  },

  // CONCERN FILES ROUTES
  concernfiles: {
    getFile: (fileName) => `/concernfiles/${fileName}`,
  },

  // USER IMAGES ROUTES
  userimages: {
    getImage: (fileName) => `/userimages/${fileName}`,
  },

  // REMARKS ROUTES
  remarks: {
    getByConcern: (concernId) => `/remarks/${concernId}`,
    create: (concernId) => `/remarks/${concernId}`,
    update: (id) => `/remarks/${id}`,
    delete: (id) => `/remarks/${id}`,
  },
};

export { endpoints, API_BASE_URL, FILE_BASE_URL };
export default api;
