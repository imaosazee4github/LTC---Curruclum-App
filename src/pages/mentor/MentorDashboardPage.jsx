import {
  AlertTriangle,
  ClipboardList,
  Clock3,
  ListChecks,
  UserRoundCheck,
} from "lucide-react";

import {
  useMentorDashboard,
} from "../../hooks/useMentorDashboard";

import MentoringLayout from "../../layouts/MentoringLayout";

export default function MentorDashboardPage() {
  const {
    mentorDashboard,
    mentorDashboardLoading,
    mentorDashboardError,
  } = useMentorDashboard();

  if (mentorDashboardLoading) {
    return (
      <MentoringLayout>
        <PageMessage message="Loading your mentor dashboard..." />
      </MentoringLayout>
    );
  }

  if (
    mentorDashboardError ||
    !mentorDashboard
  ) {
    return (
      <MentoringLayout>
        <PageMessage
          error
          message={
            mentorDashboardError?.message ||
            "Your mentor dashboard could not be loaded."
          }
        />
      </MentoringLayout>
    );
  }

  const {
    mentor,
    summary,
    mentees,
    actions,
    recentReports,
  } = mentorDashboard;

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Student Development
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              Mentor Dashboard
            </h1>

            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Monitor your assigned students,
              record developmental feedback and
              complete required follow-up.
            </p>

            {mentor?.specialization && (
              <p className="mt-3 text-sm font-medium text-indigo-700">
                Specialization:{" "}
                {mentor.specialization}
              </p>
            )}
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Assigned Mentees"
              value={
                summary.assignedMentees
              }
              detail={`${mentor?.max_active_mentees || 0} maximum capacity`}
              icon={UserRoundCheck}
              tone="blue"
            />

            <SummaryCard
              label="Check-Ins Due"
              value={
                summary.checkInsDue
              }
              detail={`${summary.overdueCheckIns} overdue`}
              icon={Clock3}
              tone={
                summary.overdueCheckIns >
                0
                  ? "red"
                  : "amber"
              }
            />

            <SummaryCard
              label="Open Follow-Ups"
              value={
                summary.openFollowUps
              }
              detail={`${summary.overdueFollowUps} overdue`}
              icon={ListChecks}
              tone={
                summary.overdueFollowUps >
                0
                  ? "red"
                  : "green"
              }
            />

            <SummaryCard
              label="Needs Attention"
              value={
                summary
                  .studentsNeedingAttention
              }
              detail={`${summary.clarificationRequests} clarification requests`}
              icon={AlertTriangle}
              tone={
                summary
                  .studentsNeedingAttention >
                0
                  ? "red"
                  : "purple"
              }
            />
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="My Mentees"
                description="Students currently assigned to you."
              />

              {mentees.length > 0 ? (
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  {mentees.map(
                    (mentee) => (
                      <MenteeCard
                        key={
                          mentee.assignment_id
                        }
                        mentee={mentee}
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No assigned students"
                  description="Students assigned by the Mentor Department will appear here."
                />
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="My Actions"
                description="Priority mentoring actions and deadlines."
              />

              {actions.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {actions.map(
                    (action) => (
                      <ActionItem
                        key={
                          action.follow_up_id
                        }
                        action={action}
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No open actions"
                  description="Assigned follow-up actions will appear here."
                />
              )}
            </section>
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Recent Reports"
              description="Reports you submitted for your assigned students."
            />

            {recentReports.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {recentReports.map(
                  (report) => (
                    <ReportItem
                      key={
                        report.report_id
                      }
                      report={report}
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                title="No reports submitted"
                description="Your submitted mentor reports will appear here."
              />
            )}
          </section>
        </div>
      </main>
    </MentoringLayout>
  );
}

function MenteeCard({ mentee }) {
  const lastReport =
    mentee.last_report;

  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-start gap-4">
        <ProfilePhoto
          url={
            mentee.profile_photo_url
          }
          name={mentee.full_name}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900">
            {mentee.preferred_name ||
              mentee.full_name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {mentee.student_number ||
              "Student number pending"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {mentee.cohort_name ||
              "Cohort pending"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Detail
          label="Next check-in"
          value={formatDateTime(
            mentee.next_check_in_at,
          )}
        />

        <Detail
          label="Open actions"
          value={
            mentee.open_follow_ups
          }
        />
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        {lastReport ? (
          <>
            <p className="text-xs text-slate-500">
              Latest report
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                value={
                  lastReport.report_type
                }
              />

              <Badge
                value={
                  lastReport.status
                }
              />

              <Badge
                value={
                  lastReport.attention_level
                }
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            No mentor report recorded yet.
          </p>
        )}
      </div>
    </article>
  );
}

function ActionItem({ action }) {
  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">
            {action.title}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {action.student_name}
          </p>

          {action.description && (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {action.description}
            </p>
          )}
        </div>

        <Badge
          value={action.priority}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Due:{" "}
        {formatDateTime(
          action.due_at,
        )}
      </p>
    </article>
  );
}

function ReportItem({ report }) {
  return (
    <article className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-semibold text-slate-900">
          {report.student_name}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <Badge
            value={report.report_type}
          />

          <Badge
            value={
              report.attention_level
            }
          />

          <Badge
            value={report.status}
          />
        </div>

        {report.department_review_notes && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Department note:{" "}
            {
              report
                .department_review_notes
            }
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
        <ClipboardList className="h-4 w-4" />

        {formatDateTime(
          report.submitted_at,
        )}
      </div>
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
      "border-blue-200 bg-blue-50 text-blue-900",
    green:
      "border-green-200 bg-green-50 text-green-900",
    amber:
      "border-amber-200 bg-amber-50 text-amber-900",
    purple:
      "border-purple-200 bg-purple-50 text-purple-900",
    red:
      "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <article
      className={`rounded-xl border p-5 shadow-sm ${
        tones[tone] ||
        tones.blue
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm opacity-75">
          {label}
        </p>

        <Icon className="h-5 w-5 opacity-70" />
      </div>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-xs opacity-75">
        {detail}
      </p>
    </article>
  );
}

function SectionHeader({
  title,
  description,
}) {
  return (
    <header className="border-b border-slate-200 p-5">
      <h2 className="text-lg font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </header>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value ?? 0}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="p-8 text-center">
      <p className="font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ProfilePhoto({
  url,
  name,
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={`${name || "Student"} profile`}
        className="h-12 w-12 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900">
      {getInitials(name)}
    </div>
  );
}

function Badge({ value }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {formatValue(value)}
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
        role={error ? "alert" : "status"}
        className={`mx-auto max-w-3xl rounded-xl border p-6 text-center ${
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

function formatValue(value) {
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

function formatDateTime(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function getInitials(value) {
  if (!value) {
    return "ST";
  }

  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase(),
    )
    .join("");
}