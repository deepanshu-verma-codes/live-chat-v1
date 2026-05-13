import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

// Set up axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Functions
export const signup = (userData) => {
  // If userData is FormData, let axios handle the Content-Type (multipart/form-data)
  const config = userData instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  return api.post("/signup", userData, config).then((response) => response.data);
};

export const checkUsername = (username) =>
  api.get(`/check-username?username=${username}`).then((response) => response.data);

export const login = (credentials) =>
  api.post("/login", credentials).then((response) => response.data);

export const getUsers = () =>
  api.get("/users").then((response) => response.data);

export const getChatList = () =>
  api.get("/chat-list").then((response) => response.data);
