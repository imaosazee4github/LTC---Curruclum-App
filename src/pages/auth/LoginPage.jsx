import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const ROLE_LABELS = {
  student: "Student",
  instructor: "Instructor",
  facilitator: "Facilitator",
  coach: "Coach",
  supervisor: "Supervisor / Project Coordinator",
  mentor: "Advisor",
  mentor_department: "Advisory Department",
  super_admin: "Super Admin",
  administrator: "Administrator",
  curriculum_admin: "Curriculum Admin",
  devotional_coordinator: "Devotional Coordinator",
};

export default function LoginPage() {
  const navigate = useNavigate();

  const {
    signIn,
    signOut,
    selectRole,
    availableRoles,
    activeRole,
    profile,
    accountStatus,
    isAuthenticated,
    loading,
    authError,
    clearAuthError,
  } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [selectedRole, setSelectedRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const roleChoice = availableRoles.includes(selectedRole)
    ? selectedRole
    : availableRoles.includes(activeRole)
      ? activeRole
      : availableRoles[0] || "";

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrorMessage("");
    clearAuthError();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSubmitting(true);

    try {
      await signIn({
        email: form.email,
        password: form.password,
      });

      setForm((current) => ({
        ...current,
        password: "",
      }));

      // Stay here while AuthContext loads the account's roles.
      // Navigation happens only after the user selects a role.
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to sign in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue(event) {
    event.preventDefault();
    setErrorMessage("");

    try {
      selectRole(roleChoice);
      navigate("/auth/redirect", { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleUseAnotherAccount() {
    setSubmitting(true);
    setErrorMessage("");

    try {
      await signOut();
      setSelectedRole("");
      setForm({ email: "", password: "" });
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to sign out.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const displayedError = errorMessage || authError;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden bg-blue-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white font-bold text-blue-950">
              LTC
            </div>

            <div>
              <p className="text-xl font-bold">Pioneer Portal</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Student Tracking System
              </p>
            </div>
          </Link>

          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
              Welcome back
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              One account. Access your programme roles.
            </h1>

            <p className="mt-5 leading-8 text-blue-100">
              Sign in and choose your role to access your learning,
              teaching, coaching, advisory or service responsibilities.
            </p>
          </div>

          <p className="text-sm text-blue-200">
            Light Training Center Nigeria
          </p>
        </section>

        <section className="flex items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-semibold text-blue-900 lg:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-950 text-sm text-white">
                LTC
              </span>
              Pioneer Portal
            </Link>

            <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-amber-600 lg:mt-0">
              Secure portal access
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-950">
              {isAuthenticated ? "Choose your role" : "Sign in to your account"}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              {isAuthenticated
                ? "Select the role you want to use for this session."
                : "Enter the email address and password associated with your LTC account."}
            </p>

            {displayedError && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {displayedError}
              </div>
            )}

            {loading ? (
              <p
                role="status"
                className="mt-8 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600"
              >
                Loading your account and available roles...
              </p>
            ) : isAuthenticated ? (
              <div className="mt-8">
                {profile && accountStatus === "active" ? (
                  availableRoles.length > 0 ? (
                    <form onSubmit={handleContinue} className="space-y-5">
                      <div className="rounded-lg bg-blue-50 p-4">
                        <p className="font-semibold text-blue-950">
                          {profile.full_name || "Your account"}
                        </p>
                        <p className="mt-1 break-words text-sm text-slate-600">
                          {profile.email}
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="login-role"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Continue as
                        </label>

                        <select
                          id="login-role"
                          value={roleChoice}
                          required
                          disabled={submitting}
                          onChange={(event) => {
                            setSelectedRole(event.target.value);
                            setErrorMessage("");
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                        >
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role] || role.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !roleChoice}
                        className="w-full rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
                      >
                        Open Dashboard
                      </button>
                    </form>
                  ) : (
                    <p role="alert" className="text-sm text-red-700">
                      No available roles were found for this account.
                    </p>
                  )
                ) : (
                  <p role="alert" className="text-sm text-red-700">
                    {!profile
                      ? "Your account profile could not be loaded."
                      : "Your account is not currently active. Contact an administrator."}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleUseAnotherAccount}
                  disabled={submitting}
                  className="mt-6 w-full rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
                >
                  {submitting ? "Signing out..." : "Sign out / Use another account"}
                </button>
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                >
                  <FormField
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    autoComplete="username"
                    disabled={submitting}
                  />

                  <FormField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={submitting}
                  />

                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-blue-900 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
                  >
                    {submitting ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Need an account?
                  </p>
                  <Link
                    to="/student/register"
                    className="mt-2 inline-block font-semibold text-blue-900 hover:underline"
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function FormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      />
    </div>
  );
}