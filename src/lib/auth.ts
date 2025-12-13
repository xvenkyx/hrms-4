// src/lib/auth.ts
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "v4_id_token";

export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// src/lib/auth.ts
// src/lib/auth.ts
export const logout = () => {
  localStorage.removeItem("v4_id_token");

  const CLIENT_ID = "3pvv77hqh5608o5m7t1gdq93jg";
  const DOMAIN = "v4-hrms-auth.auth.us-east-1.amazoncognito.com";

  // Use ONLY root because that is allowed in Cognito settings
  const REDIRECT = window.location.origin;

  const url = `https://${DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(
    REDIRECT
  )}`;

  window.location.href = url;
};

export const decodeToken = (t: any) => {
  const token2 = t
  console.log(token2)
  const token = getToken();
  if (!token) return null;
  return jwtDecode<any>(token);
};

export const isLoggedIn = () => !!getToken();
