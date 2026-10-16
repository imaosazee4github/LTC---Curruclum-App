import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "instructor", label: "Instructor" },
  { value: "facilitator", label: "Facilitator" },
  { value: "coach", label: "Coach" },
  { value: "project_coordinator", label: "Project Coordinator" },
  { value: "site_supervisor", label: "Site Supervisor" },
  { value: "mentor", label: "Mentor" },
  { value: "mentor_department", label: "Mentor Department" },
];

const EDUCATOR_ROLES = ["instructor", "facilitator", "coach"];

const initialForm = {
  fullName: "",
  email: "",
  primaryRole: "",
  additionalRoles: [],
  password: "",
  confirmPassword: "",
};

export default function StudentRegistrationPage() {
  const { registerStudent, isAuthenticated, loading, clearAuthError, signOut } =
    useAuth();

  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Keeps the signup result visible if authentication changes mid-request.
  // const registrationStarted = useRef(false);
  // Keeps the signup result visible if authentication changes mid-request.
  const [registrationStarted, setRegistrationStarted] = useState(false);

  const isEducator = EDUCATOR_ROLES.includes(form.primaryRole);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "primaryRole" ? { additionalRoles: [] } : {}),
    }));

    setErrorMessage("");
    clearAuthError();
  }

  function toggleAdditionalRole(role) {
    setForm((current) => ({
      ...current,
      additionalRoles: current.additionalRoles.includes(role)
        ? current.additionalRoles.filter((item) => item !== role)
        : [...current.additionalRoles, role],
    }));

    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    clearAuthError();

    if (!form.fullName.trim()) {
      setErrorMessage("Enter your full name.");
      return;
    }

    if (!ROLE_OPTIONS.some((role) => role.value === form.primaryRole)) {
      setErrorMessage("Select your role.");
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    const requestedRoles = [
      form.primaryRole,
      ...(isEducator ? form.additionalRoles : []),
    ];

    // registrationStarted.current = true;
    setRegistrationStarted(true);
    setSubmitting(true);

    try {
      await registerStudent({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        requestedRoles,
      });

      setSuccess(true);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(error.message || "Unable to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    setErrorMessage("");

    try {
      await signOut();
      setSuccess(false);
      // registrationStarted.current = false;
      setRegistrationStarted(false);
    } catch (error) {
      setErrorMessage(error.message || "Unable to sign out. Please try again.");
    } finally {
      setLeaving(false);
    }
  }

  if (!loading && isAuthenticated && !registrationStarted && !success) {
    return <Navigate to="/auth/redirect" replace />;
  }

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
              Programme registration
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Join the Pioneer learning community.
            </h1>

            <p className="mt-5 leading-8 text-blue-100">
              Create one account for your programme responsibilities. Select
              your role and submit your registration for administrator approval.
            </p>
          </div>

          <p className="text-sm text-blue-200">Light Training Center Nigeria</p>
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
              Account registration
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-950">
              {success ? "Registration submitted" : "Create your account"}
            </h2>

            {errorMessage && (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {errorMessage}
              </div>
            )}

            {success ? (
              <div className="mt-6">
                <div
                  role="status"
                  className="rounded-xl border border-amber-200 bg-amber-50 p-6"
                >
                  <h3 className="text-lg font-bold text-amber-900">
                    Awaiting admin approval
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-amber-800">
                    Your registration has been submitted. An administrator will
                    review your account and requested roles before you can
                    access the portal.
                  </p>

                  <p className="mt-3 text-sm leading-7 text-amber-800">
                    No email confirmation is required. Once approved, sign in
                    using your email and password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={leaving || loading}
                  className="mt-6 w-full rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {leaving ? "Please wait..." : "Finish"}
                </button>
              </div>
            ) : (
              <>
                <p className="mt-3 leading-7 text-slate-600">
                  Select your role below. All new accounts require administrator
                  approval.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <FormField
                    label="Full name"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                    disabled={submitting || loading}
                  />

                  <FormField
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={submitting || loading}
                  />

                  <div>
                    <label
                      htmlFor="primaryRole"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Requested role
                    </label>

                    <select
                      id="primaryRole"
                      name="primaryRole"
                      value={form.primaryRole}
                      onChange={handleChange}
                      required
                      disabled={submitting || loading}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    >
                      <option value="">Select your role</option>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isEducator && (
                    <fieldset className="rounded-lg border border-slate-200 bg-white p-4">
                      <legend className="px-1 text-sm font-semibold text-slate-700">
                        Additional educator roles
                      </legend>

                      <p className="mb-3 text-xs leading-6 text-slate-500">
                        Select any other roles you also perform.
                      </p>

                      <div className="space-y-3">
                        {ROLE_OPTIONS.filter(
                          (role) =>
                            EDUCATOR_ROLES.includes(role.value) &&
                            role.value !== form.primaryRole,
                        ).map((role) => (
                          <label
                            key={role.value}
                            className="flex items-center gap-3 text-sm text-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={form.additionalRoles.includes(
                                role.value,
                              )}
                              onChange={() => toggleAdditionalRole(role.value)}
                              disabled={submitting || loading}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            {role.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  <FormField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={submitting || loading}
                    minLength={8}
                  />

                  <FormField
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={submitting || loading}
                    minLength={8}
                  />

                  <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <input
                      type="checkbox"
                      required
                      disabled={submitting || loading}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span>
                      I confirm that this information is accurate and the
                      selected roles reflect my programme responsibilities.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="w-full rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
                  >
                    {submitting
                      ? "Submitting registration..."
                      : "Submit Registration"}
                  </button>
                </form>

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
        autoComplete={autoComplete}
        required
        disabled={disabled}
        minLength={minLength}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      />
    </div>
  );
}
