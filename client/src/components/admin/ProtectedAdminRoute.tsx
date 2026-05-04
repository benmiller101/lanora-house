import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    const password = localStorage.getItem('adminPassword');

    if (!email || !password) {
      // No credentials stored — go to login (client-side, no page reload)
      setChecked(true);
      setAllowed(false);
      setLocation("/admin-login");
      return;
    }

    // Verify credentials server-side
    fetch("/api/admin/check-auth", {
      credentials: "include",
      headers: {
        "x-admin-email": email,
        "x-admin-password": password,
      },
    })
      .then((res) => {
        if (res.ok) {
          setAllowed(true);
        } else {
          localStorage.removeItem('adminEmail');
          localStorage.removeItem('adminPassword');
          localStorage.removeItem('user');
          setLocation("/admin-login");
        }
      })
      .catch(() => {
        // Network error — allow optimistically (APIs will enforce auth)
        setAllowed(true);
      })
      .finally(() => setChecked(true));
  }, [setLocation]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin...</p>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
