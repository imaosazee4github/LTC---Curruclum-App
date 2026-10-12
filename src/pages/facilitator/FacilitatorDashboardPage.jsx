import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ListChecks,
  RefreshCw,
  Users,
} from "lucide-react";

import FacilitatorLayout from "../../layouts/FacilitatorLayout";

import {
  useFacilitatorDashboard,
} from "../../hooks/useFacilitatorDashboard";

export default function FacilitatorDashboardPage() {
  const {
    facilitatorDashboard,
    facilitatorDashboardLoading,
    facilitatorDashboardFetching,
    facilitatorDashboardError,
    refreshFacilitatorDashboard,
  } = useFacilitatorDashboard();

  if (facilitatorDashboardLoading) {
    return (
      <FacilitatorLayout>
        <PageMessage message="Loading your facilitator dashboard..." />
      </FacilitatorLayout>
    );
  }

  if (facilitatorDashboardError) {
    return (
      <FacilitatorLayout>
        <PageMessage
          error
          message={
            facilitatorDashboardError
              .message ||
            "Unable to load the facilitator dashboard."
          }
        />
      </FacilitatorLayout>
    );
  }

  if (!facilitatorDashboard) {
    return (
      <FacilitatorLayout>
        <PageMessage
          error
          message="Your facilitator dashboard data could not be found."
        />
      </FacilitatorLayout>
    );
  }

  const {
    facilitator,
    summary,
    experiences,
    upcomingSessions,
    followUps,
  } = facilitatorDashboard;

  return (
    <FacilitatorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Participation & Engagement
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Facilitator Dashboard
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review learning experiences,
                upcoming sessions, student
                participation, resources,
                activities and follow-up needs.
              </p>

              {facilitator?.specialization ? (
                <span className="mt-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  {
                    facilitator.specialization
                  }
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() =>
                refreshFacilitatorDashboard()
              }
              disabled={
                facilitatorDashboardFetching
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  facilitatorDashboardFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              {facilitatorDashboardFetching
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              label="Active Experiences"
              value={
                summary.activeExperiences
              }
              detail="Assigned learning experiences"
              icon={BookOpen}
              tone="blue"
            />

            <SummaryCard
              label="Assigned Students"
              value={
                summary.assignedStudents
              }
              detail="Across your active experiences"
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Upcoming Sessions"
              value={
                summary.upcomingSessions
              }
              detail="Scheduled sessions"
              icon={CalendarDays}
              tone="green"
            />

            <SummaryCard
              label="Resources"
              value={summary.resources}
              detail="Active learning resources"
              icon={FileText}
              tone="cyan"
            />

            <SummaryCard
              label="Activities"
              value={summary.activities}
              detail="Planned and active activities"
              icon={ClipboardCheck}
              tone="amber"
            />

            <SummaryCard
              label="Open Follow-Ups"
              value={
                summary.openFollowUps
              }
              detail="Actions requiring attention"
              icon={ListChecks}
              tone={
                summary.openFollowUps > 0
                  ? "red"
                  : "green"
              }
            />
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="My Learning Experiences"
                description="Learning experiences currently assigned to you."
              />

              {experiences.length > 0 ? (
                <div className="grid gap-5 p-5 lg:grid-cols-2">
                  {experiences.map(
                    (experience) => (
                      <ExperienceCard
                        key={
                          experience
                            .assignment_id
                        }
                        experience={
                          experience
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No learning experiences"
                  description="Your assigned learning experiences will appear here."
                />
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Upcoming Schedule"
                description="Your next scheduled facilitation sessions."
              />

              {upcomingSessions.length >
              0 ? (
                <div className="divide-y divide-slate-200">
                  {upcomingSessions.map(
                    (session) => (
                      <SessionItem
                        key={
                          session.session_id
                        }
                        session={session}
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="No upcoming sessions"
                  description="Scheduled learning-experience sessions will appear here."
                />
              )}
            </section>
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Follow-Up Needed"
              description="Open student concerns and support actions you are responsible for."
            />

            {followUps.length > 0 ? (
              <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
                {followUps.map(
                  (followUp) => (
                    <FollowUpCard
                      key={
                        followUp.follow_up_id
                      }
                      followUp={followUp}
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                icon={ListChecks}
                title="No open follow-ups"
                description="Student support and follow-up actions will appear here."
              />
            )}
          </section>
        </div>
      </main>
    </FacilitatorLayout>
  );
}

function ExperienceCard({
  experience,
}) {
  return (
    <article className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
            {experience.code}
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-950">
            {experience.title}
          </h2>
        </div>

        <StatusBadge
          status={experience.status}
        />
      </div>

      {experience.description ? (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {experience.description}
        </p>
      ) : null}

      <dl className="mt-5 space-y-3">
        <Detail
          label="Assignment Role"
          value={formatLabel(
            experience.assignment_role,
          )}
        />

        <Detail
          label="Delivery"
          value={formatLabel(
            experience.delivery_mode,
          )}
        />

        <Detail
          label="Location"
          value={
            experience.location ||
            "Not specified"
          }
        />

        <Detail
          label="Dates"
          value={formatDateRange(
            experience.start_date,
            experience.end_date,
          )}
        />
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3">
        <SmallStat
          label="Students"
          value={
            experience.student_count
          }
        />

        <SmallStat
          label="Sessions"
          value={
            experience.session_count
          }
        />

        <SmallStat
          label="Follow-Ups"
          value={
            experience
              .open_follow_up_count
          }
        />

        <SmallStat
          label="Resources"
          value={
            experience.resource_count
          }
        />

        <SmallStat
          label="Activities"
          value={
            experience.activity_count
          }
        />
      </div>
    </article>
  );
}

function SessionItem({
  session,
}) {
  return (
    <article className="p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <span className="text-xs font-bold uppercase">
            {formatMonth(
              session.session_date,
            )}
          </span>

          <span className="text-lg font-bold leading-none">
            {formatDay(
              session.session_date,
            )}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
            {session.experience_code}
          </p>

          <h3 className="mt-1 font-bold text-slate-950">
            {session.session_title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {session.experience_title}
          </p>

          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p>
              {formatTime(
                session.start_time,
              )}
              {" – "}
              {formatTime(
                session.end_time,
              )}
            </p>

            <p>
              {formatLabel(
                session.delivery_mode,
              )}

              {session.location
                ? ` • ${session.location}`
                : ""}
            </p>

            <p>
              {session.student_count}{" "}
              student
              {Number(
                session.student_count,
              ) === 1
                ? ""
                : "s"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function FollowUpCard({
  followUp,
}) {
  return (
    <article className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-950">
            {followUp.student_name ||
              "Student"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {
              followUp.experience_title
            }
          </p>
        </div>

        <StatusBadge
          status={followUp.status}
        />
      </div>

      <div className="mt-5 space-y-4">
        <Detail
          label="Concern"
          value={followUp.concern}
        />

        <Detail
          label="Support Required"
          value={
            followUp.support_required
          }
        />

        <Detail
          label="Required Action"
          value={
            followUp.action_required
          }
        />

        <Detail
          label="Due Date"
          value={formatDate(
            followUp.due_date,
          )}
        />
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
      "bg-blue-100 text-blue-700",
    purple:
      "bg-purple-100 text-purple-700",
    green:
      "bg-emerald-100 text-emerald-700",
    cyan:
      "bg-cyan-100 text-cyan-700",
    amber:
      "bg-amber-100 text-amber-700",
    red:
      "bg-red-100 text-red-700",
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
            {detail}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            tones[tone]
          }`}
        >
          <Icon className="h-6 w-6" />
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
    <div className="border-b border-slate-200 px-5 py-4">
      <h2 className="text-lg font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </dt>

      <dd className="mt-1 text-sm leading-6 text-slate-700">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function SmallStat({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-950">
        {Number(value) || 0}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const statusClasses = {
    planned:
      "bg-slate-100 text-slate-700",
    active:
      "bg-emerald-100 text-emerald-700",
    scheduled:
      "bg-blue-100 text-blue-700",
    in_progress:
      "bg-amber-100 text-amber-800",
    completed:
      "bg-purple-100 text-purple-700",
    open:
      "bg-red-100 text-red-700",
    inactive:
      "bg-slate-200 text-slate-600",
    cancelled:
      "bg-slate-200 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${
        statusClasses[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="rounded-full bg-slate-100 p-4 text-slate-500">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
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
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <div
        className={`max-w-lg rounded-xl border px-6 py-5 text-center shadow-sm ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-blue-200 bg-blue-50 text-blue-700"
        }`}
      >
        <p className="font-semibold">
          {message}
        </p>
      </div>
    </main>
  );
}

function formatLabel(value) {
  if (!value) {
    return "Not specified";
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
    return "Not scheduled";
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

function formatDateRange(
  startDate,
  endDate,
) {
  if (!startDate && !endDate) {
    return "Not scheduled";
  }

  if (startDate && !endDate) {
    return `From ${formatDate(
      startDate,
    )}`;
  }

  if (!startDate && endDate) {
    return `Until ${formatDate(
      endDate,
    )}`;
  }

  return `${formatDate(
    startDate,
  )} – ${formatDate(endDate)}`;
}

function formatMonth(value) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      month: "short",
    },
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatDay(value) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "2-digit",
    },
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatTime(value) {
  if (!value) {
    return "Time not set";
  }

  const [
    hourValue,
    minuteValue,
  ] = String(value).split(":");

  const hour =
    Number(hourValue);

  const minute =
    minuteValue || "00";

  const period =
    hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
}