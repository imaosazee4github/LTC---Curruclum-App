import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Timer,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useServiceOversight,
} from "../../hooks/useServiceOversight";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";

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

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    projectFilter,
    setProjectFilter,
  ] = useState("");

  const filteredAssignments =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return oversightAssignments.filter(
        (assignment) => {
          const matchesProject =
            !projectFilter ||
            assignment.project
              ?.project_id ===
              projectFilter;

          const searchableText = [
            assignment.student
              ?.full_name,
            assignment.student
              ?.email,
            assignment.student
              ?.student_number,
            assignment.project
              ?.title,
            assignment.project
              ?.code,
            assignment.schedule
              ?.task_title,
            assignment.team_name,
            assignment.assigned_task,
            assignment.attendance
              ?.attendance_status,
            assignment.work_record
              ?.work_performed,
            assignment.work_record
              ?.outcome,
            assignment.work_record
              ?.supervisor_remarks,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !search ||
            searchableText.includes(
              search,
            );

          return (
            matchesProject &&
            matchesSearch
          );
        },
      );
    }, [
      oversightAssignments,
      projectFilter,
      searchTerm,
    ]);

  if (oversightLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading service oversight..." />
      </SuperAdminLayout>
    );
  }

  if (
    oversightError ||
    !oversightSummary
  ) {
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
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Programme Oversight
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Service Projects and
                Student Reports
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review service projects,
                student assignments,
                attendance, work outcomes
                and reports submitted by
                Site Supervisors.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshOversight()
              }
              disabled={
                oversightFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  oversightFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Active Projects"
              value={
                oversightSummary
                  .activeProjects
              }
              detail={`${oversightSummary.totalProjects} total`}
              icon={BriefcaseBusiness}
              tone="blue"
            />

            <SummaryCard
              label="Assigned Students"
              value={
                oversightSummary
                  .assignedStudents
              }
              detail={`${oversightSummary.scheduledActivities} activities`}
              icon={Users}
              tone="green"
            />

            <SummaryCard
              label="Attendance Pending"
              value={
                oversightSummary
                  .attendancePending
              }
              detail={`${oversightSummary.attendanceRecorded} recorded`}
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Reports Pending"
              value={
                oversightSummary
                  .workReportsPending
              }
              detail={`${oversightSummary.workReportsRecorded} recorded`}
              icon={CheckCircle2}
              tone="purple"
            />

            <SummaryCard
              label="Service Hours"
              value={
                oversightSummary
                  .totalServiceHours
              }
              detail="Recorded hours"
              icon={Timer}
              tone="slate"
            />
          </section>

          <ProjectOverview
            projects={
              oversightProjects
            }
          />

          <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Student Assignment
                Oversight
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Review attendance and
                work reports for every
                assigned student.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_280px]">
                <label className="relative">
                  <span className="sr-only">
                    Search reports
                  </span>

                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(
                      event,
                    ) =>
                      setSearchTerm(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Search student, project, task or report"
                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <select
                  value={
                    projectFilter
                  }
                  onChange={(event) =>
                    setProjectFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    All projects
                  </option>

                  {oversightProjects.map(
                    (project) => (
                      <option
                        key={
                          project.project_id
                        }
                        value={
                          project.project_id
                        }
                      >
                        {project.code}
                        {" — "}
                        {project.title}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {filteredAssignments.length >
            0 ? (
              <div className="grid gap-5 p-5 xl:grid-cols-2">
                {filteredAssignments.map(
                  (assignment) => (
                    <AssignmentReportCard
                      key={
                        assignment
                          .assignment_id
                      }
                      assignment={
                        assignment
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="p-10 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-4 font-bold text-slate-900">
                  No matching reports
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  No student assignments
                  match the current
                  filters.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function ProjectOverview({
  projects,
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="text-xl font-bold text-slate-950">
          Service Project Overview
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Projects and activities created
          by Service Coordinators.
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          {projects.map(
            (project) => (
              <article
                key={
                  project.project_id
                }
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                      {project.code}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                      {project.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {project.location}
                    </p>
                  </div>

                  <StatusBadge
                    status={
                      project.status
                    }
                  />
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <Detail
                    label="Start Date"
                    value={formatDate(
                      project.start_date,
                    )}
                  />

                  <Detail
                    label="Activities"
                    value={
                      project.schedules
                        ?.length || 0
                    }
                  />
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Created by{" "}
                  {getPersonName(
                    project.created_by,
                  )}
                </p>
              </article>
            ),
          )}
        </div>
      ) : (
        <div className="p-10 text-center text-slate-500">
          No service projects have been
          created.
        </div>
      )}
    </section>
  );
}

function AssignmentReportCard({
  assignment,
}) {
  const student =
    assignment.student || {};

  const project =
    assignment.project || {};

  const schedule =
    assignment.schedule || {};

  const attendance =
    assignment.attendance;

  const workRecord =
    assignment.work_record;

  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">
            {student.full_name ||
              student.email ||
              "Student"}
          </h3>

          <p className="mt-1 text-sm font-semibold text-blue-700">
            {project.title ||
              "Service Project"}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {schedule.task_title ||
              "Scheduled Activity"}
            {" • "}
            {formatDate(
              schedule.schedule_date,
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <RecordBadge
            label="Attendance"
            recorded={
              Boolean(attendance)
            }
          />

          <RecordBadge
            label="Report"
            recorded={
              Boolean(workRecord)
            }
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Detail
          label="Team"
          value={
            assignment.team_name ||
            "Not specified"
          }
        />

        <Detail
          label="Responsibility"
          value={formatLabel(
            assignment
              .responsibility_level,
          )}
        />

        <Detail
          label="Assigned Task"
          value={
            assignment.assigned_task ||
            "Not specified"
          }
        />

        <Detail
          label="Assigned By"
          value={getPersonName(
            assignment.assigned_by,
          )}
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
                  value={formatLabel(
                    attendance
                      .attendance_status,
                  )}
                />

                <Detail
                  label="Service Hours"
                  value={
                    attendance
                      .service_hours ??
                    "Not recorded"
                  }
                />

                <Detail
                  label="Arrival"
                  value={formatTime(
                    attendance
                      .arrival_time,
                  )}
                />

                <Detail
                  label="Departure"
                  value={formatTime(
                    attendance
                      .departure_time,
                  )}
                />
              </div>

              <TextDetail
                label="Attendance Remarks"
                value={
                  attendance
                    .attendance_remarks
                }
              />

              <p className="mt-4 text-xs text-slate-500">
                Recorded by{" "}
                {getPersonName(
                  attendance
                    .recorded_by,
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-amber-700">
              Attendance has not been
              recorded.
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
                value={
                  workRecord
                    .work_performed
                }
              />

              <TextDetail
                label="Outcome"
                value={
                  workRecord.outcome
                }
              />

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Detail
                  label="Quality"
                  value={formatLabel(
                    workRecord.quality,
                  )}
                />

                <Detail
                  label="Reliability"
                  value={formatLabel(
                    workRecord
                      .reliability,
                  )}
                />

                <Detail
                  label="Safety"
                  value={formatLabel(
                    workRecord.safety,
                  )}
                />

                <Detail
                  label="Follow-Through"
                  value={formatLabel(
                    workRecord
                      .follow_through,
                  )}
                />

                <Detail
                  label="Response to Feedback"
                  value={formatLabel(
                    workRecord
                      .response_to_feedback,
                  )}
                />

                <Detail
                  label="Independence"
                  value={formatLabel(
                    workRecord
                      .independence,
                  )}
                />

                <Detail
                  label="Increasing Responsibility"
                  value={
                    workRecord
                      .increasing_responsibility
                      ? "Yes"
                      : "No"
                  }
                />

                <Detail
                  label="Recommended Level"
                  value={formatLabel(
                    workRecord
                      .recommended_responsibility_level,
                  )}
                />
              </div>

              <TextDetail
                label="Support Required"
                value={
                  workRecord
                    .support_required
                }
              />

              <TextDetail
                label="Supervisor Remarks"
                value={
                  workRecord
                    .supervisor_remarks
                }
              />

              <p className="mt-4 text-xs text-slate-500">
                Recorded by{" "}
                {getPersonName(
                  workRecord
                    .recorded_by,
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-amber-700">
              The Site Supervisor has
              not submitted a work
              report.
            </p>
          )}
        </div>
      </details>
    </article>
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
    slate:
      "bg-slate-100 text-slate-700",
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

          <p className="mt-1 text-xs text-slate-500">
            {detail}
          </p>
        </div>

        <div
          className={`rounded-lg p-3 ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-slate-800">
        {value || "Not recorded"}
      </p>
    </div>
  );
}

function TextDetail({
  label,
  value,
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value || "Not recorded"}
      </p>
    </div>
  );
}

function RecordBadge({
  label,
  recorded,
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        recorded
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {label}:{" "}
      {recorded
        ? "Recorded"
        : "Pending"}
    </span>
  );
}

function StatusBadge({
  status,
}) {
  const tones = {
    planned:
      "bg-blue-100 text-blue-700",
    active:
      "bg-emerald-100 text-emerald-700",
    completed:
      "bg-slate-100 text-slate-700",
    cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        tones[status] ||
        "bg-slate-100 text-slate-700"
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
    <main className="p-5 md:p-8">
      <div
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

function getPersonName(person) {
  return (
    person?.full_name ||
    person?.email ||
    "Not recorded"
  );
}

function formatTime(value) {
  if (!value) {
    return "Not recorded";
  }

  return String(value).slice(
    0,
    5,
  );
}

function formatDate(value) {
  if (!value) {
    return "Date not specified";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatLabel(value) {
  if (!value) {
    return "Not recorded";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}