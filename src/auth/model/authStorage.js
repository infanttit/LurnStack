import { loginApi, registerApi } from "../api/authApi";

const USER_KEY = "lurnstack:auth:user:v1";
const TOKEN_KEY = "lurnstack:auth:token:v1";
const TRAINER_ACCOUNTS_KEY = "lurnstack:trainer-accounts:v1";
const TRAINER_TOKEN_PREFIX = "trainer-local-token";

const DEFAULT_TRAINER = {
  fullName: "LurnStack Trainer",
  email: "trainer@lurnstack.com",
  password: "Trainer@123",
  role: "trainer",
};

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

function loadTrainerAccounts() {
  const storage = getWebStorage("local");
  const parsed = safeJsonParse(storage?.getItem(TRAINER_ACCOUNTS_KEY));
  const accounts = parsed && typeof parsed === "object" ? parsed : {};
  return {
    [DEFAULT_TRAINER.email]: DEFAULT_TRAINER,
    ...accounts,
  };
}

function saveTrainerAccount(account) {
  const storage = getWebStorage("local");
  if (!storage) return;
  const accounts = loadTrainerAccounts();
  accounts[account.email] = account;
  delete accounts[DEFAULT_TRAINER.email];
  storage.setItem(TRAINER_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toPublicUser(user) {
  if (!user || typeof user !== "object") return null;
  const fullName = user.fullName || user.FULL_NAME || user.name || "";
  const email = user.email || user.EMAIL_ADDRESS || "";
  const { password, ...rest } = user;
  return { ...rest, fullName, email, role: user.role || "student" };
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
  const user = toPublicUser(result.user);
  saveUser(user, { persist });
  return user;
}

export async function authenticateUser({ email, password, persist = true }) {
  const result = await loginApi({ email, password });
  saveToken(result.token, { persist });
  const user = toPublicUser(result.user);
  saveUser(user, { persist });
  return user;
}

export async function registerTrainer({ fullName, email, password, persist = true }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const accounts = loadTrainerAccounts();
  if (accounts[normalizedEmail]) {
    throw new Error("A trainer account already exists with this email.");
  }
  const user = {
    fullName: String(fullName || "").trim(),
    email: normalizedEmail,
    password: String(password || ""),
    role: "trainer",
  };
  saveTrainerAccount(user);
  saveToken(`${TRAINER_TOKEN_PREFIX}:${normalizedEmail}`, { persist });
  saveUser(toPublicUser(user), { persist });
  return toPublicUser(user);
}

export async function authenticateTrainer({ email, password, persist = true }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const accounts = loadTrainerAccounts();
  const trainer = accounts[normalizedEmail];
  if (!trainer || trainer.password !== String(password || "")) {
    throw new Error("Invalid trainer credentials.");
  }
  saveToken(`${TRAINER_TOKEN_PREFIX}:${normalizedEmail}`, { persist });
  saveUser(toPublicUser(trainer), { persist });
  return toPublicUser(trainer);
}

export function logoutUser() {
  const local = getWebStorage("local");
  const session = getWebStorage("session");
  local?.removeItem(TOKEN_KEY);
  local?.removeItem(USER_KEY);
  session?.removeItem(TOKEN_KEY);
  session?.removeItem(USER_KEY);
}

