// src/components/RequireRegistration.tsx
import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { useAuth } from "../../src/context/AuthContext";

export const RequireRegistration = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const { loading, employee } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (employee && employee.registrationComplete === false) {
    return <Navigate to="/register" replace />;
  }

  return children;
};
