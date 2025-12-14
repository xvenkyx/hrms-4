// src/components/RequireRegistration.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext.tsx";
import type { JSX } from "react";

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
