import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  RefreshCw,
  Search,
  Target,
  UserRoundCheck,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useCoachOversight,
} from "../../hooks/useCoachOversight";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";

export default function CoachOversightPage() {
  const {
    coachSummary,
    coaches,
    coachingAssignments,
    coachingSessions,
    coachingFollowUps,
    coachOversightLoading,
    coachOversightFetching,
    coachOversightError,
    refreshCoachOversight,
  } = useCoachOversight();

  const [activeSection, setActiveSection] =
    useState("assignments");

  const [searchTerm, setSearchTerm] =
    useState("");

  const search =
    searchTerm.trim().toLowerCase();

  const filteredCoaches =
    useMemo(() => {
      if (!search) {
        return coaches;
      }

      return coaches.filter((coach) =>
        createSearchText([
          coach.full_name,
          coach.email,
          coach.staff_number,
          coach.job_title,
          coach.specialization,
          coach.availability_status,
        ]).includes(search),
      );
    }, [coaches, search]);

  const filteredAssignments =
    useMemo(() => {
      if (!search) {
        return coachingAssignments;
      }

      return coachingAssignments.filter(
        (assignment) =>
          createSearchText([
            assignment.development_area,
            assignment.goal,
            assignment.current_position,
            assignment.practice_plan,
            assignment.status,
            assignment.student?.full_name,
            assignment.student?.email,
            assignment.student
              ?.student_number,
            assignment.student?.cohort_name,
            assignment.student?.cohort_code,
            assignment.coach?.full_name,
            assignment.coach?.email,
            assignment.coach?.staff_number,
          ]).includes(search),
      );
    }, [coachingAssignments, search]);

  const filteredSessions =
    useMemo(() => {
      if (!search) {
        return coachingSessions;
      }

      return coachingSessions.filter(
        (session) =>
          createSearchText([
            session.session_summary,
            session.performance,
            session.practice,
            session.feedback,
            session.progress,
            session.improvement,
            session.challenges,
            session.support,
            session.next_goal,
            session.practice_adjustment,
            session.student?.full_name,
            session.student?.email,
            session.student
              ?.student_number,
            session.coach?.full_name,
            session.coach?.email,
          ]).includes(search),
      );
    }, [coachingSessions, search]);

  const filteredFollowUps =
    useMemo(() => {
      if (!search) {
        return coachingFollowUps;
      }

      return coachingFollowUps.filter(
        (followUp) =>
          createSearchText([
            followUp.improvement_area,
            followUp.next_goal,
            followUp.action_required,
            followUp.status,
            followUp.outcome,
            followUp.student?.full_name,
            followUp.student?.email,
            followUp.student
              ?.student_number,
            followUp.coach?.full_name,
            followUp.coach?.email,
          ]).includes(search),
      );
    }, [coachingFollowUps, search]);

  if (coachOversightLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading coach oversight..." />
      </SuperAdminLayout>
    );
  }

  if (
    coachOversightError ||
    !coachSummary
  ) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            coachOversightError?.message ||
            "Coach oversight data could not be loaded."
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
                Coach Oversight
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Inspect coach assignments,
                student goals, coaching sessions,
                progress records and required
                follow-up actions.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshCoachOversight()
              }
              disabled={
                coachOversightFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  coachOversightFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <SummaryCard
              label="Coaches"
              value={
                coachSummary.totalCoaches
              }
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Active Assignments"
              value={
                coachSummary
                  .activeAssignments
              }
              icon={UserRoundCheck}
              tone="green"
            />

            <SummaryCard
              label="Paused Assignments"
              value={
                coachSummary
                  .pausedAssignments
              }
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Completed"
              value={
                coachSummary
                  .completedAssignments
              }
              icon={CheckCircle2}
              tone="green"
            />

            <SummaryCard
              label="Active Students"
              value={
                coachSummary.activeStudents
              }
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Overdue Assignments"
              value={
                coachSummary
                  .overdueAssignments
              }
              icon={AlertTriangle}
              tone="red"
            />

            <SummaryCard
              label="Coaching Sessions"
              value={
                coachSummary.totalSessions
              }
              icon={ClipboardList}
              tone="blue"
            />

            <SummaryCard
              label="Follow-Ups Required"
              value={
                coachSummary
                  .followUpsRequired
              }
              icon={Target}
              tone="purple"
            />

            <SummaryCard
              label="Open Follow-Ups"
              value={
                coachSummary.openFollowUps
              }
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Overdue Follow-Ups"
              value={
                coachSummary
                  .overdueFollowUps
              }
              icon={AlertTriangle}
              tone="red"
            />
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <SectionButton
                  label="Assignments"
                  count={
                    coachingAssignments.length
                  }
                  active={
                    activeSection ===
                    "assignments"
                  }
                  onClick={() =>
                    setActiveSection(
                      "assignments",
                    )
                  }
                />

                <SectionButton
                  label="Coaches"
                  count={coaches.length}
                  active={
                    activeSection ===
                    "coaches"
                  }
                  onClick={() =>
                    setActiveSection(
                      "coaches",
                    )
                  }
                />

                <SectionButton
                  label="Sessions"
                  count={
                    coachingSessions.length
                  }
                  active={
                    activeSection ===
                    "sessions"
                  }
                  onClick={() =>
                    setActiveSection(
                      "sessions",
                    )
                  }
                />

                <SectionButton
                  label="Follow-Ups"
                  count={
                    coachingFollowUps.length
                  }
                  active={
                    activeSection ===
                    "follow-ups"
                  }
                  onClick={() =>
                    setActiveSection(
                      "follow-ups",
                    )
                  }
                />
              </div>

              <label className="relative block w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  placeholder="Search coaching records"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </section>

          {activeSection ===
          "assignments" ? (
            <AssignmentsSection
              assignments={
                filteredAssignments
              }
            />
          ) : null}

          {activeSection ===
          "coaches" ? (
            <CoachesSection
              coaches={filteredCoaches}
            />
          ) : null}

          {activeSection ===
          "sessions" ? (
            <SessionsSection
              sessions={
                filteredSessions
              }
            />
          ) : null}

          {activeSection ===
          "follow-ups" ? (
            <FollowUpsSection
              followUps={
                filteredFollowUps
              }
            />
          ) : null}
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function AssignmentsSection({
  assignments,
}) {
  if (!assignments.length) {
    return (
      <EmptyState message="No coaching assignments match the current search." />
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {assignments.map((assignment) => {
        const sessions =
          arrayValue(
            assignment.sessions,
          );

        const followUps =
          arrayValue(
            assignment.follow_ups,
          );

        return (
          <article
            key={assignment.assignment_id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-950">
                    {assignment.student
                      ?.full_name ||
                      "Unnamed student"}
                  </h2>

                  <StatusBadge
                    status={
                      assignment.status
                    }
                  />
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  Coached by{" "}
                  <span className="font-semibold text-blue-900">
                    {assignment.coach
                      ?.full_name ||
                      "Unassigned coach"}
                  </span>
                </p>

                <p className="mt-3 text-sm font-semibold text-amber-700">
                  {assignment.development_area}
                </p>
              </div>

              <div className="text-sm text-slate-600 lg:text-right">
                <p>
                  Started{" "}
                  {formatDate(
                    assignment.start_date,
                  )}
                </p>

                <p className="mt-1">
                  Target:{" "}
                  {assignment.target_date
                    ? formatDate(
                        assignment.target_date,
                      )
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <TextDetail
                label="Coaching Goal"
                value={assignment.goal}
              />

              <TextDetail
                label="Current Position"
                value={
                  assignment.current_position
                }
              />

              <TextDetail
                label="Practice Plan"
                value={
                  assignment.practice_plan
                }
              />

              <TextDetail
                label="Closing Notes"
                value={
                  assignment.closing_notes
                }
              />
            </div>

            <div className="grid gap-4 border-t border-slate-100 bg-slate-50 p-5 sm:grid-cols-2">
              <CountCard
                label="Recorded Sessions"
                value={sessions.length}
              />

              <CountCard
                label="Follow-Up Actions"
                value={followUps.length}
              />
            </div>

            <details className="border-t border-slate-200">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-blue-950">
                Inspect coaching activity
              </summary>

              <div className="grid gap-5 border-t border-slate-100 bg-slate-50 p-5 lg:grid-cols-2">
                <DetailList
                  title="Coaching Sessions"
                  emptyMessage="No coaching sessions recorded."
                  items={sessions.map(
                    (session) => ({
                      key:
                        session.session_id,
                      title:
                        session.session_number
                          ? `Session ${session.session_number}`
                          : "Coaching Session",
                      detail: [
                        formatDate(
                          session.session_date,
                        ),
                        session
                          .session_summary,
                      ]
                        .filter(Boolean)
                        .join(" • "),
                    }),
                  )}
                />

                <DetailList
                  title="Follow-Up Actions"
                  emptyMessage="No follow-up actions recorded."
                  items={followUps.map(
                    (followUp) => ({
                      key:
                        followUp.follow_up_id,
                      title:
                        followUp
                          .improvement_area ||
                        "Follow-Up",
                      detail: [
                        formatLabel(
                          followUp.status,
                        ),
                        followUp.due_date
                          ? `Due ${formatDate(
                              followUp.due_date,
                            )}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" • "),
                    }),
                  )}
                />
              </div>
            </details>
          </article>
        );
      })}
    </section>
  );
}

function CoachesSection({
  coaches,
}) {
  if (!coaches.length) {
    return (
      <EmptyState message="No coaches match the current search." />
    );
  }

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {coaches.map((coach) => (
        <article
          key={coach.staff_profile_id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <ProfileAvatar
              person={coach}
            />

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-950">
                {coach.full_name ||
                  "Unnamed coach"}
              </h2>

              <p className="truncate text-sm text-slate-600">
                {coach.email ||
                  "No email"}
              </p>

              <p className="mt-2 text-sm font-semibold text-blue-800">
                {coach.staff_number ||
                  "No staff number"}
              </p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
            <DetailRow
              label="Job title"
              value={
                coach.job_title ||
                "Not provided"
              }
            />

            <DetailRow
              label="Specialization"
              value={
                coach.specialization ||
                "Not provided"
              }
            />

            <DetailRow
              label="Availability"
              value={formatLabel(
                coach.availability_status,
              )}
            />

            <DetailRow
              label="Active assignments"
              value={
                coach.active_assignment_count ??
                0
              }
            />

            <DetailRow
              label="Completed assignments"
              value={
                coach.completed_assignment_count ??
                0
              }
            />

            <DetailRow
              label="Sessions"
              value={
                coach.session_count ?? 0
              }
            />

            <DetailRow
              label="Open follow-ups"
              value={
                coach.open_follow_up_count ??
                0
              }
            />
          </dl>
        </article>
      ))}
    </section>
  );
}

function SessionsSection({
  sessions,
}) {
  if (!sessions.length) {
    return (
      <EmptyState message="No coaching sessions match the current search." />
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {sessions.map((session) => (
        <article
          key={session.session_id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {session.session_number
                  ? `Coaching Session ${session.session_number}`
                  : "Coaching Session"}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {session.student?.full_name ||
                  "Unnamed student"}
                {" • "}
                Coach:{" "}
                {session.coach?.full_name ||
                  "Unnamed coach"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {formatDate(
                  session.session_date,
                )}
              </span>

              {session.follow_up_required ? (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                  Follow-up required
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  No follow-up required
                </span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <TextDetail
              label="Session Summary"
              value={
                session.session_summary
              }
            />
          </div>

          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2 xl:grid-cols-3">
            <TextDetail
              label="Performance"
              value={session.performance}
            />

            <TextDetail
              label="Practice"
              value={session.practice}
            />

            <TextDetail
              label="Feedback"
              value={session.feedback}
            />

            <TextDetail
              label="Progress"
              value={session.progress}
            />

            <TextDetail
              label="Improvement"
              value={session.improvement}
            />

            <TextDetail
              label="Challenges"
              value={session.challenges}
            />

            <TextDetail
              label="Support"
              value={session.support}
            />

            <TextDetail
              label="Next Goal"
              value={session.next_goal}
            />

            <TextDetail
              label="Practice Adjustment"
              value={
                session.practice_adjustment
              }
            />
          </div>
        </article>
      ))}
    </section>
  );
}

function FollowUpsSection({
  followUps,
}) {
  if (!followUps.length) {
    return (
      <EmptyState message="No coaching follow-ups match the current search." />
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {followUps.map((followUp) => (
        <article
          key={followUp.follow_up_id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {followUp.student?.full_name ||
                  "Unnamed student"}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Coach:{" "}
                {followUp.coach?.full_name ||
                  "Unnamed coach"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                status={followUp.status}
              />

              {followUp.due_date ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Due{" "}
                  {formatDate(
                    followUp.due_date,
                  )}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextDetail
              label="Improvement Area"
              value={
                followUp.improvement_area
              }
            />

            <TextDetail
              label="Next Goal"
              value={followUp.next_goal}
            />

            <TextDetail
              label="Action Required"
              value={
                followUp.action_required
              }
            />

            <TextDetail
              label="Outcome"
              value={followUp.outcome}
            />
          </div>
        </article>
      ))}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}) {
  const tones = {
    blue: "bg-blue-100 text-blue-800",
    green:
      "bg-emerald-100 text-emerald-800",
    amber:
      "bg-amber-100 text-amber-800",
    purple:
      "bg-violet-100 text-violet-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          tones[tone] || tones.blue
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-600">
        {label}
      </p>
    </article>
  );
}

function SectionButton({
  label,
  count,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-blue-950 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label} ({count})
    </button>
  );
}

function CountCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-600">
        {label}
      </p>
    </div>
  );
}

function DetailList({
  title,
  items,
  emptyMessage,
}) {
  return (
    <div>
      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      {items.length ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <p className="font-semibold text-slate-900">
                {item.title}
              </p>

              {item.detail ? (
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {item.detail}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

function TextDetail({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">
        {label}
      </dt>

      <dd className="text-right font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function ProfileAvatar({
  person,
}) {
  if (person.profile_photo_url) {
    return (
      <img
        src={person.profile_photo_url}
        alt={`${
          person.full_name || "Coach"
        } profile`}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
      {getInitials(
        person.full_name ||
          person.email,
      )}
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const value =
    status || "unknown";

  const color =
    value === "active" ||
    value === "completed"
      ? "bg-emerald-100 text-emerald-800"
      : value === "paused" ||
          value === "open" ||
          value === "in_progress"
        ? "bg-amber-100 text-amber-800"
        : value === "cancelled"
          ? "bg-red-100 text-red-800"
          : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {formatLabel(value)}
    </span>
  );
}

function EmptyState({
  message,
}) {
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <ClipboardList className="mx-auto h-10 w-10 text-slate-400" />

      <p className="mt-4 font-semibold text-slate-700">
        {message}
      </p>
    </section>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
        className={`mx-auto max-w-4xl rounded-2xl border p-8 text-center ${
          error
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        {message}
      </div>
    </main>
  );
}

function arrayValue(value) {
  return Array.isArray(value)
    ? value
    : [];
}

function createSearchText(values) {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(value) {
  if (!value) {
    return "Date not provided";
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

function getInitials(value) {
  return String(value || "CO")
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