import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

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

      navigate(
        "/login",
        {
          replace: true,
        },
      );
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

  /*
   * This is a temporary authentication
   * confirmation screen. We will replace it
   * with role-based dashboard redirection
   * when the dashboards are created.
   */
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
          ✓
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Authentication successful
        </p>

        <h1 className="mt-2 text-3xl font-bold text-blue-950">
          Welcome,{" "}
          {profile.full_name ||
            "LTC Portal User"}
        </h1>

        <p className="mt-4 text-slate-600">
          Your account has been successfully
          authenticated.
        </p>

        <div className="mt-7 rounded-lg bg-slate-50 p-5 text-left">
          <AccountDetail
            label="Email"
            value={profile.email}
          />

          <AccountDetail
            label="Role"
            value={formatRole(role)}
          />

          <AccountDetail
            label="Account status"
            value={formatRole(
              accountStatus,
            )}
          />
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-500">
          Your role-specific dashboard will be
          connected during the next development
          stage.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 rounded-lg border border-blue-900 px-5 py-3 font-semibold text-blue-900"
          >
            Return Home
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex-1 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white"
          >
            Sign Out
          </button>
        </div>
      </section>
    </main>
  );
}

function AccountDetail({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-3 last:border-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-800">
        {value || "Not available"}
      </span>
    </div>
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
        className={`max-w-lg rounded-lg border p-5 ${
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