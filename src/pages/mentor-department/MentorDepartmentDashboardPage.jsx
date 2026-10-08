import {
  AlertTriangle,
  ClipboardCheck,
  Clock3,
  UserRoundCheck,
  Users,
} from "lucide-react";

import {
  useMentorDepartment,
} from "../../hooks/useMentorDepartment";

import MentoringLayout from "../../layouts/MentoringLayout";

export default function MentorDepartmentDashboardPage() {
  const {
    mentorDepartmentDashboard,
    mentorDepartmentLoading,
    mentorDepartmentError,
  } = useMentorDepartment();

  if (mentorDepartmentLoading) {
    return (
      <MentoringLayout>
        <PageMessage message="Loading Mentor Department dashboard..." />
      </MentoringLayout>
    );
  }

  if (
    mentorDepartmentError ||
    !mentorDepartmentDashboard
  ) {
    return (
      <MentoringLayout>
        <PageMessage
          error
          message={
            mentorDepartmentError?.message ||
            "The Mentor Department dashboard could not be loaded."
          }
        />
      </MentoringLayout>
    );
  }

  const {
    summary,
    mentorWorkload,
    recentReports,
  } = mentorDepartmentDashboard;

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Mentoring Operations
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              Mentor Department Dashboard
            </h1>

            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Manage mentor capacity,
              student assignments, report
              review and required follow-up.
            </p>
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Active Mentors"
              value={
                summary.activeMentors
              }
              detail={`${summary.availableMentors} available`}
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Active Assignments"
              value={
                summary.activeAssignments
              }
              detail="Current mentoring relationships"
              icon={UserRoundCheck}
              tone="green"
            />

            <SummaryCard
              label="Awaiting Assignment"
              value={
                summary
                  .studentsAwaitingAssignment
              }
              detail="Students requiring mentors"
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Reports to Review"
              value={
                summary
                  .reportsAwaitingReview
              }
              detail={`${summary.urgentReports} urgent`}
              icon={ClipboardCheck}
              tone={
                summary.urgentReports > 0
                  ? "red"
                  : "purple"
              }
            />
          </section>

          <section className="mt-5 grid gap-5 sm:grid-cols-3">
            <StatusCard
              label="Open Follow-Ups"
              value={
                summary.openFollowUps
              }
            />

            <StatusCard
              label="Overdue Follow-Ups"
              value={
                summary.overdueFollowUps
              }
              warning={
                summary.overdueFollowUps >
                0
              }
            />

            <StatusCard
              label="Overdue Check-Ins"
              value={
                summary.overdueCheckIns
              }
              warning={
                summary.overdueCheckIns >
                0
              }
            />
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Mentor Workload"
                description="Current mentor capacity, assignments and overdue actions."
              />

              {mentorWorkload.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-4">
                          Mentor
                        </th>

                        <th className="px-5 py-4">
                          Availability
                        </th>

                        <th className="px-5 py-4">
                          Workload
                        </th>

                        <th className="px-5 py-4">
                          Overdue
                        </th>

                        <th className="px-5 py-4">
                          Follow-Ups
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {mentorWorkload.map(
                        (mentor) => (
                          <MentorRow
                            key={
                              mentor.mentor_profile_id
                            }
                            mentor={mentor}
                          />
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No mentors available"
                  description="Appointed mentors and their workload will appear here."
                />
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Priority Alerts"
                description="Items requiring department attention."
              />

              <div className="space-y-4 p-5">
                <AlertItem
                  label="Urgent reports"
                  value={
                    summary.urgentReports
                  }
                  urgent={
                    summary.urgentReports >
                    0
                  }
                />

                <AlertItem
                  label="Overdue follow-ups"
                  value={
                    summary
                      .overdueFollowUps
                  }
                  urgent={
                    summary
                      .overdueFollowUps >
                    0
                  }
                />

                <AlertItem
                  label="Overdue check-ins"
                  value={
                    summary
                      .overdueCheckIns
                  }
                  urgent={
                    summary
                      .overdueCheckIns >
                    0
                  }
                />

                <AlertItem
                  label="Students awaiting mentors"
                  value={
                    summary
                      .studentsAwaitingAssignment
                  }
                />
              </div>
            </section>
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Recent Mentor Reports"
              description="Latest reports submitted by assigned mentors."
            />

            {recentReports.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {recentReports.map(
                  (report) => (
                    <ReportRow
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
                title="No mentor reports"
                description="Submitted mentor reports will appear here for department review."
              />
            )}
          </section>
        </div>
      </main>
    </MentoringLayout>
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

function StatusCard({
  label,
  value,
  warning = false,
}) {
  return (
    <article
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        warning
          ? "border-red-200"
          : "border-slate-200"
      }`}
    >
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          warning
            ? "text-red-700"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </article>
  );
}

function MentorRow({ mentor }) {
  return (
    <tr className="text-sm">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <ProfilePhoto
            url={
              mentor.profile_photo_url
            }
            name={mentor.full_name}
          />

          <div>
            <p className="font-semibold text-slate-900">
              {mentor.full_name ||
                "Unnamed mentor"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {mentor.specialization ||
                "Specialization not added"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <Badge
          value={
            mentor.availability_status
          }
        />
      </td>

      <td className="px-5 py-4 text-slate-700">
        {mentor.active_mentees}/
        {mentor.max_active_mentees}
      </td>

      <td className="px-5 py-4">
        <Count
          value={
            mentor.overdue_check_ins
          }
        />
      </td>

      <td className="px-5 py-4">
        <Count
          value={
            mentor.open_follow_ups
          }
        />
      </td>
    </tr>
  );
}

function ReportRow({ report }) {
  return (
    <article className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">
            {report.student_name}
          </p>

          <Badge
            value={
              report.attention_level
            }
          />
        </div>

        <p className="mt-2 text-sm text-slate-600">
          {formatValue(
            report.report_type,
          )}
          {" · "}
          Mentor:{" "}
          {report.mentor_name}
        </p>
      </div>

      <div className="text-left md:text-right">
        <Badge
          value={report.status}
        />

        <p className="mt-2 text-xs text-slate-500">
          {formatDate(
            report.submitted_at,
          )}
        </p>
      </div>
    </article>
  );
}

function AlertItem({
  label,
  value,
  urgent = false,
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 ${
        urgent
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          className={`h-5 w-5 ${
            urgent
              ? "text-red-600"
              : "text-slate-400"
          }`}
        />

        <p className="text-sm font-medium text-slate-700">
          {label}
        </p>
      </div>

      <span
        className={`font-bold ${
          urgent
            ? "text-red-700"
            : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
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
        alt={`${name || "Mentor"} profile`}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
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

function Count({ value }) {
  const numericValue =
    Number(value) || 0;

  return (
    <span
      className={
        numericValue > 0
          ? "font-semibold text-red-700"
          : "text-slate-500"
      }
    >
      {numericValue}
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

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function getInitials(value) {
  if (!value) {
    return "M";
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