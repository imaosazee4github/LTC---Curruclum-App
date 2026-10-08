import {
  AlertTriangle,
  BriefcaseBusiness,
  GraduationCap,
  HeartHandshake,
  Presentation,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";

import {
  useSuperAdminDashboard,
} from "../../hooks/useSuperAdminDashboard";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";

export default function SuperAdminDashboardPage() {
  const {
    superAdminDashboard,
    superAdminDashboardLoading,
    superAdminDashboardFetching,
    superAdminDashboardError,
    refreshSuperAdminDashboard,
  } = useSuperAdminDashboard();

  if (superAdminDashboardLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading Super Admin dashboard..." />
      </SuperAdminLayout>
    );
  }

  if (
    superAdminDashboardError ||
    !superAdminDashboard
  ) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            superAdminDashboardError
              ?.message ||
            "The Super Admin dashboard could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  const {
    summary,
    staffByRole,
    recentStaff,
  } = superAdminDashboard;

  const totalOperationalStaff =
    summary.instructors +
    summary.facilitators +
    summary.coaches +
    summary.supervisors;

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                System Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Super Admin Dashboard
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Manage programme staff,
                monitor student coverage and
                oversee learning, development
                and mentoring operations.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshSuperAdminDashboard()
              }
              disabled={
                superAdminDashboardFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  superAdminDashboardFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Active Students"
              value={summary.activeStudents}
              detail={`${summary.totalStudents} total student accounts`}
              icon={GraduationCap}
              tone="blue"
            />

            <SummaryCard
              label="Operational Staff"
              value={totalOperationalStaff}
              detail="Instructors, facilitators, coaches and supervisors"
              icon={Users}
              tone="green"
            />

            <SummaryCard
              label="Active Mentors"
              value={summary.mentors}
              detail={`${summary.activeMentorAssignments} active assignments`}
              icon={HeartHandshake}
              tone="purple"
            />

            <SummaryCard
              label="Reports Awaiting Review"
              value={
                summary
                  .mentorReportsAwaitingReview
              }
              detail={`${summary.urgentMentorReports} urgent reports`}
              icon={ShieldCheck}
              tone={
                summary.urgentMentorReports >
                0
                  ? "red"
                  : "amber"
              }
            />
          </section>

          <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatusCard
              label="Instructors"
              value={summary.instructors}
              icon={Presentation}
            />

            <StatusCard
              label="Facilitators"
              value={summary.facilitators}
              icon={Users}
            />

            <StatusCard
              label="Coaches"
              value={summary.coaches}
              icon={UserRoundCheck}
            />

            <StatusCard
              label="Supervisors"
              value={summary.supervisors}
              icon={BriefcaseBusiness}
            />
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Staff Overview"
                description="Current appointments and account status by operational role."
              />

              {staffByRole.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {staffByRole.map(
                    (staffRole) => (
                      <StaffRoleRow
                        key={
                          staffRole.role
                        }
                        staffRole={
                          staffRole
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No staff information"
                  description="Staff role information will appear here."
                />
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Attention Required"
                description="Coverage and oversight items requiring action."
              />

              <div className="space-y-4 p-5">
                <AlertItem
                  label="Students without mentors"
                  value={
                    summary
                      .studentsWithoutMentors
                  }
                  warning={
                    summary
                      .studentsWithoutMentors >
                    0
                  }
                />

                <AlertItem
                  label="Incomplete student profiles"
                  value={
                    summary
                      .incompleteStudentProfiles
                  }
                  warning={
                    summary
                      .incompleteStudentProfiles >
                    0
                  }
                />

                <AlertItem
                  label="Mentor reports awaiting review"
                  value={
                    summary
                      .mentorReportsAwaitingReview
                  }
                  warning={
                    summary
                      .mentorReportsAwaitingReview >
                    0
                  }
                />

                <AlertItem
                  label="Urgent mentor reports"
                  value={
                    summary
                      .urgentMentorReports
                  }
                  urgent={
                    summary
                      .urgentMentorReports >
                    0
                  }
                />
              </div>
            </section>
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Recently Appointed Staff"
              description="Latest instructor, facilitator, coach and supervisor appointments."
            />

            {recentStaff.length > 0 ? (
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
                        Staff Number
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
                    {recentStaff.map(
                      (staff) => (
                        <RecentStaffRow
                          key={
                            staff
                              .staff_profile_id
                          }
                          staff={staff}
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No staff appointed yet"
                description="New instructor, facilitator, coach and supervisor appointments will appear here."
              />
            )}
          </section>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

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
      "border-green-200 bg-green-50 text-green-800",
    purple:
      "border-purple-200 bg-purple-50 text-purple-800",
    amber:
      "border-amber-200 bg-amber-50 text-amber-800",
    red:
      "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <article
      className={`rounded-xl border p-5 shadow-sm ${
        tones[tone] || tones.blue
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm opacity-75">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold">
            {value}
          </p>

          <p className="mt-2 text-xs opacity-75">
            {detail}
          </p>
        </div>

        <Icon
          size={22}
          className="opacity-70"
        />
      </div>
    </article>
  );
}

function StatusCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-slate-100 p-3 text-blue-950">
          <Icon size={21} />
        </div>
      </div>
    </article>
  );
}

function SectionHeader({
  title,
  description,
}) {
  return (
    <header className="border-b border-slate-200 px-5 py-5">
      <h2 className="text-lg font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </header>
  );
}

function StaffRoleRow({
  staffRole,
}) {
  return (
    <article className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-slate-900">
          {formatRole(
            staffRole.role,
          )}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {Number(
            staffRole.inactive,
          ) || 0}{" "}
          inactive accounts
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Active
          </p>

          <p className="mt-1 font-bold text-green-700">
            {Number(
              staffRole.active,
            ) || 0}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Total
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {Number(
              staffRole.total,
            ) || 0}
          </p>
        </div>
      </div>
    </article>
  );
}

function AlertItem({
  label,
  value,
  warning = false,
  urgent = false,
}) {
  const tone = urgent
    ? "border-red-200 bg-red-50 text-red-700"
    : warning
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg border p-4 ${tone}`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          size={18}
          className="shrink-0"
        />

        <span className="text-sm font-medium">
          {label}
        </span>
      </div>

      <span className="font-bold">
        {value}
      </span>
    </div>
  );
}

function RecentStaffRow({
  staff,
}) {
  return (
    <tr>
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900">
          {staff.full_name ||
            "Staff member"}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {staff.email}
        </p>
      </td>

      <td className="px-5 py-4 text-sm text-slate-700">
        {formatRole(staff.role)}
      </td>

      <td className="px-5 py-4 text-sm text-slate-700">
        {staff.staff_number ||
          "Pending"}
      </td>

      <td className="px-5 py-4 text-sm text-slate-700">
        {staff.specialization ||
          staff.job_title ||
          "Not provided"}
      </td>

      <td className="px-5 py-4">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          {formatRole(
            staff.availability_status,
          )}
        </span>
      </td>
    </tr>
  );
}

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="p-10 text-center">
      <h3 className="font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
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
        className={`w-full max-w-lg rounded-xl border p-6 text-center ${
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

function formatRole(value) {
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