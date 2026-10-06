import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const [timedOut, setTimedOut] =
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

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        setTimedOut(true);
      }, 10000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (timedOut && !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-blue-950">
            Unable to confirm your account
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            The confirmation link may be
            invalid or expired. Return to sign
            in or request a new registration
            email.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="flex-1 rounded-lg border border-blue-900 px-5 py-3 font-semibold text-blue-900"
            >
              Return Home
            </Link>

            <Link
              to="/login"
              className="flex-1 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white"
            >
              Go to Sign In
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div
        role="status"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm"
      >
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-900" />

        <h1 className="mt-5 text-xl font-bold text-blue-950">
          Confirming your account
        </h1>

        <p className="mt-2 text-slate-600">
          Please wait while we securely verify
          your email address.
        </p>
      </div>
    </main>
  );
}