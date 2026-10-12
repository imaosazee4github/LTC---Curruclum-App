import {
  CalendarDays,
  ClipboardCheck,
  FolderKanban,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  useSupervisorDashboard,
} from "../../hooks/useSupervisorDashboard";

import SupervisorLayout from "../../layouts/SupervisorLayout";

export default function SupervisorDashboardPage() {
  const {
    supervisorDashboard,
    supervisorType,
    supervisorSummary,
    supervisorProjects,
    supervisorDashboardLoading,
    supervisorDashboardFetching,
    supervisorDashboardError,
    refreshSupervisorDashboard,
  } = useSupervisorDashboard();

  if (supervisorDashboardLoading) {
    return (
      <SupervisorLayout>
        <PageMessage message="Loading supervisor dashboard..." />
      </SupervisorLayout>
    );
  }

  if (
    supervisorDashboardError ||
    !supervisorDashboard
  ) {
    return (
      <SupervisorLayout>
        <PageMessage
          error
          message={
            supervisorDashboardError
              ?.message ||
            "The supervisor dashboard could not be loaded."
          }
        />
      </SupervisorLayout>
    );
  }

  const isCoordinator =
    supervisorType ===
    "service_coordinator";

  const roleLabel =
    isCoordinator
      ? "Service Coordinator"
      : "Site Supervisor";

  const summary =
    supervisorSummary || {};

  return (
    <SupervisorLayout
      supervisorType={supervisorType}
    >
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Service Learning
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                {roleLabel} Dashboard
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                {isCoordinator
                  ? "Create and schedule service projects, organise student teams, and assign responsibilities."
                  : "Monitor project activity, record attendance, and document each student's work and development."}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshSupervisorDashboard()
              }
              disabled={
                supervisorDashboardFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  supervisorDashboardFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isCoordinator ? (
              <>
                <SummaryCard
                  label="Total Projects"
                  value={
                    summary.totalProjects
                  }
                  detail="Service projects"
                  icon={FolderKanban}
                  tone="blue"
                />

                <SummaryCard
                  label="Active Projects"
                  value={
                    summary.activeProjects
                  }
                  detail="Currently operational"
                  icon={ShieldCheck}
                  tone="green"
                />

                <SummaryCard
                  label="Upcoming Schedules"
                  value={
                    summary.upcomingSchedules
                  }
                  detail="Scheduled activities"
                  icon={CalendarDays}
                  tone="purple"
                />

                <SummaryCard
                  label="Assigned Students"
                  value={
                    summary.assignedStudents
                  }
                  detail="Students on projects"
                  icon={Users}
                  tone="amber"
                />
              </>
            ) : (
              <>
                <SummaryCard
                  label="Active Projects"
                  value={
                    summary.activeProjects
                  }
                  detail="Projects to monitor"
                  icon={FolderKanban}
                  tone="blue"
                />

                <SummaryCard
                  label="Assigned Students"
                  value={
                    summary.assignedStudents
                  }
                  detail="Students on projects"
                  icon={Users}
                  tone="green"
                />

                <SummaryCard
                  label="Attendance Pending"
                  value={
                    summary.attendancePending
                  }
                  detail="Attendance to record"
                  icon={CalendarDays}
                  tone="amber"
                />

                <SummaryCard
                  label="Reports Pending"
                  value={
                    summary.workReportsPending
                  }
                  detail="Work records required"
                  icon={ClipboardCheck}
                  tone="purple"
                />
              </>
            )}
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Service Projects
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {isCoordinator
                  ? "Review projects, schedules, and student participation."
                  : "Review the projects and upcoming activities requiring supervision."}
              </p>
            </div>

            {supervisorProjects.length >
            0 ? (
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                {supervisorProjects.map(
                  (project) => (
                    <ProjectCard
                      key={
                        project.project_id
                      }
                      project={project}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="p-10 text-center">
                <FolderKanban className="mx-auto h-11 w-11 text-slate-300" />

                <h3 className="mt-4 font-bold text-slate-900">
                  No service projects
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {isCoordinator
                    ? "Your first service project can be created from Projects & Schedules."
                    : "There are currently no service projects available for monitoring."}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </SupervisorLayout>
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
      "bg-blue-100 text-blue-700",
    green:
      "bg-emerald-100 text-emerald-700",
    amber:
      "bg-amber-100 text-amber-700",
    purple:
      "bg-purple-100 text-purple-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {Number(value) || 0}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {detail}
          </p>
        </div>

        <div
          className={`rounded-lg p-3 ${
            tones[tone]
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ project }) {
  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
            {project.code}
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-950">
            {project.title}
          </h3>
        </div>

        <StatusBadge
          status={project.status}
        />
      </div>

      {project.description ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {project.description}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
        <SmallDetail
          label="Location"
          value={
            project.location ||
            "Not specified"
          }
          icon={MapPin}
        />

        <SmallDetail
          label="Students"
          value={`${
            Number(
              project.student_count,
            ) || 0
          } assigned`}
          icon={Users}
        />

        <SmallDetail
          label="Schedules"
          value={`${
            Number(
              project.schedule_count,
            ) || 0
          } created`}
          icon={CalendarDays}
        />

        <SmallDetail
          label="Project Dates"
          value={formatDateRange(
            project.start_date,
            project.end_date,
          )}
          icon={FolderKanban}
        />
      </div>

      {project.next_schedule ? (
        <div className="mt-5 rounded-lg bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Next Activity
          </p>

          <p className="mt-2 font-semibold text-blue-950">
            {
              project.next_schedule
                .task_title
            }
          </p>

          <p className="mt-1 text-sm text-blue-800">
            {formatDate(
              project.next_schedule
                .schedule_date,
            )}
            {" · "}
            {formatTime(
              project.next_schedule
                .start_time,
            )}
            {" – "}
            {formatTime(
              project.next_schedule
                .end_time,
            )}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function SmallDetail({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    planned:
      "bg-slate-100 text-slate-700",
    active:
      "bg-emerald-100 text-emerald-800",
    completed:
      "bg-blue-100 text-blue-800",
    cancelled:
      "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        styles[status] ||
        styles.planned
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <div
        className={`max-w-lg rounded-xl border px-6 py-5 text-center ${
          error
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        {message}
      </div>
    </main>
  );
}

function formatDate(value) {
  if (!value) {
    return "Date not set";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(
    new Date(`${value}T00:00:00Z`),
  );
}

function formatDateRange(
  startDate,
  endDate,
) {
  const start =
    formatDate(startDate);

  if (!endDate) {
    return start;
  }

  return `${start} – ${formatDate(
    endDate,
  )}`;
}

function formatTime(value) {
  if (!value) {
    return "Time not set";
  }

  return value.slice(0, 5);
}

function formatLabel(value) {
  if (!value) {
    return "Planned";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}