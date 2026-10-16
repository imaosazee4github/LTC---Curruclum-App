import { useState } from "react";

import StudentLayout from "../../layouts/StudentLayout";
import { useStudentCoaching } from "../../hooks/useStudentCoaching";

export default function StudentCoachingPage() {
  const {
    assignments,
    sessions,
    followUps,
    loading,
    fetching,
    error,
    refresh,
  } = useStudentCoaching();

  const [selectedAssignment, setSelectedAssignment] = useState("all");

  const matchesAssignment = (item) =>
    selectedAssignment === "all" ||
    item.assignment_id === selectedAssignment;

  const visibleAssignments = assignments.filter(matchesAssignment);
  const visibleSessions = sessions.filter(matchesAssignment);
  const visibleFollowUps = followUps.filter(matchesAssignment);

  const openFollowUps = visibleFollowUps.filter(
    (item) => item.status === "open" || item.status === "in_progress",
  );

  return (
    <StudentLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Student Portal
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                My Coaching
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                View your course coaches, coaching feedback, practice plans
                and follow-up actions. These are records of coaching already
                provided, separate from your daily timetable.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refresh()}
              disabled={fetching}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              {fetching ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {loading ? (
            <p role="status" className="mt-8 text-slate-600">
              Loading your coaching records...
            </p>
          ) : error ? (
            <div
              role="alert"
              className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
            >
              {error.message || "Your coaching records could not be loaded."}
            </div>
          ) : (
            <>
              <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
                <label
                  htmlFor="coaching-course"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Course and coach
                </label>

                <select
                  id="coaching-course"
                  value={selectedAssignment}
                  onChange={(event) =>
                    setSelectedAssignment(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="all">All courses and coaches</option>

                  {assignments.map((assignment) => (
                    <option
                      key={assignment.assignment_id}
                      value={assignment.assignment_id}
                    >
                      {assignment.course_title} —{" "}
                      {assignment.coach_name || "Coach"}
                    </option>
                  ))}
                </select>
              </section>

              <section
                aria-label="Coaching summary"
                className="mt-6 grid gap-4 sm:grid-cols-3"
              >
                <Summary
                  label="Active Coaching Assignments"
                  value={
                    visibleAssignments.filter(
                      (item) => item.status === "active",
                    ).length
                  }
                />
                <Summary
                  label="Recorded Sessions"
                  value={visibleSessions.length}
                />
                <Summary
                  label="Open Follow-Ups"
                  value={openFollowUps.length}
                />
              </section>

              <Section title="My Coaches">
                {visibleAssignments.length === 0 ? (
                  <Empty message="Your coaches will appear when they are assigned to your enrolled courses." />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {visibleAssignments.map((assignment) => (
                      <article
                        key={assignment.assignment_id}
                        className="rounded-xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-blue-950">
                              {assignment.course_title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              Coach: {assignment.coach_name || "Not provided"}
                            </p>
                          </div>

                          <Status value={assignment.status} />
                        </div>

                        <Detail label="Goal" value={assignment.goal} />
                        <Detail
                          label="Practice Plan"
                          value={assignment.practice_plan}
                        />
                        <Detail
                          label="Target Date"
                          value={formatDate(assignment.target_date)}
                        />
                      </article>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Follow-Up Actions">
                {visibleFollowUps.length === 0 ? (
                  <Empty message="No coaching follow-up actions have been recorded for this selection." />
                ) : (
                  <div className="space-y-4">
                    {visibleFollowUps.map((followUp) => {
                      const overdue =
                        ["open", "in_progress"].includes(followUp.status) &&
                        followUp.due_date &&
                        followUp.due_date < getTodayInNigeria();

                      return (
                        <article
                          key={followUp.follow_up_id}
                          className={`rounded-xl border bg-white p-5 ${
                            overdue
                              ? "border-red-300"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-blue-950">
                                {followUp.course_title}
                              </h3>
                              <p className="mt-1 text-sm text-slate-600">
                                Coach: {followUp.coach_name || "Not provided"}
                              </p>
                            </div>

                            <Status value={followUp.status} />
                          </div>

                          <Detail
                            label="Action Required"
                            value={followUp.action_required}
                          />
                          <Detail
                            label="Next Goal"
                            value={followUp.next_goal}
                          />
                          <Detail
                            label="Due Date"
                            value={formatDate(followUp.due_date)}
                          />

                          {overdue && (
                            <p className="mt-3 text-sm font-semibold text-red-700">
                              This action is overdue. Check with your coach
                              about the next step.
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </Section>

              <Section title="Coaching Session History">
                {visibleSessions.length === 0 ? (
                  <Empty message="Your feedback will appear here after your coach records a session." />
                ) : (
                  <div className="space-y-4">
                    {visibleSessions.map((session) => (
                      <article
                        key={session.session_id}
                        className="rounded-xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-blue-950">
                              {session.course_title}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                              Coach: {session.coach_name || "Not provided"}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-slate-600">
                            {formatDate(session.session_date)}
                          </p>
                        </div>

                        <Detail label="Feedback" value={session.feedback} />
                        <Detail label="Practice" value={session.practice} />
                        <Detail label="Next Goal" value={session.next_goal} />
                        <Detail
                          label="Practice Adjustment"
                          value={session.practice_adjustment}
                        />

                        {session.follow_up_required && (
                          <p className="mt-4 text-sm text-amber-800">
                            A follow-up was requested for this session.
                            Check Follow-Up Actions for its current status.
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      </main>
    </StudentLayout>
  );
}

function Summary({ label, value }) {
  return (
    <article className="rounded-xl border border-blue-100 bg-blue-50 p-5">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-blue-950">{value}</p>
    </article>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-bold text-blue-950">{title}</h2>
      {children}
    </section>
  );
}

function Detail({ label, value }) {
  if (!value) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function Status({ value }) {
  const tones = {
    active: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    open: "bg-amber-100 text-amber-800",
    in_progress: "bg-blue-100 text-blue-800",
    paused: "bg-slate-100 text-slate-700",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        tones[value] || "bg-slate-100 text-slate-700"
      }`}
    >
      {String(value || "Unknown").replaceAll("_", " ")}
    </span>
  );
}

function Empty({ message }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm leading-7 text-slate-600">
      {message}
    </p>
  );
}

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
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