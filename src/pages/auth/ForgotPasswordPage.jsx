import { useState } from "react";
import { Link } from "react-router-dom";

import {
  sendPasswordReset,
} from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      await sendPasswordReset(email);

      setSuccessMessage(
        "If an account exists for this email address, a password-reset link has been sent. Check your inbox and spam folder.",
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Unable to send the password-reset email.",
      );
    } finally {
      setSubmitting(false);
    }
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
          Account recovery
        </p>

        <h1 className="mt-2 text-3xl font-bold text-blue-950">
          Reset your password
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          Enter the email address associated
          with your account. We will send you a
          secure password-reset link.
        </p>

        {errorMessage && (
          <Message
            error
            message={errorMessage}
          />
        )}

        {successMessage && (
          <Message
            message={successMessage}
          />
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-7"
        >
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            placeholder="name@example.com"
            autoComplete="email"
            required
            disabled={submitting}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Sending reset link..."
              : "Send Password Reset Link"}
          </button>
        </form>

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