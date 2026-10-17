import { useState } from "react";
import { Link } from "react-router-dom";

import { useStudentService } from "../../hooks/useStudentService";
import StudentLayout from "../../layouts/StudentLayout";

export default function StudentServicePage() {
  const {
    assignments,
    serviceLoading,
    serviceFetching,
    serviceError,
    refreshService,
  } = useStudentService();

  const [date, setDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [search, setSearch] = useState("");

  const projects = Array.from(
    new Map(
      assignments.map((assignment) => [
        assignment.project_id,
        {
          id: assignment.project_id,
          title: assignment.project_title || "Service project",
        },
      ]),
    ).values(),
  ).sort((a, b) => a.title.localeCompare(b.title));

  const searchValue = search.trim().toLowerCase();

  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesDate =
        !date || assignment.schedule_date === date;

      const matchesProject =
        !projectId || assignment.project_id === projectId;

      const matchesSearch =
        !searchValue ||
        [
          assignment.project_title,
          assignment.activity_title,
          assignment.assigned_task,
          assignment.team_name,
          assignment.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchValue);

      return matchesDate && matchesProject && matchesSearch;
    })
    .sort(
      (a, b) =>
        String(b.schedule_date || "").localeCompare(
          String(a.schedule_date || ""),
        ) ||
        String(a.start_time || "").localeCompare(
          String(b.start_time || ""),
        ) ||
        String(a.assignment_id).localeCompare(
          String(b.assignment_id),
        ),
    );

  const eligibleAssignments = filteredAssignments.filter(
    (assignment) => !isCancelled(assignment),
  );

  const recordedAttendance = eligibleAssignments.filter(
    (assignment) => Boolean(assignment.attendance),
  );

  const attendedCount = recordedAttendance.filter(
    (assignment) =>
      assignment.attendance.attendance_status === "present" ||
      assignment.attendance.attendance_status === "late",
  ).length;

  const actualHours = recordedAttendance.reduce(
    (total, assignment) => {
      const hours = Number(assignment.attendance.service_hours);

      return total + (Number.isFinite(hours) && hours >= 0 ? hours : 0);
    },
    0,
  );

  function clearFilters() {
    setDate("");
    setProjectId("");
    setSearch("");
  }

  return (
    <StudentLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Student Portal
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                My Service
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                View your project assignments, activity instructions,
                attendance and recorded service hours. All times are WAT.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/student/schedule"
                className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-900"
              >
                Daily Schedule
              </Link>

              <button
                type="button"
                onClick={() => refreshService()}
                disabled={serviceFetching}
                className="rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {serviceFetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </header>

          {serviceError && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
            >
              {serviceError.message ||
                "Your service records could not be loaded."}
              {" "}Use Refresh to try again.
            </p>
          )}

          {serviceLoading ? (
            <p
              role="status"
              className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600"
            >
              Loading your service records...
            </p>
          ) : !serviceError ? (
            <>
              <section
                aria-label="Service filters"
                className="mt-8 rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr_auto]">
                  <label className="block text-sm font-semibold text-slate-700">
                    Activity date
                    <input
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Project
                    <select
                      value={projectId}
                      onChange={(event) => setProjectId(event.target.value)}
                      className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
                    >
                      <option value="">All my projects</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Search
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Project, activity, team or location"
                      className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="self-end rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    Clear Filters
                  </button>
                </div>

                <p className="mt-3 text-xs leading-6 text-slate-500">
                  Leave the date blank to see all dates. Totals follow your
                  filters and exclude cancelled activities.
                </p>
              </section>

              <section
                aria-label="Service summary"
                className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              >
                <SummaryCard
                  label="Assigned Activities"
                  value={eligibleAssignments.length}
                  detail="Activities in the selected view."
                />
                <SummaryCard
                  label="Attendance Recorded"
                  value={recordedAttendance.length}
                  detail="Activities with an attendance record."
                />
                <SummaryCard
                  label="Attended Activities"
                  value={attendedCount}
                  detail="Marked present or late."
                />
                <SummaryCard
                  label="Actual Service Hours"
                  value={formatHours(actualHours)}
                  detail="Sum of your recorded service hours."
                />
              </section>

              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-blue-900">
                Planned hours describe the activity schedule. Actual hours
                are recorded by your Site Supervisor. If an attendance or
                hours entry looks incorrect, contact your Site Supervisor.
              </div>

              <section className="mt-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-blue-950">
                    My Project Activities
                  </h2>
                  <p className="text-sm text-slate-500">
                    {filteredAssignments.length} activities
                  </p>
                </div>

                {filteredAssignments.length > 0 ? (
                  <div className="grid items-start gap-5 xl:grid-cols-2">
                    {filteredAssignments.map((assignment) => (
                      <ServiceCard
                        key={assignment.assignment_id}
                        assignment={assignment}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <h3 className="font-bold text-slate-800">
                      {assignments.length
                        ? "No activities match your filters"
                        : "No service assignments yet"}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      {assignments.length
                        ? "Clear the filters or choose another date or project."
                        : "Your service activities will appear when the Service Coordinator assigns you."}
                    </p>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </main>
    </StudentLayout>
  );
}

function ServiceCard({ assignment }) {
  const cancelled = isCancelled(assignment);
  const attendance = assignment.attendance;

  const attendanceLabel = attendance
    ? formatLabel(attendance.attendance_status)
    : cancelled
      ? "Not applicable"
      : "Not recorded";

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              {assignment.project_title || "Service project"}
            </p>
            <h3 className="mt-1 text-lg font-bold text-blue-950">
              {assignment.activity_title || "Service activity"}
            </h3>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              cancelled
                ? "bg-red-100 text-red-800"
                : assignment.activity_status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {cancelled
              ? "Cancelled"
              : formatLabel(assignment.activity_status)}
          </span>
        </div>

        <p className="mt-3 text-sm font-semibold text-slate-700">
          {formatDate(assignment.schedule_date)}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {formatTime(assignment.start_time)} –{" "}
          {formatTime(assignment.end_time)} WAT
        </p>
      </header>

      <div className="p-5">
        {cancelled && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-800">
            This activity has been cancelled. Its attendance and hours are
            excluded from your totals.
          </p>
        )}

        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail label="Location" value={assignment.location} />
          <Detail label="Team" value={assignment.team_name} />
          <Detail
            label="Responsibility"
            value={formatLabel(assignment.responsibility_level)}
          />
          <Detail
            label="Planned Hours"
            value={
              assignment.scheduled_hours == null
                ? "Not provided"
                : formatHours(assignment.scheduled_hours)
            }
          />
        </dl>

        <div className="mt-4">
          <TextDetail
            label="My Assigned Task"
            value={assignment.assigned_task}
          />
        </div>

        <section className="mt-5 rounded-lg border border-slate-200 p-4">
          <h4 className="font-bold text-blue-950">My Attendance</h4>

          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Detail label="Attendance Status" value={attendanceLabel} />
            <Detail
              label="Actual Service Hours"
              value={
                attendance?.service_hours == null
                  ? "Not recorded"
                  : formatHours(attendance.service_hours)
              }
            />
            <Detail
              label="Arrival Time"
              value={
                attendance?.arrival_time
                  ? formatTime(attendance.arrival_time)
                  : "Not recorded"
              }
            />
            <Detail
              label="Departure Time"
              value={
                attendance?.departure_time
                  ? formatTime(attendance.departure_time)
                  : "Not recorded"
              }
            />
          </dl>

          {!attendance && !cancelled && (
            <p className="mt-3 text-xs leading-6 text-slate-500">
              Attendance has not been recorded yet. This does not mean you
              were absent.
            </p>
          )}
        </section>

        <details className="mt-5 rounded-lg border border-slate-200">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-blue-900">
            Activity Instructions
          </summary>

          <div className="space-y-4 border-t border-slate-200 p-4">
            <TextDetail
              label="Task Description"
              value={assignment.task_description}
            />
            <TextDetail
              label="Expected Outcome"
              value={assignment.expected_outcome}
            />
            <TextDetail
              label="Safety Requirements"
              value={assignment.safety_requirements}
            />
          </div>
        </details>
      </div>
    </article>
  );
}

function SummaryCard({ label, value, detail }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-blue-950">{value}</p>
      <p className="mt-2 text-xs leading-6 text-slate-500">{detail}</p>
    </article>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value === null || value === undefined || value === ""
          ? "Not provided"
          : value}
      </dd>
    </div>
  );
}

function TextDetail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function isCancelled(assignment) {
  return (
    assignment.activity_status === "cancelled" ||
    assignment.project_status === "cancelled"
  );
}

function formatLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatHours(value) {
  const hours = Number(value);

  if (!Number.isFinite(hours)) return "Not recorded";

  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(hours);
}

function formatDate(value) {
  if (!value) return "Date not provided";

  const date = new Date(`${value}T12:00:00+01:00`);

  if (Number.isNaN(date.getTime())) return "Date not provided";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "Time not provided";

  const [hourText, minuteText] = String(value).split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    minuteText === undefined ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    return "Time not provided";
  }

  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${
    hour >= 12 ? "PM" : "AM"
  }`;
}