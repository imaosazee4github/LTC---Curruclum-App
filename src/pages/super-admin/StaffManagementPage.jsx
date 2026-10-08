import {
  BriefcaseBusiness,
  CheckCircle2,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useStaffManagement,
} from "../../hooks/useStaffManagement";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";

const initialForm = {
  profileId: "",
  role: "instructor",
  staffNumber: "",
  jobTitle: "",
  specialization: "",
  biography: "",
  availabilityStatus: "available",
};

const roleOptions = [
  {
    value: "instructor",
    label: "Instructor",
  },
  {
    value: "facilitator",
    label: "Facilitator",
  },
  {
    value: "coach",
    label: "Coach",
  },
  {
    value: "supervisor",
    label: "Supervisor",
  },
];

const availabilityOptions = [
  {
    value: "available",
    label: "Available",
  },
  {
    value: "limited",
    label: "Limited",
  },
  {
    value: "unavailable",
    label: "Unavailable",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
];

export default function StaffManagementPage() {
  const {
    staffSummary,
    staff,
    eligibleAccounts,
    staffManagementLoading,
    staffManagementFetching,
    staffManagementError,
    refreshStaffManagement,
    appointStaff,
    appointingStaff,
    appointStaffError,
    appointStaffResult,
    resetAppointStaff,
  } = useStaffManagement();

  const [form, setForm] =
    useState(initialForm);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [localError, setLocalError] =
    useState("");

  const filteredStaff =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (!search) {
        return staff;
      }

      return staff.filter((member) => {
        const searchableText = [
          member.full_name,
          member.email,
          member.role,
          member.staff_number,
          member.job_title,
          member.specialization,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          search,
        );
      });
    }, [searchTerm, staff]);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setLocalError("");
    resetAppointStaff();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLocalError("");
    resetAppointStaff();

    if (!form.profileId) {
      setLocalError(
        "Select an eligible account.",
      );
      return;
    }

    if (!form.role) {
      setLocalError(
        "Select a staff role.",
      );
      return;
    }

    try {
      await appointStaff(form);

      setForm(initialForm);
    } catch (error) {
      setLocalError(
        error.message ||
          "The staff appointment could not be completed.",
      );
    }
  }

  if (staffManagementLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading staff management..." />
      </SuperAdminLayout>
    );
  }

  if (
    staffManagementError ||
    !staffSummary
  ) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            staffManagementError?.message ||
            "Staff management data could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                System Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Staff Management
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Appoint instructors,
                facilitators, coaches and
                supervisors to support the
                Pioneer programme.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshStaffManagement()
              }
              disabled={
                staffManagementFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  staffManagementFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Staff"
              value={
                staffSummary.totalStaff
              }
              detail={`${staffSummary.activeStaff} operational`}
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Instructors"
              value={
                staffSummary.instructors
              }
              detail="Learning delivery"
              icon={BriefcaseBusiness}
              tone="green"
            />

            <SummaryCard
              label="Facilitators"
              value={
                staffSummary.facilitators
              }
              detail="Learning experiences"
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Coaches & Supervisors"
              value={
                staffSummary.coaches +
                staffSummary.supervisors
              }
              detail={`${staffSummary.availableStaff} staff available`}
              icon={CheckCircle2}
              tone="amber"
            />
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Appoint Staff"
                description="Convert an eligible new account into an operational staff account."
              />

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-5 md:p-6"
              >
                {appointStaffResult?.success ? (
                  <AlertMessage
                    success
                    message={
                      appointStaffResult.message ||
                      "The staff member was appointed successfully."
                    }
                  />
                ) : null}

                {localError ||
                appointStaffError ? (
                  <AlertMessage
                    message={
                      localError ||
                      appointStaffError
                        ?.message
                    }
                  />
                ) : null}

                <FormField
                  label="Eligible account"
                  required
                >
                  <select
                    name="profileId"
                    value={form.profileId}
                    onChange={handleChange}
                    disabled={
                      appointingStaff ||
                      eligibleAccounts.length ===
                        0
                    }
                    className={inputClasses}
                  >
                    <option value="">
                      Select an account
                    </option>

                    {eligibleAccounts.map(
                      (account) => (
                        <option
                          key={
                            account.profile_id
                          }
                          value={
                            account.profile_id
                          }
                        >
                          {account.full_name ||
                            account.email}
                          {account.full_name
                            ? ` — ${account.email}`
                            : ""}
                        </option>
                      ),
                    )}
                  </select>

                  {eligibleAccounts.length ===
                  0 ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      No eligible accounts are
                      currently available. Create
                      a new account and appoint it
                      before it initializes a
                      student profile.
                    </p>
                  ) : null}
                </FormField>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="Staff role"
                    required
                  >
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      disabled={
                        appointingStaff
                      }
                      className={
                        inputClasses
                      }
                    >
                      {roleOptions.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {option.label}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField label="Availability">
                    <select
                      name="availabilityStatus"
                      value={
                        form.availabilityStatus
                      }
                      onChange={handleChange}
                      disabled={
                        appointingStaff
                      }
                      className={
                        inputClasses
                      }
                    >
                      {availabilityOptions.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {option.label}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>
                </div>

                <FormField label="Staff number">
                  <input
                    type="text"
                    name="staffNumber"
                    value={
                      form.staffNumber
                    }
                    onChange={handleChange}
                    placeholder="Example: LTC-INS-001"
                    disabled={
                      appointingStaff
                    }
                    className={inputClasses}
                  />
                </FormField>

                <FormField label="Job title">
                  <input
                    type="text"
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleChange}
                    placeholder="Example: Digital Foundations Instructor"
                    disabled={
                      appointingStaff
                    }
                    className={inputClasses}
                  />
                </FormField>

                <FormField label="Specialization">
                  <input
                    type="text"
                    name="specialization"
                    value={
                      form.specialization
                    }
                    onChange={handleChange}
                    placeholder="Example: Digital literacy and workplace technology"
                    disabled={
                      appointingStaff
                    }
                    className={inputClasses}
                  />
                </FormField>

                <FormField label="Biography">
                  <textarea
                    name="biography"
                    value={form.biography}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add a short professional background."
                    disabled={
                      appointingStaff
                    }
                    className={inputClasses}
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={
                    appointingStaff ||
                    eligibleAccounts.length ===
                      0
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus className="h-5 w-5" />

                  {appointingStaff
                    ? "Appointing Staff..."
                    : "Appoint Staff Member"}
                </button>
              </form>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Operational Staff"
                description="Current staff appointments and availability."
              />

              <div className="border-b border-slate-200 p-5">
                <label className="relative block">
                  <span className="sr-only">
                    Search staff
                  </span>

                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value,
                      )
                    }
                    placeholder="Search by name, email, role or specialization"
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              {filteredStaff.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-4">
                          Staff Member
                        </th>

                        <th className="px-5 py-4">
                          Role
                        </th>

                        <th className="px-5 py-4">
                          Specialization
                        </th>

                        <th className="px-5 py-4">
                          Availability
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {filteredStaff.map(
                        (member) => (
                          <StaffRow
                            key={
                              member
                                .staff_profile_id
                            }
                            member={member}
                          />
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title={
                    searchTerm
                      ? "No matching staff"
                      : "No staff appointed"
                  }
                  description={
                    searchTerm
                      ? "Try a different search term."
                      : "Appointed instructors, facilitators, coaches and supervisors will appear here."
                  }
                />
              )}
            </section>
          </div>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

const inputClasses =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}) {
  const tones = {
    blue:
      "border-blue-200 bg-blue-50 text-blue-900",
    green:
      "border-green-200 bg-green-50 text-green-900",
    purple:
      "border-purple-200 bg-purple-50 text-purple-900",
    amber:
      "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <article
      className={`rounded-xl border p-5 shadow-sm ${
        tones[tone] ||
        tones.blue
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold">
            {value}
          </p>

          <p className="mt-2 text-xs opacity-75">
            {detail}
          </p>
        </div>

        <Icon className="h-6 w-6 opacity-75" />
      </div>
    </article>
  );
}

function StaffRow({ member }) {
  return (
    <tr className="align-top">
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900">
          {member.full_name ||
            "Name unavailable"}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {member.email}
        </p>

        {member.staff_number ? (
          <p className="mt-1 text-xs text-slate-400">
            {member.staff_number}
          </p>
        ) : null}
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          value={member.role}
        />

        {member.job_title ? (
          <p className="mt-2 max-w-[180px] text-sm text-slate-600">
            {member.job_title}
          </p>
        ) : null}
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {member.specialization ||
          "Not provided"}
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          value={
            member.availability_status
          }
        />

        <p className="mt-2 text-xs text-slate-500">
          Account:{" "}
          {formatLabel(
            member.account_status,
          )}
        </p>
      </td>
    </tr>
  );
}

function StatusBadge({ value }) {
  const normalized =
    value || "unknown";

  const positiveValues = [
    "available",
    "active",
  ];

  const warningValues = [
    "limited",
    "unavailable",
  ];

  const color = positiveValues.includes(
    normalized,
  )
    ? "bg-green-100 text-green-700"
    : warningValues.includes(normalized)
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {formatLabel(normalized)}
    </span>
  );
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      {required ? (
        <span className="ml-1 text-red-600">
          *
        </span>
      ) : null}

      {children}
    </label>
  );
}

function AlertMessage({
  message,
  success = false,
}) {
  const Icon = success
    ? CheckCircle2
    : XCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
        success
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />

      <p>{message}</p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}) {
  return (
    <header className="border-b border-slate-200 px-5 py-5">
      <h2 className="text-xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </header>
  );
}

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <Users className="mx-auto h-10 w-10 text-slate-300" />

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div
        role={error ? "alert" : "status"}
        className={`w-full max-w-lg rounded-xl border p-6 text-center shadow-sm ${
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

function formatLabel(value) {
  if (!value) {
    return "Not available";
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