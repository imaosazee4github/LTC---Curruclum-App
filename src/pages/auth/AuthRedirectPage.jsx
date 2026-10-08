import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const roleDashboardPaths = {
  student:
    "/student/dashboard",

  mentor_department:
    "/mentor-department/dashboard",

  mentor:
    "/mentor/dashboard",
  super_admin:
    "/super-admin/dashboard",

};

export default function AuthRedirectPage() {
  const navigate = useNavigate();

  const {
    profile,
    role,
    accountStatus,
    isAuthenticated,
    loading,
    signOut,
  } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Sign out failed:",
        error,
      );
    }
  }

  if (loading) {
    return (
      <PageMessage message="Loading your account..." />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!profile) {
    return (
      <PageMessage
        error
        message="Your account was authenticated, but its profile could not be loaded."
      />
    );
  }

  if (accountStatus !== "active") {
    return (
      <PageMessage
        error
        message="Your account is not currently active. Contact an administrator."
      />
    );
  }

  const dashboardPath =
    roleDashboardPaths[role];

  if (dashboardPath) {
    return (
      <Navigate
        to={dashboardPath}
        replace
      />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-lg rounded-xl border border-amber-200 bg-white p-7 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-blue-950">
          Dashboard unavailable
        </h1>

        <p className="mt-3 leading-6 text-slate-600">
          Your account is active, but a dashboard
          has not been configured for the role{" "}
          <strong>
            {formatRole(role) ||
              "Unknown"}
          </strong>
          .
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 rounded-lg bg-blue-950 px-6 py-3 font-semibold text-white"
        >
          Sign Out
        </button>
      </section>
    </main>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div
        role={error ? "alert" : "status"}
        className={`w-full max-w-lg rounded-lg border p-5 text-center ${
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

function formatRole(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}