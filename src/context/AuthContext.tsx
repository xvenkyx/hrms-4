// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { decodeToken, getToken, saveToken } from "../lib/auth";

interface EmployeeProfile {
  employeeID?: string;
  email?: string;
  registrationComplete?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  loading: boolean;
  employee: EmployeeProfile | null;
  token: string | null;
  roles: string[];
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
  employee: null,
  token: null,
  roles: [],
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(getToken());
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // PHASE 1: Read token from Cognito redirect
  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("id_token")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const t = params.get("id_token");

      if (t) {
        saveToken(t);
        setToken(t);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  // PHASE 2: Decode roles
  useEffect(() => {
    if (!token) {
      setRoles([]);
      return;
    }

    try {
      const decoded: any = decodeToken(token);
      setRoles(decoded["cognito:groups"] || []);
    } catch (err) {
      console.error("Token decode failed:", err);
      setRoles([]);
    }
  }, [token]);

  // PHASE 3: Fetch profile
  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/profile/me");
        setEmployee(res.data);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  return (
    <AuthContext.Provider value={{ loading, employee, token, roles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
