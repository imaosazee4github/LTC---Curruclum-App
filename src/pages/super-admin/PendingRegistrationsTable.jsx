import { useState } from "react";

import { usePendingRegistrations } from "../../hooks/usePendingRegistrations";

const ROLE_LABELS = {
  student: "Student",
  instructor: "Instructor",
  facilitator: "Facilitator",
  coach: "Coach",
  project_coordinator: "Project Coordinator",
  site_supervisor: "Site Supervisor",
  mentor: "Mentor",
  mentor_department: "Mentor Department",
};

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function PendingRegistrationsTable() {
  const {
    registrations,
    registrationsLoading,
    registrationsFetching,
    registrationsError,
    refreshRegistrations,
    approveRegistration,
    approving,
    approvingProfileId,
  } = usePendingRegistrations();

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);

  const term = search.trim().toLowerCase();

  const filteredRegistrations = registrations.filter((registration) =>
    [registration.full_name, registration.email].some((value) =>
      String(value || "").toLowerCase().includes(term),
    ),
  );

  async function handleApprove(registration) {
    if (approving) return;

    setMessage(null);

    try {
      await approveRegistration(registration.id);

      setMessage({
        error: false,
        text: `${registration.full_name || registration.email} has been approved.`,
      });
    } catch (error) {
      setMessage({
        error: true,
        text: error.message || "The registration could not be approved.",
      });
    }
  }

  return (
    <section
      aria-labelledby="pending-registrations-title"
      className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
        <div>
          <div className="flex items-center gap-3">
            <h2
              id="pending-registrations-title"
              className="text-lg font-bold text-slate-950"
            >
              Pending Registrations
            </h2>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              {registrations.length}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review each person’s requested roles before approving
            access. Approval activates all roles listed for that person.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refreshRegistrations()}
          disabled={registrationsFetching || approving}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {registrationsFetching ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div className="border-b border-slate-200 p-5">
        <label
          htmlFor="registration-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Search registrations
        </label>

        <input
          id="registration-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 md:max-w-md"
        />
      </div>

      {message && (
        <div
          role={message.error ? "alert" : "status"}
          className={`border-b p-5 text-sm ${
            message.error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {registrationsError && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          {registrationsError.message ||
            "Pending registrations could not be loaded."}
        </div>
      )}

      {registrationsLoading ? (
        <p role="status" className="p-10 text-center text-slate-500">
          Loading registrations...
        </p>
      ) : filteredRegistrations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <caption className="sr-only">
              Pending account registrations and requested roles
            </caption>

            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-4">
                  User
                </th>
                <th scope="col" className="px-5 py-4">
                  Requested Roles
                </th>
                <th scope="col" className="px-5 py-4">
                  Registered · WAT
                </th>
                <th scope="col" className="px-5 py-4">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRegistrations.map((registration) => {
                const roles = Array.isArray(registration.requested_roles)
                  ? registration.requested_roles
                  : [];

                return (
                  <tr
                    key={registration.id}
                    className="align-top hover:bg-slate-50"
                  >
                    <td className="px-5 py-5">
                      <p className="font-semibold text-slate-900">
                        {registration.full_name || "Name not provided"}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {registration.email}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex max-w-sm flex-wrap gap-2">
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800"
                            >
                              {ROLE_LABELS[role] ||
                                String(role).replaceAll("_", " ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-red-700">
                            No roles requested
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-5 text-slate-600">
                      {formatDate(registration.created_at)}
                    </td>

                    <td className="px-5 py-5">
                      <button
                        type="button"
                        onClick={() => handleApprove(registration)}
                        disabled={approving || roles.length === 0}
                        aria-label={`Approve registration for ${
                          registration.full_name || registration.email
                        }`}
                        className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {approvingProfileId === registration.id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : !registrationsError ? (
        <div className="p-10 text-center">
          <h3 className="font-semibold text-slate-800">
            {registrations.length
              ? "No matching registrations"
              : "No pending registrations"}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {registrations.length
              ? "Try a different name or email."
              : "New registrations awaiting approval will appear here."}
          </p>
        </div>
      ) : null}
    </section>
  );
}