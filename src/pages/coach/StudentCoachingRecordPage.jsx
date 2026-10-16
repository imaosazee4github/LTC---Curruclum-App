import {
  CalendarDays,
  ClipboardList,
  Flag,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

import { useCoachingRecords } from "../../hooks/useCoachingRecords";
import CoachLayout from "../../layouts/CoachLayout";

export default function StudentCoachingRecordPage() {
  const {
    coachingRecordsSummary = {},
    records = [],
    coachingAssignments = [],
    coachingRecordsLoading,
    coachingRecordsFetching,
    coachingRecordsError,
    refreshCoachingRecords,
  } = useCoachingRecords();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("all");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const assignmentOptions = getAssignmentOptions(
    coachingAssignments,
    records,
  );

  const filteredRecords = records.filter((record) => {
    const student = record.student || {};
    const assignment = record.assignment || {};

    const matchesAssignment =
      selectedAssignmentId === "all" ||
      record.assignment_id === selectedAssignmentId;

    const matchesSearch =
      !normalizedSearch ||
      [
        student.full_name,
        student.email,
        assignment.development_area,
        record.session_summary,
        record.feedback,
      ].some((value) =>
        String(value || "").toLowerCase().includes(normalizedSearch),
      );

    return matchesAssignment && matchesSearch;
  });

  const hasFilters =
    Boolean(normalizedSearch) || selectedAssignmentId !== "all";

  if (coachingRecordsLoading) {
    return (
      <CoachLayout>
        <PageMessage message="Loading student coaching records..." />
      </CoachLayout>
    );
  }

  if (coachingRecordsError) {
    return (
      <CoachLayout>
        <PageMessage
          error
          message={
            coachingRecordsError.message ||
            "Unable to load student coaching records."
          }
          onRetry={refreshCoachingRecords}
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
                Coach Portal
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Student Coaching Record
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review recorded coaching sessions, student progress, feedback
                and next steps. Select a student and course to view their
                session history.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => refreshCoachingRecords()}
                disabled={coachingRecordsFetching}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  aria-hidden="true"
                  className={`h-4 w-4 ${
                    coachingRecordsFetching ? "animate-spin" : ""
                  }`}
                />
                {coachingRecordsFetching ? "Refreshing..." : "Refresh"}
              </button>

              <Link
                to="/coach/record"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white transition hover:bg-blue-900"
              >
                <ClipboardList aria-hidden="true" className="h-4 w-4" />
                Record Coaching
              </Link>
            </div>
          </header>

          <section
            aria-label="Coaching history summary"
            className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            <SummaryCard
              label="Total Sessions"
              value={Number(coachingRecordsSummary.totalSessions) || 0}
              description="All recorded coaching sessions."
              icon={ClipboardList}
              tone="blue"
            />

            <SummaryCard
              label="Students Coached"
              value={Number(coachingRecordsSummary.studentsCoached) || 0}
              description="Students with recorded coaching sessions."
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Follow-Up Sessions"
              value={
                Number(coachingRecordsSummary.sessionsWithFollowUp) || 0
              }
              description="Sessions marked as requiring follow-up."
              icon={Flag}
              tone="amber"
            />

            <SummaryCard
              label="Latest Session"
              value={
                coachingRecordsSummary.latestSessionDate
                  ? formatDate(coachingRecordsSummary.latestSessionDate)
                  : "No sessions yet"
              }
              description="Most recently recorded session."
              icon={CalendarDays}
              tone="green"
              compact
            />
          </section>

          <section
            aria-label="Coaching record filters"
            className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div>
                <label
                  htmlFor="record-search"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Search coaching records
                </label>

                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="record-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search student, course, summary or feedback"
                    className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="assignment-filter"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Student and course
                </label>

                <select
                  id="assignment-filter"
                  value={selectedAssignmentId}
                  onChange={(event) =>
                    setSelectedAssignmentId(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All students and courses</option>

                  {assignmentOptions.map((option) => (
                    <option
                      key={option.assignmentId}
                      value={option.assignmentId}
                    >
                      {option.studentName} — {option.developmentArea}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Includes assigned students who have no recorded sessions.
                </p>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedAssignmentId("all");
                }}
                className="mt-4 text-sm font-semibold text-blue-900 hover:underline"
              >
                Clear filters
              </button>
            )}
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-950">
                Coaching Session History
              </h2>

              <p
                aria-live="polite"
                className="mt-1 text-sm text-slate-500"
              >
                Showing {filteredRecords.length} of {records.length} sessions
              </p>
            </div>

            {filteredRecords.length > 0 ? (
              <div className="space-y-5">
                {filteredRecords.map((record) => (
                  <CoachingRecordCard
                    key={record.session_id}
                    record={record}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                filtered={hasFilters}
                hasRecords={records.length > 0}
              />
            )}
          </section>
        </div>
      </main>
    </CoachLayout>
  );
}

function CoachingRecordCard({ record }) {
  const student = record.student || {};
  const assignment = record.assignment || {};

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <ProfilePhoto student={student} />

            <div className="min-w-0">
              <h3 className="break-words font-bold text-slate-950">
                {student.full_name || "Student"}
              </h3>

              <p className="mt-1 break-words text-sm text-slate-500">
                {student.email || "Email not provided"}
              </p>

              <p className="mt-2 break-words text-sm font-semibold text-blue-700">
                {assignment.development_area ||
                  "Course / development area not provided"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-semibold text-slate-900">
              {formatDate(record.session_date)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Session {record.session_number || "record"}
            </p>

            {record.follow_up_required && (
              <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                Follow-Up Required
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <section>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Session Summary
          </p>

          <p className="mt-2 whitespace-pre-wrap break-words leading-7 text-slate-700">
            {record.session_summary || "No session summary was provided."}
          </p>
        </section>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <RecordDetail
            label="Performance"
            value={record.performance}
            tone="blue"
          />
          <RecordDetail
            label="Practice"
            value={record.practice}
            tone="purple"
          />
          <RecordDetail
            label="Feedback"
            value={record.feedback}
            tone="amber"
          />
          <RecordDetail
            label="Progress"
            value={record.progress}
            tone="green"
          />
          <RecordDetail
            label="Improvement"
            value={record.improvement}
            tone="cyan"
          />
          <RecordDetail
            label="Challenges"
            value={record.challenges}
            tone="red"
          />
          <RecordDetail
            label="Support"
            value={record.support}
            tone="indigo"
          />
          <RecordDetail
            label="Next Goal"
            value={record.next_goal}
            tone="emerald"
          />
          <RecordDetail
            label="Practice Adjustment"
            value={record.practice_adjustment}
            tone="orange"
          />
        </div>

        <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-3">
          <SmallDetail label="Coaching Goal" value={assignment.goal} />
          <SmallDetail
            label="Target Date"
            value={formatDate(assignment.target_date)}
          />
          <SmallDetail
            label="Coaching Status"
            value={formatLabel(assignment.status)}
          />
        </div>
      </div>
    </article>
  );
}

function RecordDetail({ label, value, tone }) {
  const tones = {
    blue: "border-blue-200 bg-blue-50",
    purple: "border-purple-200 bg-purple-50",
    amber: "border-amber-200 bg-amber-50",
    green: "border-emerald-200 bg-emerald-50",
    cyan: "border-cyan-200 bg-cyan-50",
    red: "border-red-200 bg-red-50",
    indigo: "border-indigo-200 bg-indigo-50",
    emerald: "border-green-200 bg-green-50",
    orange: "border-orange-200 bg-orange-50",
  };

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SmallDetail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
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
    <div
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700"
    >
      {getInitials(student.full_name)}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
  compact = false,
}) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>

          <p
            className={`mt-3 font-bold text-slate-950 ${
              compact ? "text-xl" : "text-3xl"
            }`}
          >
            {value}
          </p>

          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon aria-hidden="true" className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

function EmptyState({ filtered, hasRecords }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
        <UserRound aria-hidden="true" className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-950">
        {filtered
          ? "No sessions match this selection"
          : "No coaching sessions recorded yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-lg leading-7 text-slate-600">
        {filtered && hasRecords
          ? "Try changing your student and course selection or search term. The selected assignment may not have any sessions yet."
          : "Assigned students can appear in the dropdown before their first session. Record a coaching session to start their session history."}
      </p>

      <Link
        to="/coach/record"
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900"
      >
        <ClipboardList aria-hidden="true" className="h-4 w-4" />
        Record Coaching
      </Link>
    </div>
  );
}

function PageMessage({ message, error = false, onRetry }) {
  return (
    <main className="p-5 md:p-8">
      <div
        role={error ? "alert" : "status"}
        className={`mx-auto max-w-3xl rounded-xl border p-6 ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        <p className="font-semibold">{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={() => onRetry()}
            className="mt-4 rounded-lg bg-blue-950 px-4 py-2 font-semibold text-white"
          >
            Try Again
          </button>
        )}
      </div>
    </main>
  );
}

function getAssignmentOptions(assignments, records) {
  const options = new Map();

  assignments.forEach((assignment) => {
    const assignmentId = assignment.assignment_id || assignment.id;

    if (!assignmentId) return;

    options.set(assignmentId, {
      assignmentId,
      studentName: assignment.student?.full_name || "Student",
      developmentArea:
        assignment.development_area || "Course / Development Area",
    });
  });

  // Keep historical assignments available in the filter.
  records.forEach((record) => {
    const assignmentId = record.assignment_id;

    if (!assignmentId || options.has(assignmentId)) return;

    options.set(assignmentId, {
      assignmentId,
      studentName: record.student?.full_name || "Student",
      developmentArea:
        record.assignment?.development_area || "Course / Development Area",
    });
  });

  return Array.from(options.values()).sort(
    (first, second) =>
      first.studentName.localeCompare(second.studentName) ||
      first.developmentArea.localeCompare(second.developmentArea) ||
      String(first.assignmentId).localeCompare(String(second.assignmentId)),
  );
}

function getInitials(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "ST"
  );
}

function formatLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not provided";

  const text = String(value);
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(text)
      ? `${text}T00:00:00Z`
      : text,
  );

  if (Number.isNaN(date.getTime())) return "Not provided";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}