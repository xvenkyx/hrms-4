import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { loading, roles } = useAuth();

  if (loading) return <div>Loading...</div>;

  const isAdmin = roles.includes("v4-admin") || roles.includes("v4-hr");

  if (!isAdmin) return <Navigate to="/" />;

  return children;
};
