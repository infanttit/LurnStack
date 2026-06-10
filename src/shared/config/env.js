export const env = {
  apiBaseUrl:
    String(process.env.REACT_APP_BACKEND_URL || "").trim() ||
    String(process.env.REACT_APP_API_BASE_URL || "").trim() ||
    "https://api.lurnstack.com",
};
