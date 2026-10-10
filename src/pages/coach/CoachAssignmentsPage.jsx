import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  RefreshCw,
  Search,
  Target,
  UserRound,
  Users,
} from "lucide-react";

import { useState } from "react";

import { Link } from "react-router-dom";

import { useCoachDashboard } from "../../hooks/useCoachDashboard";
import CoachLayout from "../../layouts/CoachLayout";

export default function CoachAssignmentsPage() {
  const {
    coachDashboard,
    coachDashboardLoading,
    coachDashboardFetching,
    coachDashboardError,
    refreshCoachDashboard,
  } = useCoachDashboard();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const assignments =
    coachDashboard?.assignments || [];

  const normalizedSearch =
    searchTerm.trim().toLowerCase();

  const filteredAssignments =
    assignments.filter((assignment) => {
      const student =
        assignment.student || {};

      const matchesSearch =
        !normalizedSearch ||
        student.full_name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        student.student_number
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        student.email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        assignment.development_area
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        assignment.goal
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        assignment.status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const activeAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status === "active",
    ).length;

  const pausedAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status === "paused",
    ).length;

  const totalSessions =
    assignments.reduce(
      (total, assignment) =>
        total +
        Number(
          assignment.session_count,
        ),
      0,
    );

  if (coachDashboardLoading) {
    return (
      <CoachLayout>
        <PageMessage message="Loading coaching assignments..." />
      </CoachLayout>
    );
  }

  if (coachDashboardError) {
    return (
      <CoachLayout>
        <PageMessage
          error
          message={
            coachDashboardError.message ||
            "Unable to load coaching assignments."
          }
          onRetry={
            refreshCoachDashboard
          }
        />
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Coaching Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                My Coaching Assignments
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review assigned students,
                development areas, goals,
                practice plans and coaching
                progress.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  refreshCoachDashboard()
                }
                disabled={
                  coachDashboardFetching
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    coachDashboardFetching
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {coachDashboardFetching
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <Link
                to="/coach/record"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white transition hover:bg-blue-900"
              >
                <ClipboardList className="h-4 w-4" />
                Record Coaching
              </Link>
            </div>
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Assignments"
              value={assignments.length}
              description="All coaching assignments."
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Active"
              value={activeAssignments}
              description="Assignments currently active."
              icon={Target}
              tone="green"
            />

            <SummaryCard
              label="Paused"
              value={pausedAssignments}
              description="Assignments temporarily paused."
              icon={BookOpen}
              tone="amber"
            />

            <SummaryCard
              label="Sessions Recorded"
              value={totalSessions}
              description="Sessions across all assignments."
              icon={ClipboardList}
              tone="blue"
            />
          </section>

          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div>
                <label
                  htmlFor="assignment-search"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Search assignments
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="assignment-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value,
                      )
                    }
                    placeholder="Search student, development area or goal"
                    className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="status-filter"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Assignment status
                </label>

                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">
                    All statuses
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="paused">
                    Paused
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Assigned Students
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Showing{" "}
                  {
                    filteredAssignments.length
                  }{" "}
                  of {assignments.length}{" "}
                  assignments
                </p>
              </div>
            </div>

            {filteredAssignments.length >
            0 ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {filteredAssignments.map(
                  (assignment) => (
                    <AssignmentCard
                      key={
                        assignment.assignment_id ||
                        assignment.id
                      }
                      assignment={
                        assignment
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                filtered={
                  Boolean(
                    normalizedSearch,
                  ) ||
                  statusFilter !== "all"
                }
              />
            )}
          </section>
        </div>
      </main>
    </CoachLayout>
  );
}

function AssignmentCard({
  assignment,
}) {
  const student =
    assignment.student || {};

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <ProfilePhoto
              student={student}
            />

            <div>
              <h3 className="font-bold text-slate-950">
                {student.full_name ||
                  "Student"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {student.student_number ||
                  student.email ||
                  "Student record"}
              </p>
            </div>
          </div>

          <StatusBadge
            status={assignment.status}
          />
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Detail
            label="Development Area"
            value={
              assignment.development_area
            }
          />

          <Detail
            label="Goal"
            value={assignment.goal}
          />

          <Detail
            label="Current Position"
            value={
              assignment.current_position
            }
          />

          <Detail
            label="Practice Plan"
            value={
              assignment.practice_plan
            }
          />
        </div>

        <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
          <SmallStat
            icon={CalendarDays}
            label="Target Date"
            value={formatDate(
              assignment.target_date,
            )}
          />

          <SmallStat
            icon={ClipboardList}
            label="Sessions"
            value={
              assignment.session_count ||
              0
            }
          />

          <SmallStat
            icon={Target}
            label="Open Follow-Ups"
            value={
              assignment
                .open_follow_up_count ||
              0
            }
          />
        </div>

        <Link
          to="/coach/record"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white transition hover:bg-blue-900"
        >
          <ClipboardList className="h-4 w-4" />
          Record Coaching Session
        </Link>
      </div>
    </article>
  );
}

function ProfilePhoto({ student }) {
  if (student.profile_photo_url) {
    return (
      <img
        src={student.profile_photo_url}
        alt={`${student.full_name || "Student"} profile`}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
      {getInitials(
        student.full_name,
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SmallStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />

        <p className="text-xs font-semibold">
          {label}
        </p>
      </div>

      <p className="mt-2 font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}) {
  const tones = {
    purple:
      "bg-purple-100 text-purple-700",
    green:
      "bg-emerald-100 text-emerald-700",
    amber:
      "bg-amber-100 text-amber-700",
    blue:
      "bg-blue-100 text-blue-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${tones[tone]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active:
      "bg-emerald-100 text-emerald-800",
    paused:
      "bg-amber-100 text-amber-800",
    completed:
      "bg-blue-100 text-blue-800",
    cancelled:
      "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
        styles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {String(status || "active").replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function EmptyState({ filtered }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
        <UserRound className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-950">
        {filtered
          ? "No matching assignments"
          : "No coaching assignments"}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-slate-600">
        {filtered
          ? "Try changing your search or status filter."
          : "Students assigned to you for coaching will appear here."}
      </p>
    </div>
  );
}

function PageMessage({
  message,
  error = false,
  onRetry,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
        className={`mx-auto max-w-3xl rounded-xl border p-6 ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        <p className="font-semibold">
          {message}
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={() => onRetry()}
            className="mt-4 rounded-lg bg-blue-950 px-4 py-2 font-semibold text-white"
          >
            Try Again
          </button>
        ) : null}
      </div>
    </main>
  );
}

function getInitials(name) {
  if (!name) {
    return "ST";
  }

  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  if (!value) {
    return "Not provided";
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