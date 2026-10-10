import {
  CalendarCheck,
  ClipboardCheck,
  Target,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";

import {
  useCoachDashboard,
} from "../../hooks/useCoachDashboard";

import CoachLayout from "../../layouts/CoachLayout";

export default function CoachDashboardPage() {
  const {
    coachDashboard,
    coachDashboardLoading,
    coachDashboardError,
  } = useCoachDashboard();

  if (coachDashboardLoading) {
    return (
      <CoachLayout>
        <PageMessage message="Loading Coach Dashboard..." />
      </CoachLayout>
    );
  }

  if (
    coachDashboardError ||
    !coachDashboard
  ) {
    return (
      <CoachLayout>
        <PageMessage
          error
          message={
            coachDashboardError
              ?.message ||
            "The Coach Dashboard could not be loaded."
          }
        />
      </CoachLayout>
    );
  }

  const {
    coach,
    summary,
    assignments,
    recentSessions,
    followUps,
  } = coachDashboard;

  return (
    <CoachLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Capability Development
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              Coach Dashboard
            </h1>

            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Review coaching assignments,
              student goals, practice,
              progress and follow-up needs.
            </p>

            {coach?.specialization ? (
              <span className="mt-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {coach.specialization}
              </span>
            ) : null}
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Active Assignments"
              value={
                summary.activeAssignments
              }
              detail={`${summary.pausedAssignments} paused`}
              icon={UserRoundCheck}
              tone="blue"
            />

            <SummaryCard
              label="Goals Due"
              value={
                summary.goalsDue
              }
              detail={`${summary.overdueGoals} overdue`}
              icon={Target}
              tone={
                summary.overdueGoals > 0
                  ? "red"
                  : "green"
              }
            />

            <SummaryCard
              label="Sessions This Month"
              value={
                summary.sessionsThisMonth
              }
              detail="Recorded coaching sessions"
              icon={CalendarCheck}
              tone="purple"
            />

            <SummaryCard
              label="Open Follow-Ups"
              value={
                summary.openFollowUps
              }
              detail={`${summary.overdueFollowUps} overdue`}
              icon={ClipboardCheck}
              tone={
                summary
                  .overdueFollowUps > 0
                  ? "red"
                  : "amber"
              }
            />
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="My Coaching Assignments"
              description="Students assigned to you and their current development goals."
            />

            {assignments.length > 0 ? (
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                {assignments.map(
                  (assignment) => (
                    <AssignmentCard
                      key={
                        assignment.assignment_id
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
                icon={UserRoundCheck}
                title="No coaching assignments"
                description="Students assigned by the Super Administrator will appear here."
              />
            )}
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Recent Coaching Sessions"
                description="Your latest student coaching records."
              />

              {recentSessions.length >
              0 ? (
                <div className="divide-y divide-slate-200">
                  {recentSessions.map(
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
                  icon={TrendingUp}
                  title="No coaching sessions"
                  description="Recorded coaching sessions will appear here."
                />
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Follow-Up Needed"
                description="Open actions requiring continued coaching support."
              />

              {followUps.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {followUps.map(
                    (followUp) => (
                      <FollowUpItem
                        key={
                          followUp.follow_up_id
                        }
                        followUp={
                          followUp
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={ClipboardCheck}
                  title="No open follow-ups"
                  description="Student coaching follow-ups will appear here."
                />
              )}
            </section>
          </div>
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
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-bold text-slate-950">
            {student.full_name ||
              "Student"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {student.student_number ||
              student.email ||
              "Student record"}
          </p>
        </div>

        <StatusBadge
          status={assignment.status}
        />
      </div>

      <dl className="mt-5 space-y-4">
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
      </dl>

      <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3">
        <SmallStat
          label="Target Date"
          value={formatDate(
            assignment.target_date,
          )}
        />

        <SmallStat
          label="Sessions"
          value={
            assignment.session_count
          }
        />

        <SmallStat
          label="Follow-Ups"
          value={
            assignment
              .open_follow_up_count
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">
            {session.student_name ||
              "Student"}
          </p>

          <p className="mt-1 text-sm text-blue-700">
            {session.development_area}
          </p>
        </div>

        <span className="text-sm font-semibold text-slate-500">
          {formatDate(
            session.session_date,
          )}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {session.session_summary}
      </p>

      {session.progress ? (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Progress
          </p>

          <p className="mt-1 text-sm text-emerald-900">
            {session.progress}
          </p>
        </div>
      ) : null}

      {session.follow_up_required ? (
        <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-800">
          Follow-Up Required
        </span>
      ) : null}
    </article>
  );
}

function FollowUpItem({
  followUp,
}) {
  return (
    <article className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">
            {followUp.student_name ||
              "Student"}
          </p>

          <p className="mt-1 text-sm font-semibold text-amber-700">
            {
              followUp.improvement_area
            }
          </p>
        </div>

        <StatusBadge
          status={followUp.status}
        />
      </div>

      <div className="mt-4 space-y-3">
        <Detail
          label="Required Action"
          value={
            followUp.action_required
          }
        />

        <Detail
          label="Next Goal"
          value={
            followUp.next_goal
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
    green:
      "bg-emerald-100 text-emerald-700",
    purple:
      "bg-purple-100 text-purple-700",
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
    <div className="border-b border-slate-200 px-5 py-5">
      <h2 className="text-xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-600">
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
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 text-sm leading-6 text-slate-700">
        {value || "Not recorded"}
      </dd>
    </div>
  );
}

function SmallStat({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {value ?? 0}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const styles = {
    active:
      "bg-emerald-100 text-emerald-700",
    paused:
      "bg-amber-100 text-amber-800",
    open:
      "bg-blue-100 text-blue-700",
    in_progress:
      "bg-purple-100 text-purple-700",
    completed:
      "bg-emerald-100 text-emerald-700",
    cancelled:
      "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        styles[status] ||
        styles.cancelled
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
    <div className="p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
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
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div
        className={`max-w-xl rounded-xl border px-6 py-5 text-center ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not set";
  }

  const [
    year,
    month,
    day,
  ] = String(value)
    .slice(0, 10)
    .split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return String(value);
  }

  return `${day}/${month}/${year}`;
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