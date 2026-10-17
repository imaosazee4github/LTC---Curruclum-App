import { useState } from "react";

import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Timer,
  Users,
} from "lucide-react";

import { useServiceOversight } from "../../hooks/useServiceOversight";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";

const performanceFields = [
  { key: "quality", label: "Quality" },
  { key: "reliability", label: "Reliability" },
  { key: "safety", label: "Safety" },
  { key: "follow_through", label: "Follow-Through" },
  {
    key: "response_to_feedback",
    label: "Response to Feedback",
  },
  { key: "independence", label: "Independence" },
];

export default function ServiceOversightPage() {
  const {
    oversightSummary,
    oversightProjects,
    oversightAssignments,
    oversightLoading,
    oversightFetching,
    oversightError,
    refreshOversight,
  } = useServiceOversight();

  const [date, setDate] = useState(getTodayInNigeria);
  const [projectFilter, setProjectFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const dailyAssignments = oversightAssignments.filter(
    (assignment) =>
      assignment.schedule?.schedule_date === date &&
      assignment.assignment_status !== "removed" &&
      assignment.schedule?.status !== "cancelled" &&
      assignment.project?.status !== "cancelled",
  );

  const availableProjects = groupByProject(dailyAssignments);
  const search = searchTerm.trim().toLowerCase();

  const filteredAssignments = dailyAssignments.filter(
    (assignment) => {
      const matchesProject =
        !projectFilter ||
        assignment.project?.project_id === projectFilter;

      const searchableText = [
        assignment.student?.full_name,
        assignment.student?.email,
        assignment.student?.student_number,
        assignment.project?.title,
        assignment.project?.code,
        assignment.schedule?.task_title,
        assignment.team_name,
        assignment.assigned_task,
        assignment.attendance?.attendance_status,
        assignment.work_record?.work_performed,
        assignment.work_record?.outcome,
        assignment.work_record?.supervisor_remarks,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesProject &&
        (!search || searchableText.includes(search))
      );
    },
  );

  const groups = groupByProject(filteredAssignments);

  const studentCount = new Set(
    filteredAssignments.map(
      (assignment) =>
        assignment.student?.student_profile_id ||
        assignment.student?.profile_id ||
        assignment.student?.student_number ||
        assignment.assignment_id,
    ),
  ).size;

  const attendanceRecorded = filteredAssignments.filter(
    (assignment) => Boolean(assignment.attendance),
  ).length;

  const reportsRecorded = filteredAssignments.filter(
    (assignment) => Boolean(assignment.work_record),
  ).length;

  const serviceHours = filteredAssignments.reduce(
    (total, assignment) => {
      const hours = Number(assignment.attendance?.service_hours);

      return total + (
        Number.isFinite(hours) && hours >= 0 ? hours : 0
      );
    },
    0,
  );

  function changeDate(nextDate) {
    if (!nextDate) return;

    setDate(nextDate);
    setProjectFilter("");
  }

  if (oversightLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading service oversight..." />
      </SuperAdminLayout>
    );
  }

  if (oversightError || !oversightSummary) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            oversightError?.message ||
            "Service oversight data could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Programme Oversight
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Service Projects and Student Reports
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review daily student assignments, attendance, actual
                service hours and performance reports across projects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshOversight()}
              disabled={oversightFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${
                  oversightFetching ? "animate-spin" : ""
                }`}
              />

              {oversightFetching ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          <section
            aria-label="Service oversight filters"
            className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1.5fr_2fr_auto]">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Reporting date (Nigeria)
                </span>

                <input
                  type="date"
                  value={date}
                  required
                  onChange={(event) => changeDate(event.target.value)}
                  className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Project
                </span>

                <select
                  value={projectFilter}
                  onChange={(event) =>
                    setProjectFilter(event.target.value)
                  }
                  className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All projects for this date</option>

                  {availableProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.code ? `${project.code} — ` : ""}
                      {project.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Search student or report
                </span>

                <div className="relative mt-2">
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"
                  />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Student, task, team or report"
                    className="block w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </label>

              <button
                type="button"
                onClick={() => {
                  changeDate(getTodayInNigeria());
                  setSearchTerm("");
                }}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Today
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Summary counts, project cards and student reports follow
              the selected date, project and search. Cancelled
              activities and removed assignments are excluded.
            </p>
          </section>

          <section
            aria-label="Selected service summary"
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
          >
            <SummaryCard
              label="Projects in View"
              value={groups.length}
              detail="Projects with matching student assignments"
              icon={BriefcaseBusiness}
              tone="blue"
            />

            <SummaryCard
              label="Assigned Students"
              value={studentCount}
              detail={`${filteredAssignments.length} student activity assignments`}
              icon={Users}
              tone="green"
            />

            <SummaryCard
              label="Attendance Pending"
              value={filteredAssignments.length - attendanceRecorded}
              detail={`${attendanceRecorded} recorded`}
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Reports Pending"
              value={filteredAssignments.length - reportsRecorded}
              detail={`${reportsRecorded} recorded`}
              icon={CheckCircle2}
              tone="purple"
            />

            <SummaryCard
              label="Actual Service Hours"
              value={formatHours(serviceHours)}
              detail="Sum of recorded student hours"
              icon={Timer}
              tone="slate"
            />
          </section>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">
              {formatDate(date)}
            </h2>

            <p className="text-sm text-slate-500">
              {groups.length} projects · {studentCount} students
            </p>
          </div>

          <ProjectOverview
            groups={groups}
            projects={oversightProjects}
          />

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-950">
                Student Assignment Oversight
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Attendance and performance reports are grouped by
                project. Each record belongs to one student activity.
                Pending means a record has not been submitted.
              </p>
            </header>

            {groups.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {groups.map((group) => (
                  <section key={group.id}>
                    <header className="border-b border-slate-200 bg-blue-50 px-5 py-4">
                      <h3 className="text-lg font-bold text-blue-950">
                        {group.title}
                      </h3>

                      <p className="mt-1 text-sm text-blue-800">
                        {group.assignments.length} student activity
                        assignments
                      </p>
                    </header>

                    <div className="grid items-start gap-5 p-5 xl:grid-cols-2">
                      {group.assignments.map((assignment) => (
                        <AssignmentReportCard
                          key={assignment.assignment_id}
                          assignment={assignment}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <Users
                  aria-hidden="true"
                  className="mx-auto h-10 w-10 text-slate-300"
                />

                <h3 className="mt-4 font-bold text-slate-900">
                  No matching student assignments
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose another date or project, or clear the search.
                  Projects without student assignments do not appear
                  in this daily view.
                </p>

                {(searchTerm || projectFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setProjectFilter("");
                    }}
                    className="mt-4 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                  >
                    Clear project and search
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function ProjectOverview({ groups, projects }) {
  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 p-5">
        <h2 className="text-xl font-bold text-slate-950">
          Daily Project Overview
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Projects containing student assignments in the selected view.
        </p>
      </header>

      {groups.length > 0 ? (
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          {groups.map((group) => {
            const project =
              projects.find(
                (item) => item.project_id === group.id,
              ) || group.project;

            const students = new Set(
              group.assignments.map(
                (assignment) =>
                  assignment.student?.student_profile_id ||
                  assignment.student?.profile_id ||
                  assignment.student?.student_number ||
                  assignment.assignment_id,
              ),
            ).size;

            const attendanceCount = group.assignments.filter(
              (assignment) => Boolean(assignment.attendance),
            ).length;

            const reportCount = group.assignments.filter(
              (assignment) => Boolean(assignment.work_record),
            ).length;

            const hours = group.assignments.reduce(
              (total, assignment) => {
                const value = Number(
                  assignment.attendance?.service_hours,
                );

                return total + (
                  Number.isFinite(value) && value >= 0 ? value : 0
                );
              },
              0,
            );

            return (
              <article
                key={group.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                      {project.code || group.code || "Service Project"}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                      {group.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {project.location || "Location not specified"}
                    </p>
                  </div>

                  <StatusBadge status={project.status} />
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <Detail
                    label="Students in View"
                    value={students}
                  />

                  <Detail
                    label="Activity Assignments"
                    value={group.assignments.length}
                  />

                  <Detail
                    label="Attendance Recorded"
                    value={`${attendanceCount} of ${group.assignments.length}`}
                  />

                  <Detail
                    label="Reports Recorded"
                    value={`${reportCount} of ${group.assignments.length}`}
                  />

                  <Detail
                    label="Actual Service Hours"
                    value={formatHours(hours)}
                  />

                  <Detail
                    label="Project Start Date"
                    value={formatDate(project.start_date)}
                  />
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Created by {getPersonName(project.created_by)}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="p-8 text-center text-sm text-slate-500">
          No projects have matching student assignments for this view.
        </p>
      )}
    </section>
  );
}

function AssignmentReportCard({ assignment }) {
  const student = assignment.student || {};
  const project = assignment.project || {};
  const schedule = assignment.schedule || {};
  const attendance = assignment.attendance;
  const workRecord = assignment.work_record;

  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-slate-950">
            {student.full_name || student.email || "Student"}
          </h4>

          {student.student_number && (
            <p className="mt-1 text-xs text-slate-500">
              {student.student_number}
            </p>
          )}

          <p className="mt-2 text-sm font-semibold text-blue-700">
            {project.title || "Service Project"}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {schedule.task_title || "Scheduled Activity"}
            {" · "}
            {formatDate(schedule.schedule_date)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <RecordBadge
            label="Attendance"
            recorded={Boolean(attendance)}
          />

          <RecordBadge
            label="Report"
            recorded={Boolean(workRecord)}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Detail
          label="Team"
          value={assignment.team_name || "Not specified"}
        />

        <Detail
          label="Responsibility"
          value={formatLabel(assignment.responsibility_level)}
        />

        <Detail
          label="Assigned Task"
          value={assignment.assigned_task || "Not specified"}
        />

        <Detail
          label="Assigned By"
          value={getPersonName(assignment.assigned_by)}
        />
      </div>

      <details className="mt-5 rounded-lg border border-slate-200">
        <summary className="cursor-pointer px-4 py-3 font-semibold text-slate-900">
          Attendance Details
        </summary>

        <div className="border-t border-slate-200 p-4">
          {attendance ? (
            <>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Detail
                  label="Status"
                  value={formatLabel(attendance.attendance_status)}
                />

                <Detail
                  label="Actual Service Hours"
                  value={attendance.service_hours}
                />

                <Detail
                  label="Arrival"
                  value={formatTime(attendance.arrival_time)}
                />

                <Detail
                  label="Departure"
                  value={formatTime(attendance.departure_time)}
                />
              </div>

              <TextDetail
                label="Attendance Remarks"
                value={attendance.attendance_remarks}
              />

              <p className="mt-4 text-xs text-slate-500">
                Recorded by {getPersonName(attendance.recorded_by)}
              </p>
            </>
          ) : (
            <p className="text-sm text-amber-700">
              Attendance has not been recorded.
            </p>
          )}
        </div>
      </details>

      <details className="mt-3 rounded-lg border border-slate-200">
        <summary className="cursor-pointer px-4 py-3 font-semibold text-slate-900">
          Student Work Report
        </summary>

        <div className="border-t border-slate-200 p-4">
          {workRecord ? (
            <>
              <TextDetail
                label="Work Performed"
                value={workRecord.work_performed}
              />

              <TextDetail
                label="Outcome"
                value={workRecord.outcome}
              />

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {performanceFields.map((field) => (
                  <Detail
                    key={field.key}
                    label={field.label}
                    value={formatLabel(workRecord[field.key])}
                  />
                ))}

                <Detail
                  label="Increasing Responsibility"
                  value={
                    workRecord.increasing_responsibility === true
                      ? "Yes"
                      : workRecord.increasing_responsibility === false
                        ? "No"
                        : "Not recorded"
                  }
                />

                <Detail
                  label="Recommended Level"
                  value={
                    workRecord.recommended_responsibility_level
                      ? formatLabel(
                          workRecord.recommended_responsibility_level,
                        )
                      : "No recommendation"
                  }
                />
              </div>

              <TextDetail
                label="Support Required"
                value={workRecord.support_required}
              />

              <TextDetail
                label="Supervisor Remarks"
                value={workRecord.supervisor_remarks}
              />

              <p className="mt-4 text-xs text-slate-500">
                Recorded by {getPersonName(workRecord.recorded_by)}
              </p>
            </>
          ) : (
            <p className="text-sm text-amber-700">
              The Site Supervisor has not submitted a work report.
            </p>
          )}
        </div>
      </details>
    </article>
  );
}

function SummaryCard({ label, value, detail, icon: Icon, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {detail}
          </p>
        </div>

        <div className={`rounded-lg p-3 ${tones[tone]}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function Detail({ label, value }) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "Not recorded"
      : value;

  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap break-words text-slate-800">
        {displayValue}
      </p>
    </div>
  );
}

