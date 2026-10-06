import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();

  const {
    signIn,
    isAuthenticated,
    loading,
    clearAuthError,
  } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(
        "/auth/redirect",
        {
          replace: true,
        },
      );
    }
  }, [
    loading,
    isAuthenticated,
    navigate,
  ]);

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
    setSubmitting(true);

    try {
      await signIn({
        email: form.email,
        password: form.password,
      });

      navigate(
        "/auth/redirect",
        {
          replace: true,
        },
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Unable to sign in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
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
              Welcome back
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Continue supporting learning,
              development and readiness.
            </h1>

            <p className="mt-5 leading-8 text-blue-100">
              Access your assigned activities,
              reports, reflections, mentoring
              responsibilities and student
              development records.
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
              Sign in to your account
            </h2>

            <p className="mt-3 text-slate-600">
              Enter the email address and
              password associated with your
              LTC account.
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            )}

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
                autoComplete="email"
              />

              <FormField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-blue-900 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={
                  submitting || loading
                }
                className="w-full rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-600">
                Are you an admitted Pioneer
                student?
              </p>

              <Link
                to="/student/register"
                className="mt-2 inline-block font-semibold text-blue-900 hover:underline"
              >
                Create your student account
              </Link>
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-slate-500">
              Instructor, mentor and staff
              accounts are created or assigned
              by an authorized administrator.
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
        disabled={false}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}