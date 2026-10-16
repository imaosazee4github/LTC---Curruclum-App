import { useMemo, useState } from "react";

import {
  BriefcaseBusiness,
  CheckCircle2,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import { useStaffManagement } from "../../hooks/useStaffManagement";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";

const initialForm = {
  profileId: "",
  role: "instructor",
  classId: "",
  supervisorType: "",
  specialization: "",
  biography: "",
};

const roleOptions = [
  { value: "instructor", label: "Instructor" },
  { value: "facilitator", label: "Facilitator" },
  { value: "coach", label: "Coach" }
];

const inputClasses =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

export default function StaffManagementPage() {
  const {
    staffSummary,
    staff,
    eligibleAccounts,
    courseClasses = [],
    classAllocations = [],
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

  const [form, setForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [localError, setLocalError] = useState("");

  const isEducator = form.role !== "supervisor";

  // Include existing staff so they can receive another course or role.
  const accountOptions = useMemo(() => {
    const accounts = new Map();

    eligibleAccounts.forEach((account) => {
      if (account.profile_id) {
        accounts.set(account.profile_id, account);
      }
    });

    staff.forEach((member) => {
      if (!member.profile_id) return;

      accounts.set(member.profile_id, {
        ...accounts.get(member.profile_id),
        profile_id: member.profile_id,
        full_name: member.full_name,
        email: member.email,
      });
    });

    return [...accounts.values()].sort((a, b) =>
      String(a.full_name || a.email || "").localeCompare(
        String(b.full_name || b.email || ""),
      ),
    );
  }, [eligibleAccounts, staff]);

  const filteredStaff = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return staff;

    return staff.filter((member) => {
      const assignments = classAllocations.filter(
        (assignment) =>
          assignment.staffProfileId === member.staff_profile_id &&
          assignment.status === "active",
      );

      const roles = Array.isArray(member.appointed_roles)
        ? member.appointed_roles
        : [];

      const searchableText = [
        member.full_name,
        member.email,
        member.role,
        ...roles,
        formatLabel(member.supervisor_type),
        member.specialization,
        ...assignments.flatMap((assignment) => [
          assignment.courseTitle,
          assignment.className,
          assignment.assignmentRole,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [searchTerm, staff, classAllocations]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,

      ...(name === "role"
        ? {
            classId: "",
            supervisorType: "",
          }
        : {}),
    }));

    setLocalError("");
    resetAppointStaff();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (appointingStaff) return;

    setLocalError("");
    resetAppointStaff();

    if (!form.profileId) {
      setLocalError("Select an account.");
      return;
    }

    if (!roleOptions.some((option) => option.value === form.role)) {
      setLocalError("Select a valid staff role.");
      return;
    }

    if (isEducator) {
      const selectedClass = courseClasses.find(
        (programmeClass) => programmeClass.id === form.classId,
      );

      if (!selectedClass) {
        setLocalError("Select a course.");
        return;
      }
    }

    if (
      !isEducator &&
      !["service_coordinator", "site_supervisor"].includes(
        form.supervisorType,
      )
    ) {
      setLocalError("Select a supervisor type.");
      return;
    }

    try {
      await appointStaff({
        ...form,
        classId: isEducator ? form.classId : null,
        supervisorType: isEducator ? null : form.supervisorType,
      });

      setForm({ ...initialForm });
    } catch (error) {
      setLocalError(
        error.message || "The staff assignment could not be saved.",
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

  if (staffManagementError || !staffSummary) {
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
                Manage staff roles and assign instructors, facilitators
                and coaches to courses.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshStaffManagement()}
              disabled={staffManagementFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={staffManagementFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          <section
            aria-label="Staff summary"
            className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <SummaryCard
              label="Total Staff"
              value={staffSummary.totalStaff}
              detail="Programme staff accounts"
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Instructors"
              value={staffSummary.instructors}
              detail="Learning delivery"
              icon={BriefcaseBusiness}
              tone="green"
            />

            <SummaryCard
              label="Facilitators"
              value={staffSummary.facilitators}
              detail="Learning support"
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Coaches & Supervisors"
              value={
                Number(staffSummary.coaches || 0) +
                Number(staffSummary.supervisors || 0)
              }
              detail="Coaching and service supervision roles"
              icon={CheckCircle2}
              tone="amber"
            />
          </section>

          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Staff Appointment & Course Assignment"
                description="An educator can hold several roles and support more than one course."
              />

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-5 md:p-6"
              >
                {appointStaffResult?.success && (
                  <AlertMessage
                    success
                    message={
                      appointStaffResult.message ||
                      "The staff assignment was saved successfully."
                    }
                  />
                )}

                {(localError || appointStaffError) && (
                  <AlertMessage
                    message={localError || appointStaffError?.message}
                  />
                )}

                <FormField label="Staff account" required>
                  <select
                    name="profileId"
                    value={form.profileId}
                    onChange={handleChange}
                    disabled={
                      appointingStaff || accountOptions.length === 0
                    }
                    required
                    className={inputClasses}
                  >
                    <option value="">Select an account</option>

                    {accountOptions.map((account) => (
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

                  {accountOptions.length === 0 && (
                    <p className="mt-2 text-sm text-slate-500">
                      No eligible staff accounts were returned.
                    </p>
                  )}
                </FormField>

                <FormField label="Appointment" required>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={appointingStaff}
                    required
                    className={inputClasses}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Save each role and course assignment separately.
                    Existing educator roles are retained.
                  </p>
                </FormField>

                {isEducator ? (
                  <FormField label="Course" required>
                    <select
                      name="classId"
                      value={form.classId}
                      onChange={handleChange}
                      disabled={
                        appointingStaff || courseClasses.length === 0
                      }
                      required
                      className={inputClasses}
                    >
                      <option value="">Select a course</option>

                      {courseClasses.map((programmeClass) => {
                        const hasMultipleClasses = courseClasses.some(
                          (item) =>
                            item.id !== programmeClass.id &&
                            item.courseId === programmeClass.courseId,
                        );

                        return (
                          <option
                            key={programmeClass.id}
                            value={programmeClass.id}
                          >
                            {programmeClass.courseTitle ||
                              programmeClass.name}
                            {hasMultipleClasses
                              ? ` — ${programmeClass.name}`
                              : ""}
                          </option>
                        );
                      })}
                    </select>

                    {courseClasses.length === 0 && (
                      <p className="mt-2 text-sm leading-6 text-amber-700">
                        Create a planned or active class under Classes &
                        Schedules before assigning an educator.
                      </p>
                    )}
                  </FormField>
                ) : (
                  <FormField label="Supervisor type" required>
                    <select
                      name="supervisorType"
                      value={form.supervisorType}
                      onChange={handleChange}
                      disabled={appointingStaff}
                      required
                      className={inputClasses}
                    >
                      <option value="">Select supervisor type</option>
                      <option value="service_coordinator">
                        Service Coordinator
                      </option>
                      <option value="site_supervisor">
                        Site Supervisor
                      </option>
                    </select>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Supervisors are assigned to service projects
                      through Staff Allocations.
                    </p>
                  </FormField>
                )}

                <FormField label="Specialization">
                  <input
                    type="text"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="Example: Digital literacy"
                    disabled={appointingStaff}
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
                    disabled={appointingStaff}
                    className={inputClasses}
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={
                    appointingStaff ||
                    accountOptions.length === 0 ||
                    (isEducator && courseClasses.length === 0)
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus size={20} aria-hidden="true" />
                  {appointingStaff
                    ? "Saving..."
                    : isEducator
                      ? "Save Course Assignment"
                      : "Save Supervisor Appointment"}
                </button>
              </form>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Operational Staff"
                description="Staff appointments, assigned courses and specializations."
              />

              <div className="border-b border-slate-200 p-5">
                <label className="relative block">
                  <span className="sr-only">Search staff</span>

                  <Search
                    size={20}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, email, role or course"
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              {filteredStaff.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        {[
                          "Staff Member",
                          "Appointment",
                          "Course",
                          "Specialization",
                        ].map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-5 py-4"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {filteredStaff.map((member) => (
                        <StaffRow
                          key={member.staff_profile_id}
                          member={member}
                          allocations={classAllocations}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <Users
                    size={40}
                    aria-hidden="true"
                    className="mx-auto text-slate-300"
                  />
                  <h3 className="mt-4 font-semibold text-slate-900">
                    {searchTerm ? "No matching staff" : "No staff appointed"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {searchTerm
                      ? "Try a different search term."
                      : "Appointed staff will appear here."}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function StaffRow({ member, allocations }) {
  const roles =
    Array.isArray(member.appointed_roles) &&
    member.appointed_roles.length
      ? member.appointed_roles
      : [member.role].filter(Boolean);

  const assignedClasses = allocations.filter(
    (assignment) =>
      assignment.staffProfileId === member.staff_profile_id &&
      assignment.status === "active",
  );

  return (
    <tr className="align-top">
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900">
          {member.full_name || "Name unavailable"}
        </p>
        <p className="mt-1 break-words text-sm text-slate-500">
          {member.email}
        </p>
      </td>

      <td className="px-5 py-4">
        <div className="flex max-w-[220px] flex-wrap gap-2">
          {[...new Set(roles)].map((role) => (
            <span
              key={role}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {formatLabel(role)}
            </span>
          ))}
        </div>

        {member.supervisor_type && (
          <p className="mt-2 text-xs font-semibold text-purple-700">
            {formatLabel(member.supervisor_type)}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        {assignedClasses.length > 0 ? (
          <ul className="space-y-3">
            {assignedClasses.map((assignment) => (
              <li key={assignment.assignmentId}>
                <p className="text-sm font-medium text-slate-800">
                  {assignment.courseTitle || assignment.className}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatLabel(assignment.assignmentRole)}
                  {assignment.className &&
                  assignment.className !== assignment.courseTitle
                    ? ` · ${assignment.className}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No course assigned</p>
        )}
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {member.specialization || "Not provided"}
      </td>
    </tr>
  );
}

function SummaryCard({ label, value, detail, icon: Icon, tone }) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    green: "border-green-200 bg-green-50 text-green-900",
    purple: "border-purple-200 bg-purple-50 text-purple-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <article
      className={`rounded-xl border p-5 shadow-sm ${
        tones[tone] || tones.blue
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm">{label}</p>
          <p className="mt-3 text-3xl font-bold">{value ?? 0}</p>
          <p className="mt-2 text-xs opacity-75">{detail}</p>
        </div>
        <Icon size={24} aria-hidden="true" className="shrink-0 opacity-75" />
      </div>
    </article>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {required && (
        <span className="ml-1 text-red-600" aria-hidden="true">
          *
        </span>
      )}
      {children}
    </label>
  );
}

function AlertMessage({ message, success = false }) {
  const Icon = success ? CheckCircle2 : XCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
        success
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <header className="border-b border-slate-200 px-5 py-5">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </header>
  );
}

function PageMessage({ message, error = false }) {
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
  if (!value) return "";

  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}