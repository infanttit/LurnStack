import { loginApi, registerApi } from "../api/authApi";

const USER_KEY = "lurnstack:auth:user:v1";
const TOKEN_KEY = "lurnstack:auth:token:v1";

function getWebStorage(type) {
  if (typeof window === "undefined") return null;
  return type === "session" ? window.sessionStorage : window.localStorage;
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUser(user, { persist } = {}) {
  const storage = getWebStorage(persist ? "local" : "session");
  if (!storage) return;
  storage.setItem(USER_KEY, JSON.stringify(user || null));
}

function loadUser() {
  const local = getWebStorage("local");
  const session = getWebStorage("session");
  const raw = local?.getItem(USER_KEY) || session?.getItem(USER_KEY);
  const parsed = safeJsonParse(raw);
  return parsed && typeof parsed === "object" ? parsed : null;
}

function saveToken(token, { persist } = {}) {
  const storage = getWebStorage(persist ? "local" : "session");
  if (!storage) return;

  if (!token) storage.removeItem(TOKEN_KEY);
  else storage.setItem(TOKEN_KEY, String(token));
}

function loadToken() {
  const local = getWebStorage("local");
  const session = getWebStorage("session");
  const raw = local?.getItem(TOKEN_KEY) || session?.getItem(TOKEN_KEY) || "";
  return String(raw);
}

export function getAuthToken() {
  return loadToken() || "";
}

export function getCurrentUser() {
  const token = loadToken();
  const user = loadUser();
  if (!token || !user) return null;
  return user;
}

export async function registerUser({ fullName, email, password, persist = true }) {
  const result = await registerApi({ fullName, email, password });
  if (result.token) saveToken(result.token, { persist });
  saveUser(result.user, { persist });
  return result.user;
}

export async function authenticateUser({ email, password, persist = true }) {
  const result = await loginApi({ email, password });
  saveToken(result.token, { persist });
  saveUser(result.user, { persist });
  return result.user;
}

export function logoutUser() {
  const local = getWebStorage("local");
  const session = getWebStorage("session");
  local?.removeItem(TOKEN_KEY);
  local?.removeItem(USER_KEY);
  session?.removeItem(TOKEN_KEY);
  session?.removeItem(USER_KEY);
}

