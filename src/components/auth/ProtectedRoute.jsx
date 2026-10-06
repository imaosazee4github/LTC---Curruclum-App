import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const location = useLocation();

  const {
    isAuthenticated,
    profile,
    role,
    accountStatus,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <PageMessage message="Checking your account..." />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (!profile) {
    return (
      <PageMessage
        error
        message="Your account profile could not be loaded. Sign out and try again, or contact an administrator."
      />
    );
  }

  if (accountStatus !== "active") {
    return (
      <PageMessage
        error
        message="Your account is not currently active. Contact an administrator for assistance."
      />
    );
  }

  const roleRestricted =
    allowedRoles.length > 0;

  const hasRequiredRole =
    !roleRestricted ||
    allowedRoles.includes(role);

  if (!hasRequiredRole) {
    return (
      <Navigate
        to="/auth/redirect"
        replace
      />
    );
  }

  return children;
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div
        role={error ? "alert" : "status"}
        className={`w-full max-w-lg rounded-xl border p-6 text-center shadow-sm ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        {message}
      </div>
    </main>
  );
}