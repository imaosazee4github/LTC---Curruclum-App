import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import {
  updatePassword,
} from "../../services/authService";

export default function ResetPasswordPage() {
  const {
    isAuthenticated,
    loading,
    signOut,
  } = useAuth();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (form.password.length < 8) {
      setErrorMessage(
        "Your new password must contain at least 8 characters.",
      );

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setErrorMessage(
        "The passwords do not match.",
      );

      return;
    }

    setSubmitting(true);

    try {
      await updatePassword(
        form.password,
      );

      /*
       * End the password-recovery session so
       * the user can sign in normally with the
       * new password.
       */
      await signOut();

      setForm({
        password: "",
        confirmPassword: "",
      });

      setSuccessMessage(
        "Your password has been updated successfully. You can now sign in with your new password.",
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Unable to update your password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageMessage message="Verifying your password-reset link..." />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-950 text-sm font-bold text-white">
            LTC
          </div>

          <div>
            <p className="font-bold text-blue-950">
              Pioneer Portal
            </p>

            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Student Tracking System
            </p>
          </div>
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Secure account recovery
        </p>

        <h1 className="mt-2 text-3xl font-bold text-blue-950">
          Create a new password
        </h1>

        {errorMessage && (
          <Message
            error
            message={errorMessage}
          />
        )}

        {successMessage && (
          <>
            <Message
              message={successMessage}
            />

            <Link
              to="/login"
              className="mt-6 block w-full rounded-lg bg-blue-950 px-5 py-3 text-center font-semibold text-white"
            >
              Continue to Sign In
            </Link>
          </>
        )}

        {!successMessage &&
          !isAuthenticated && (
            <div className="mt-6">
              <Message
                error
                message="This password-reset link is invalid or has expired. Request a new link and try again."
              />

              <Link
                to="/forgot-password"
                className="mt-5 block text-center font-semibold text-blue-900 hover:underline"
              >
                Request another reset link
              </Link>
            </div>
          )}

        {!successMessage &&
          isAuthenticated && (
            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <PasswordField
                label="New password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

              <PasswordField
                label="Confirm new password"
                name="confirmPassword"
                value={
                  form.confirmPassword
                }
                onChange={handleChange}
                autoComplete="new-password"
              />

              <p className="text-sm text-slate-500">
                Your password must contain at
                least 8 characters.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Updating password..."
                  : "Update Password"}
              </button>
            </form>
          )}

        <div className="mt-7 text-center">
          <Link
            to="/login"
            className="font-semibold text-blue-900 hover:underline"
          >
            Return to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  autoComplete,
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
        type="password"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        minLength={8}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Message({
  message,
  error = false,
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mt-6 rounded-lg border p-4 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      {message}
    </div>
  );
}

function PageMessage({ message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div
        role="status"
        className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm"
      >
        {message}
      </div>
    </main>
  );
}