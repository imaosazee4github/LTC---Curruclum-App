import { useState } from "react";

import {
  Link,
  Navigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function StudentRegistrationPage() {
  const {
    registerStudent,
    isAuthenticated,
    loading,
    clearAuthError,
  } = useAuth();

  const [form, setForm] =
    useState(initialForm);

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
    clearAuthError();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const fullName =
      form.fullName.trim();

    const email =
      form.email.trim();

    if (!fullName) {
      setErrorMessage(
        "Enter your full name.",
      );

      return;
    }

    if (
      !form.password ||
      form.password.length < 8
    ) {
      setErrorMessage(
        "Your password must contain at least 8 characters.",
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
      await registerStudent({
        fullName,
        email,
        password: form.password,
      });

      setForm(initialForm);

      setSuccessMessage(
        "Your student account has been created. Check your email and select the confirmation link before signing in.",
      );
    } catch (error) {
      setErrorMessage(
        getRegistrationError(
          error.message,
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && isAuthenticated) {
    return (
      <Navigate
        to="/auth/redirect"
        replace
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden bg-blue-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white font-bold text-blue-950">
              LTC
            </div>

            <div>
              <p className="text-xl font-bold">
                Pioneer Portal
              </p>

              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Student Tracking System
              </p>
            </div>
          </Link>

          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
              Pioneer student access
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Begin your learning and
              development journey.
            </h1>

            <p className="mt-5 leading-8 text-blue-100">
              Create your student account to
              access your schedule, learning
              activities, reflections,
              development records and assigned
              support.
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
              Student registration
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-950">
              Create your account
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Register using an email address
              you can access. You must confirm
              the email before signing in.
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

            {!successMessage && (
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                <FormField
                  label="Full name"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={submitting}
                />

                <FormField
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  autoComplete="email"
                  disabled={submitting}
                />

                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={submitting}
                  minLength={8}
                />

                <FormField
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  value={
                    form.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Enter the password again"
                  autoComplete="new-password"
                  disabled={submitting}
                  minLength={8}
                />

                <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                  <input
                    type="checkbox"
                    required
                    disabled={submitting}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />

                  <span>
                    I confirm that the
                    information provided is
                    accurate and belongs to me.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={
                    submitting || loading
                  }
                  className="w-full rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Creating account..."
                    : "Create Student Account"}
                </button>
              </form>
            )}

            <div className="mt-7 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?
              </p>

              <Link
                to="/login"
                className="mt-2 inline-block font-semibold text-blue-900 hover:underline"
              >
                Sign in to the portal
              </Link>
            </div>

            <p className="mt-7 text-center text-xs leading-5 text-slate-500">
              This registration page is for
              Pioneer students only. Staff
              accounts are assigned by an
              authorized administrator.
            </p>
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
  minLength,
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
        minLength={minLength}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
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
      className={`mt-6 rounded-lg border p-4 text-sm leading-6 ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      {message}
    </div>
  );
}

function getRegistrationError(message) {
  const normalizedMessage =
    message?.toLowerCase() || "";

  if (
    normalizedMessage.includes(
      "already registered",
    )
  ) {
    return "An account already exists for this email address. Sign in or reset your password.";
  }

  if (
    normalizedMessage.includes(
      "password",
    )
  ) {
    return message;
  }

  if (
    normalizedMessage.includes(
      "rate limit",
    )
  ) {
    return "Too many registration emails have been requested. Wait a few minutes and try again.";
  }

  return (
    message ||
    "Unable to create your account. Please try again."
  );
}