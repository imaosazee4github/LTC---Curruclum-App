import { useState } from "react";
import { RefreshCw, UserRoundCog } from "lucide-react";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import { useSupervisorAppointments } from "../../hooks/useSupervisorAppointments";

const initialForm = {
  profileId: "",
  supervisorType: "",
};

const responsibilityLabels = {
  service_coordinator: "Service Coordinator",
  site_supervisor: "Site Supervisor",
};

const inputClasses =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

export default function StaffAllocationsPage() {
  const {
    supervisors,
    accounts,
    loading,
    fetching,
    error,
    refresh,
    saveAppointment,
    saving,
    resetAppointment,
  } = useSupervisorAppointments();

  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
    setSaveError("");
    resetAppointment();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setSuccess("");
    setSaveError("");

    if (!form.profileId || !form.supervisorType) {
      setSaveError("Select an account and supervisor responsibility.");
      return;
    }

    try {
      await saveAppointment(form);
      setSuccess("The supervisor appointment was saved.");
      setForm({ ...initialForm });
    } catch (appointmentError) {
      setSaveError(
        appointmentError.message || "The appointment could not be saved.",
      );
    }
  }

  const filteredSupervisors = supervisors.filter((member) => {
    const searchableText = [
      member.full_name,
      member.email,
      responsibilityLabels[member.supervisor_type],
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.trim().toLowerCase());
  });

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                System Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Supervisor Appointments
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Appoint Service Coordinators and Site Supervisors.
                Service Coordinators manage project assignments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refresh()}
              disabled={fetching}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-blue-950 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={fetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {loading ? (
            <p role="status" className="mt-8 text-slate-500">
              Loading supervisor appointments...
            </p>
          ) : error ? (
            <p
              role="alert"
              className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
            >
              {error.message || "Appointments could not be loaded."}
            </p>
          ) : (
            <div className="mt-8 grid items-start gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-blue-950">
                  Appoint Supervisor
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-5"
                >
                  {success && (
                    <p
                      role="status"
                      className="rounded-lg bg-green-50 p-4 text-sm text-green-800"
                    >
                      {success}
                    </p>
                  )}

                  {saveError && (
                    <p
                      role="alert"
                      className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
                    >
                      {saveError}
                    </p>
                  )}

                  <label className="block text-sm font-semibold text-slate-700">
                    Registered account
                    <select
                      name="profileId"
                      value={form.profileId}
                      onChange={handleChange}
                      required
                      disabled={saving || accounts.length === 0}
                      className={inputClasses}
                    >
                      <option value="">Select an account</option>

                      {accounts.map((account) => (
                        <option
                          key={account.profile_id}
                          value={account.profile_id}
                        >
                          {account.full_name || account.email}
                          {account.full_name && account.email
                            ? ` — ${account.email}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Responsibility
                    <select
                      name="supervisorType"
                      value={form.supervisorType}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      className={inputClasses}
                    >
                      <option value="">Select responsibility</option>
                      <option value="service_coordinator">
                        Service Coordinator
                      </option>
                      <option value="site_supervisor">
                        Site Supervisor
                      </option>
                    </select>
                  </label>

                  <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {form.supervisorType === "service_coordinator"
                      ? "Coordinates service projects, schedules and project assignments."
                      : form.supervisorType === "site_supervisor"
                        ? "Supervises assigned service activities and records student participation and reports."
                        : "Choose the responsibility this supervisor will hold."}
                  </div>

                  {accounts.length === 0 && (
                    <p className="text-sm text-amber-700">
                      No eligible accounts were returned.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={saving || accounts.length === 0}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    <UserRoundCog size={19} aria-hidden="true" />
                    {saving ? "Saving..." : "Save Appointment"}
                  </button>
                </form>
              </section>

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-blue-950">
                    Appointed Supervisors
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {supervisors.length} supervisor accounts
                  </p>

                  <label className="mt-5 block">
                    <span className="sr-only">Search supervisors</span>
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name, email or responsibility"
                      className={inputClasses}
                    />
                  </label>
                </div>

                {filteredSupervisors.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th scope="col" className="px-6 py-4">
                            Staff Member
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Responsibility
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200">
                        {filteredSupervisors.map((member) => (
                          <tr key={member.staff_profile_id}>
                            <td className="px-6 py-5">
                              <p className="font-semibold text-slate-900">
                                {member.full_name || "Name unavailable"}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {member.email}
                              </p>
                            </td>

                            <td className="px-6 py-5 text-sm font-medium text-blue-950">
                              {responsibilityLabels[
                                member.supervisor_type
                              ] || "Not specified"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="p-10 text-center text-sm text-slate-500">
                    {search
                      ? "No matching supervisors."
                      : "No supervisors appointed yet."}
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </SuperAdminLayout>
  );
}