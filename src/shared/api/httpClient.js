function joinUrl(baseUrl, path) {
  const b = String(baseUrl || "").replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  return p ? `${b}/${p}` : b;
}

function withQuery(url, query) {
  if (!query || typeof query !== "object") return url;
  const u = new URL(url, window.location.origin);
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.searchParams.set(k, String(v));
  });
  return u.toString();
}

async function parseJsonSafe(res) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export class HttpError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

export function createHttpClient({
  baseUrl = process.env.REACT_APP_API_BASE_URL || "",
  getAuthToken,
} = {}) {
  const request = async (method, path, { query, body, headers } = {}) => {
    const url = withQuery(joinUrl(baseUrl, path), query);

    const token = typeof getAuthToken === "function" ? getAuthToken() : null;
    const res = await fetch(url, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await parseJsonSafe(res);
    if (!res.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Request failed (${res.status} ${res.statusText})`;
      throw new HttpError(message, { status: res.status, data });
    }
    return data;
  };

  return {
    get: (path, opts) => request("GET", path, opts),
    post: (path, opts) => request("POST", path, opts),
    put: (path, opts) => request("PUT", path, opts),
    patch: (path, opts) => request("PATCH", path, opts),
    del: (path, opts) => request("DELETE", path, opts),
  };
}

