import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authenticateUser, getCurrentUser, logoutUser, registerUser } from "./authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setBootstrapped(true);
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: !!user,
      signUp: async ({ fullName, email, password }) => {
        const next = await registerUser({ fullName, email, password, persist: true });
        setUser(next || null);
        return next || null;
      },
      signIn: async ({ email, password, remember = true }) => {
        const next = await authenticateUser({ email, password, persist: !!remember });
        setUser(next || null);
        return next || null;
      },
      signOut: async () => {
        logoutUser();
        setUser(null);
      },
      bootstrapped,
    };
  }, [user, bootstrapped]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}

