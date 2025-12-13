import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isLoggedIn } from "../lib/auth";
import type { JSX } from "react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isLoggedIn()) return <Navigate to="/login" />;

  return children;
};
