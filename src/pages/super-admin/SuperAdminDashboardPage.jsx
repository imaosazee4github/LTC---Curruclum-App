import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Presentation,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";

import { useSuperAdminDashboard } from "../../hooks/useSuperAdminDashboard";
import { getPendingRegistrations } from "../../services/superAdminService";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import PendingRegistrationsTable from "./PendingRegistrationsTable";
import StudentOverviewTable from "./StudentOverviewTable";

export default function SuperAdminDashboardPage() {
  const notificationDialog = useRef(null);
  const registrationSection = useRef(null);
  const studentSection = useRef(null);

  const {
    superAdminDashboard,
    superAdminDashboardLoading,
    superAdminDashboardFetching,
    superAdminDashboardError,
    refreshSuperAdminDashboard,
  } = useSuperAdminDashboard();

  const pendingQuery = useQuery({
    queryKey: ["dashboard-pending-registrations"],
    queryFn: getPendingRegistrations,
    enabled: Boolean(superAdminDashboard),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  async function handleRefresh() {
    await Promise.allSettled([
      refreshSuperAdminDashboard(),
      pendingQuery.refetch(),
    ]);
  }

  function openNotifications() {
    notificationDialog.current?.showModal();
    void pendingQuery.refetch();
  }

  function closeNotifications() {
    notificationDialog.current?.close();
  }

  function showSection(target) {
    closeNotifications();

    let section = null;

    if (target === "registrations") {
      section = registrationSection.current;
    } else if (target === "students") {
      section = studentSection.current;
    }

    section?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    section?.focus({ preventScroll: true });
  }

  if (superAdminDashboardLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading LTC Admin dashboard..." />
      </SuperAdminLayout>
    );
  }

  if (superAdminDashboardError || !superAdminDashboard) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            superAdminDashboardError?.message ||
            "The LTC Admin dashboard could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  const { summary, recentStaff = [] } = superAdminDashboard;

  const refreshing =
    superAdminDashboardFetching || pendingQuery.isFetching;

  const pendingRegistrations = Array.isArray(pendingQuery.data)
    ? pendingQuery.data.length
    : 0;

  const actions = [
    {
      id: "registrations",
      title: "Registrations awaiting approval",
      count: pendingRegistrations,
      description:
        "Review the requested roles and approve eligible users so they can access their dashboards.",
      button: "Review registrations",
      target: "registrations",
    },
    {
      id: "urgent-reports",
      title: "Urgent mentor reports",
      count: summary.urgentMentorReports,
      urgent: true,
      description:
        "Review the urgent reports and coordinate the support or follow-up needed with the mentoring department.",
    },
    {
      id: "reports",
      title: "Mentor reports awaiting review",
      count: summary.mentorReportsAwaitingReview,
      description:
        "Review submitted reports and reports under review with the mentoring department. Urgent reports may also appear in this count.",
    },
    {
      id: "mentors",
      title: "Students without mentors",
      count: summary.studentsWithoutMentors,
      description:
        "Check which students have no assigned mentor and arrange their mentor assignments with the mentoring department.",
      button: "View students",
      target: "students",
    },
    {
      id: "profiles",
      title: "Incomplete student profiles",
      count: summary.incompleteStudentProfiles,
      description:
        "Check the students’ profile details and ask them to complete their missing information.",
      button: "View students",
      target: "students",
    },
  ].filter((action) => Number(action.count) > 0);

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
                LTC Admin Dashboard
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Monitor students, review registrations and oversee learning,
                development and mentoring activities.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={18}
                  aria-hidden="true"
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh dashboard"}
              </button>

              <button
                type="button"
                onClick={openNotifications}
                aria-haspopup="dialog"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <Bell size={18} aria-hidden="true" />
                Actions required
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold">
                  {actions.length}
                </span>
              </button>
            </div>
          </header>

          <section
            aria-label="Dashboard summary"
            className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            <SummaryCard
              label="Active Students"
              value={summary.activeStudents}
              detail={`${summary.totalStudents} total student accounts`}
              icon={GraduationCap}
              tone="blue"
            />

            <SummaryCard
              label="Active Educator Roles"
              value={
                summary.instructors +
                summary.facilitators +
                summary.coaches +
                summary.supervisors
              }
              detail="Role counts may include the same person more than once"
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
              value={summary.mentorReportsAwaitingReview}
              detail={`${summary.urgentMentorReports} urgent reports`}
              icon={ShieldCheck}
              tone={summary.urgentMentorReports > 0 ? "red" : "amber"}
            />
          </section>

          <section
            aria-label="Staff role counts"
            className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
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

          <div
            ref={registrationSection}
            tabIndex={-1}
            className="mt-8 scroll-mt-6 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <PendingRegistrationsTable />
          </div>

          <div
            ref={studentSection}
            tabIndex={-1}
            className="mt-8 scroll-mt-6 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <StudentOverviewTable />
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-950">
                Recently Appointed Staff
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest instructor, facilitator, coach and supervisor appointments.
              </p>
            </div>

            {recentStaff.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      {[
                        "Staff Member",
                        "Role",
                        "Staff Number",
                        "Specialization",
                        "Availability",
                      ].map((heading) => (
                        <th key={heading} scope="col" className="px-5 py-4">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {recentStaff.map((staff) => (
                      <tr key={staff.staff_profile_id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {staff.full_name || "Staff member"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {staff.email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatRole(staff.role)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {staff.staff_number || "Pending"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {staff.specialization ||
                            staff.job_title ||
                            "Not provided"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatRole(staff.availability_status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-10 text-center text-sm text-slate-500">
                No staff appointed yet.
              </p>
            )}
          </section>
        </div>
      </main>

      <dialog
        ref={notificationDialog}
        aria-labelledby="notification-title"
        aria-describedby="notification-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeNotifications();
          }
        }}
        className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-6">
          <div>
            <h2
              id="notification-title"
              className="text-xl font-bold text-blue-950"
            >
              Actions Required
            </h2>

            <p
              id="notification-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              Review outstanding items and the action needed for each.
              Counts remain until the underlying issue is resolved.
            </p>
          </div>

          <button
            type="button"
            autoFocus
            onClick={closeNotifications}
            aria-label="Close notifications"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-4 p-6">
          {pendingQuery.isFetching && (
            <p role="status" className="text-sm text-slate-500">
              Checking pending registrations...
            </p>
          )}

          {pendingQuery.isError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p>
                Registration alerts could not be updated:{" "}
                {pendingQuery.error?.message || "Please try again."}
              </p>

              <button
                type="button"
                onClick={() => pendingQuery.refetch()}
                disabled={pendingQuery.isFetching}
                className="mt-2 font-semibold underline disabled:opacity-60"
              >
                Retry
              </button>
            </div>
          )}

          {actions.map((action) => (
            <article
              key={action.id}
              className={`rounded-xl border p-5 ${
                action.urgent
                  ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={21}
                  aria-hidden="true"
                  className={`mt-1 shrink-0 ${
                    action.urgent ? "text-red-600" : "text-amber-600"
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-slate-900">
                      {action.title}
                    </h3>

                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-900">
                      {action.count}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {action.description}
                  </p>

                  {action.button && (
                    <button
                      type="button"
                      onClick={() => showSection(action.target)}
                      className="mt-4 rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                      {action.button}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}

          {actions.length === 0 && (
            <div className="py-8 text-center">
              <CheckCircle2
                size={40}
                aria-hidden="true"
                className="mx-auto text-green-600"
              />

              <h3 className="mt-4 font-bold text-slate-900">
                {pendingQuery.isError || pendingQuery.isFetching
                  ? "No other outstanding actions"
                  : "You’re all caught up"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {pendingQuery.isError || pendingQuery.isFetching
                  ? "Registration alerts are not yet confirmed."
                  : "No outstanding actions were found in the current dashboard data."}
              </p>
            </div>
          )}
        </div>

        <footer className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={closeNotifications}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Close
          </button>
        </footer>
      </dialog>
    </SuperAdminLayout>
  );
}

function SummaryCard({ label, value, detail, icon: Icon, tone }) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    green: "border-green-200 bg-green-50 text-green-800",
    purple: "border-purple-200 bg-purple-50 text-purple-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <article
      className={`rounded-xl border p-5 shadow-sm ${
        tones[tone] || tones.blue
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm opacity-75">{label}</p>
          <p className="mt-3 text-3xl font-bold">{value}</p>
          <p className="mt-2 text-xs leading-5 opacity-75">{detail}</p>
        </div>

        <Icon size={22} aria-hidden="true" className="shrink-0 opacity-70" />
      </div>
    </article>
  );
}

function StatusCard({ label, value, icon: Icon }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>

        <div className="rounded-lg bg-slate-100 p-3 text-blue-950">
          <Icon size={21} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

function PageMessage({ message, error = false }) {
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
  if (!value) return "Not available";

  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}