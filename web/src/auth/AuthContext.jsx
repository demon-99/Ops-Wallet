import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UserServiceError, userService as defaultUserService } from "../services/userService.js";

const AuthContext = createContext(null);

export function AuthProvider({ service = defaultUserService, children }) {
  const [status, setStatus] = useState("idle"); // idle | loading | authed
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    service
      .getCurrentUser?.()
      .then((u) => {
        if (!mounted) return;
        setUser(u ?? null);
        setStatus(u ? "authed" : "idle");
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setStatus("idle");
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

