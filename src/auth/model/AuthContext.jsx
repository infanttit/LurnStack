import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authenticateUser, getCurrentUser, logoutUser, registerUser } from "./authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: !!user,
      signUp: async ({ fullName, email, password }) => {
        const next = registerUser({ fullName, email, password });
        setUser(next);
        return next;
      },
      signIn: async ({ email, password }) => {
        const next = authenticateUser({ email, password });
        setUser(next);
        return next;
      },
      signOut: async () => {
        logoutUser();
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}