function TextDetail({ label, value }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value === null || value === undefined || value === ""
          ? "Not recorded"
          : value}
      </p>
    </div>
  );
}

function RecordBadge({ label, recorded }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        recorded
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {label}: {recorded ? "Recorded" : "Pending"}
    </span>
  );
}

function StatusBadge({ status }) {
  const tones = {
    planned: "bg-blue-100 text-blue-700",
    active: "bg-emerald-100 text-emerald-700",
    completed: "bg-slate-100 text-slate-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        tones[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

function PageMessage({ message, error = false }) {
  return (
    <main className="p-5 md:p-8">
      <div
        role={error ? "alert" : "status"}
        className={`mx-auto max-w-4xl rounded-xl border p-8 text-center ${
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

function groupByProject(assignments) {
  const groups = new Map();

  for (const assignment of assignments) {
    const project = assignment.project || {};
    const id = project.project_id || "unavailable";

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        title: project.title || "Service Project",
        code: project.code || "",
        project,
        assignments: [],
      });
    }

    groups.get(id).assignments.push(assignment);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      assignments: [...group.assignments].sort(
        (first, second) =>
          String(
            first.student?.full_name || first.student?.email || "",
          ).localeCompare(
            String(
              second.student?.full_name ||
                second.student?.email ||
                "",
            ),
          ) ||
          String(first.schedule?.task_title || "").localeCompare(
            String(second.schedule?.task_title || ""),
          ),
      ),
    }))
    .sort((first, second) =>
      first.title.localeCompare(second.title),
    );
}

function getTodayInNigeria() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const part = (type) =>
    parts.find((item) => item.type === type)?.value;

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function getPersonName(person) {
  return person?.full_name || person?.email || "Not recorded";
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : "Not recorded";
}

function formatDate(value) {
  if (!value) return "Date not specified";

  const text = String(value);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);

  const date = new Date(
    dateOnly ? `${text}T12:00:00+01:00` : text,
  );

  if (Number.isNaN(date.getTime())) return "Date not available";

  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatHours(value) {
  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatLabel(value) {
  if (!value) return "Not recorded";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}