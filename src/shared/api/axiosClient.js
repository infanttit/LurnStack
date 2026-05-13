import axios from "axios";
import { env } from "../config/env";
import { getAuthToken } from "../../auth/model/authStorage";

const baseURL = String(env.apiBaseUrl || "").replace(/\/+$/, "");

export const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
