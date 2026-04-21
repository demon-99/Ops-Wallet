import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UserServiceError, userService as defaultUserService } from "../services/userService.js";

const AuthContext = createContext(null);

export function AuthProvider({ service = defaultUserService, children }) {
  // Start in "loading" so UI can gate itself until we've checked for a
  // cached session. Without this, the initial render has status "idle" +
  // user null, so the auth page flashes its form before we redirect a
  // returning user to the dashboard.
  const [status, setStatus] = useState("loading"); // loading | idle | authed
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("[auth] checking stored session…");
    }
    service
      .getCurrentUser?.()
      .then((u) => {
        if (!mounted) return;
        setUser(u ?? null);
        setStatus(u ? "authed" : "idle");
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log("[auth] session check resolved:", u ? `authed as ${u.email}` : "no session");
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setUser(null);
        setStatus("idle");
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("[auth] session check failed:", err);
        }
      });
    return () => {
      mounted = false;
    };
  }, [service]);

  const api = useMemo(() => {
    return {
      status,
      user,
      isAuthenticated: !!user,

      async login(input) {
        setStatus("loading");
        try {
          const res = await service.login(input);
          setUser(res.user);
          setStatus("authed");
          return res;
        } catch (e) {
          setUser(null);
          setStatus("idle");
          throw e;
        }
      },

      async signup(input) {
        setStatus("loading");
        try {
          const res = await service.signup(input);
          setUser(res.user);
          setStatus("authed");
          return res;
        } catch (e) {
          setUser(null);
          setStatus("idle");
          throw e;
        }
      },

      async logout() {
        setStatus("loading");
        try {
          await service.logout();
        } finally {
          setUser(null);
          setStatus("idle");
        }
      },

      async requestPasswordReset(input) {
        return service.requestPasswordReset(input);
      },
    };
  }, [service, status, user]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}

export function isUserServiceError(err) {
  return err instanceof UserServiceError || err?.name === "UserServiceError";
}

