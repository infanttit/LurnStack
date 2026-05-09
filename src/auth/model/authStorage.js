const USERS_KEY = "lurnstack:auth:users:v1";
const SESSION_KEY = "lurnstack:auth:session:v1";

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadUsers() {
  if (typeof window === "undefined") return [];
  const parsed = safeJsonParse(window.localStorage.getItem(USERS_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

function saveUsers(users) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession() {
  if (typeof window === "undefined") return null;
  const parsed = safeJsonParse(window.localStorage.getItem(SESSION_KEY));
  if (!parsed?.userId) return null;
  return { userId: String(parsed.userId) };
}

function saveSession(session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getCurrentUser() {
  const session = loadSession();
  if (!session) return null;
  const users = loadUsers();
  const user = users.find((u) => String(u.id) === String(session.userId));
  if (!user) return null;
  return {
    id: String(user.id),
    fullName: user.fullName || "",
    email: user.email || "",
    createdAt: user.createdAt || "",
  };
}

export function registerUser({ fullName, email, password }) {
  const users = loadUsers();
  const normEmail = normalizeEmail(email);

  const exists = users.some((u) => normalizeEmail(u.email) === normEmail);
  if (exists) {
    const err = new Error("This email is already registered.");
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  const user = {
    id: makeId(),
    fullName: String(fullName || "").trim(),
    email: normEmail,
    password: String(password || ""),
    createdAt: new Date().toISOString(),
  };

  saveUsers([user, ...users]);
  saveSession({ userId: user.id });

  return { id: user.id, fullName: user.fullName, email: user.email, createdAt: user.createdAt };
}

export function authenticateUser({ email, password }) {
  const users = loadUsers();
  const normEmail = normalizeEmail(email);
  const user = users.find((u) => normalizeEmail(u.email) === normEmail);
  if (!user || String(user.password) !== String(password || "")) {
    const err = new Error("Invalid email or password.");
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  saveSession({ userId: user.id });
  return { id: String(user.id), fullName: user.fullName || "", email: user.email || "", createdAt: user.createdAt || "" };
}

export function logoutUser() {
  clearSession();
}

