/**
 * User service: talks to Spring Boot `user_service` over HTTP.
 *
 * Base URL: `import.meta.env.VITE_USER_SERVICE_URL` (default `http://localhost:8081`)
 * Set `VITE_USE_MOCK_AUTH=true` to use the in-memory mock (no backend).
 */

export class UserServiceError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {Record<string, unknown>=} meta
   */
  constructor(code, message, meta) {
    super(message);
    this.name = "UserServiceError";
    this.code = code;
    this.meta = meta;
  }
}

/**
 * @typedef {{ id: string, email: string, firstName?: string, lastName?: string }} User
 * @typedef {{ user: User, accessToken?: string | null }} AuthResult
 */

const STORAGE_KEY = "newproduct.auth.v1";

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(resolve, ms);
    const onAbort = () => {
      window.clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `u_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashLike(pw) {
  let h = 2166136261;
  const s = String(pw || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `h_${(h >>> 0).toString(16)}`;
}

/**
 * Maps backend `UserProfileResponseDto` to frontend `User` (uses `id` from `userId`).
 * @param {{ userId?: string, email?: string, firstName?: string, lastName?: string }} p
 * @returns {User}
 */
function mapProfileToUser(p) {
  const id = p?.userId ?? p?.id;
  if (!id || !p?.email) {
    throw new UserServiceError("invalid_response", "Unexpected user payload from server.");
  }
  return {
    id,
    email: String(p.email).trim().toLowerCase(),
    firstName: p.firstName || undefined,
    lastName: p.lastName || undefined,
  };
}

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.user?.id || !parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSession(auth) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: auth.user,
      accessToken: auth.accessToken ?? null,
    })
  );
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * @param {Response} res
 * @returns {Promise<Record<string, unknown> | null>}
 */
async function readJsonBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/**
 * @param {string} baseUrl
 * @param {string} path
 * @param {RequestInit} init
 */
async function fetchJson(baseUrl, path, init) {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await readJsonBody(res);
  return { res, body };
}

/**
 * @param {{ baseUrl: string }} opts
 */
export function createHttpUserService(opts) {
  const baseUrl = opts.baseUrl.replace(/\/$/, "");

  return {
    /**
     * @returns {Promise<User|null>}
     */
    async getCurrentUser() {
      const s = loadStoredSession();
      return s?.user ?? null;
    },

    /**
     * @param {{ email: string, password: string, signal?: AbortSignal }} input
     * @returns {Promise<AuthResult>}
     */
    async login(input) {
      const email = normalizeEmail(input?.email);
      const password = String(input?.password || "");
      if (!email) throw new UserServiceError("invalid_email", "Email is required.");
      if (!password) throw new UserServiceError("invalid_password", "Password is required.");

      const { res, body } = await fetchJson(baseUrl, "/api/auth/login", {
        method: "POST",
        signal: input?.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok && body?.user) {
        const user = mapProfileToUser(body.user);
        const accessToken = body.accessToken ?? null;
        const auth = { user, accessToken };
        saveSession(auth);
        return auth;
      }

      const msg =
        (body && typeof body.message === "string" && body.message) ||
        (res.status === 401 ? "Incorrect email or password." : "Login failed.");
      if (res.status === 401) {
        throw new UserServiceError("invalid_credentials", msg, { status: res.status });
      }
      throw new UserServiceError("request_failed", msg, { status: res.status, body });
    },

    /**
     * @param {{ email: string, password: string, firstName?: string, lastName?: string, signal?: AbortSignal }} input
     * @returns {Promise<AuthResult>}
     */
    async signup(input) {
      const email = normalizeEmail(input?.email);
      const password = String(input?.password || "");
      const firstName = String(input?.firstName || "").trim();
      const lastName = String(input?.lastName || "").trim();

      if (!email) throw new UserServiceError("invalid_email", "Email is required.");
      if (!password || password.length < 8) {
        throw new UserServiceError("weak_password", "Use at least 8 characters.");
      }
      if (!firstName) throw new UserServiceError("invalid_name", "First name is required.");
      if (!lastName) throw new UserServiceError("invalid_name", "Last name is required.");

      const { res, body } = await fetchJson(baseUrl, "/api/auth/signup", {
        method: "POST",
        signal: input?.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (res.ok && body?.user) {
        const user = mapProfileToUser(body.user);
        const accessToken = body.accessToken ?? null;
        const auth = { user, accessToken };
        saveSession(auth);
        return auth;
      }

      const msg =
        (body && typeof body.message === "string" && body.message) || "Sign up failed.";
      if (res.status === 409) {
        throw new UserServiceError("email_taken", msg, { status: res.status });
      }
      throw new UserServiceError("request_failed", msg, { status: res.status, body });
    },

    async logout() {
      await sleep(0);
      clearSession();
    },

    async requestPasswordReset(input) {
      const email = normalizeEmail(input?.email);
      if (!email) throw new UserServiceError("invalid_email", "Email is required.");
      await sleep(200, input?.signal);
    },
  };
}

/**
 * Mock implementation (offline / no backend).
 * @param {{ latencyMs?: [number, number], seedUser?: { email: string, password: string, firstName?: string, lastName?: string } }} [opts]
 */
export function createMockUserService(opts = {}) {
  const latencyMs = opts.latencyMs ?? [350, 900];

  /** @type {Map<string, { user: any, passwordHash: string }>} */
  const usersByEmail = new Map();

  /** @type {User|null} */
  let currentUser = null;

  const seed = opts.seedUser ?? {
    email: "demo@newproduct.dev",
    password: "Password123!",
    firstName: "Demo",
    lastName: "User",
  };

  const seedEmail = normalizeEmail(seed.email);
  usersByEmail.set(seedEmail, {
    user: { id: uuid(), email: seedEmail, firstName: seed.firstName, lastName: seed.lastName },
    passwordHash: hashLike(seed.password),
  });

  const randomLatency = () => {
    const [a, b] = latencyMs;
    return Math.floor(a + Math.random() * Math.max(0, b - a));
  };

  return {
    async getCurrentUser() {
      await sleep(Math.min(120, randomLatency()));
      return currentUser;
    },

    async login(input) {
      const email = normalizeEmail(input?.email);
      const password = String(input?.password || "");
      if (!email) throw new UserServiceError("invalid_email", "Email is required.");
      if (!password) throw new UserServiceError("invalid_password", "Password is required.");

      await sleep(randomLatency(), input?.signal);

      const record = usersByEmail.get(email);
      if (!record) throw new UserServiceError("invalid_credentials", "Incorrect email or password.");
      if (record.passwordHash !== hashLike(password)) {
        throw new UserServiceError("invalid_credentials", "Incorrect email or password.");
      }

      currentUser = record.user;
      return { user: record.user, accessToken: "mock_access_token" };
    },

    async signup(input) {
      const email = normalizeEmail(input?.email);
      const password = String(input?.password || "");
      if (!email) throw new UserServiceError("invalid_email", "Email is required.");
      if (!password || password.length < 8) {
        throw new UserServiceError("weak_password", "Use at least 8 characters.");
      }

      await sleep(randomLatency(), input?.signal);

      if (usersByEmail.has(email)) {
        throw new UserServiceError("email_taken", "That email is already in use.");
      }

      const user = {
        id: uuid(),
        email,
        firstName: String(input?.firstName || "").trim() || undefined,
        lastName: String(input?.lastName || "").trim() || undefined,
      };

      usersByEmail.set(email, { user, passwordHash: hashLike(password) });
      currentUser = user;
      return { user, accessToken: "mock_access_token" };
    },

    async logout() {
      await sleep(Math.min(120, randomLatency()));
      currentUser = null;
    },

    async requestPasswordReset(input) {
      const email = normalizeEmail(input?.email);
      if (!email) throw new UserServiceError("invalid_email", "Email is required.");
      await sleep(randomLatency(), input?.signal);
    },
  };
}

const useMock =
  String(import.meta.env.VITE_USE_MOCK_AUTH || "").toLowerCase() === "true" ||
  String(import.meta.env.VITE_USE_MOCK_AUTH || "") === "1";

const baseUrl = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:8081";

/**
 * Default service: HTTP to `user_service`, unless `VITE_USE_MOCK_AUTH` is enabled.
 */
export const userService = useMock ? createMockUserService() : createHttpUserService({ baseUrl });
