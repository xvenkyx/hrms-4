import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const CLIENT_ID = "3pvv77hqh5608o5m7t1gdq93jg";
  const DOMAIN = "v4-hrms-auth.auth.us-east-1.amazoncognito.com";
  const REDIRECT = window.location.origin;

  const loginUrl = `https://${DOMAIN}/login?client_id=${CLIENT_ID}&response_type=token&scope=email+openid+profile&redirect_uri=${REDIRECT}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = loginUrl;
    }, 600); // small delay so UI renders nicely

    return () => clearTimeout(timer);
  }, [loginUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="pt-8 pb-10 flex flex-col items-center text-center gap-6">
          {/* Logo */}
          <img
            src="/image.png"
            alt="HRMS Logo"
            className="h-14 w-14 object-contain"
          />

          {/* App Name */}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">
              HRMS Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Secure employee management system
            </p>
          </div>

          {/* Loader */}
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">
              Signing you in securely…
            </span>
          </div>

          {/* Footer hint */}
          <p className="text-xs text-muted-foreground">
            You’ll be redirected automatically
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
