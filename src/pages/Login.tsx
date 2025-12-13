export default function Login() {
  const CLIENT_ID = "3pvv77hqh5608o5m7t1gdq93jg";
  const DOMAIN = "v4-hrms-auth.auth.us-east-1.amazoncognito.com";
  const REDIRECT = window.location.origin;

  const loginUrl = `https://${DOMAIN}/login?client_id=${CLIENT_ID}&response_type=token&scope=email+openid+profile&redirect_uri=${REDIRECT}`;

  window.location.href = loginUrl;

  return <div>Redirecting to login...</div>;
}
