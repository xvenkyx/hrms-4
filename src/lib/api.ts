import axios from "axios";
import { getToken } from "./auth";

export const api = axios.create({
  baseURL: "https://wa2zqd8e7f.execute-api.us-east-1.amazonaws.com/prod",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
