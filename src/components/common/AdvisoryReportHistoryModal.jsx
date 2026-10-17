import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, RefreshCw, X } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

const weekTitles = {
  1: "Welcome and Adjustment",
  2: "Emotional Well-Being",
  3: "Social Connection and Belonging",
  4: "Physical Well-Being and Daily Routines",
  5: "Academic and Personal Development",
  6: "Spiritual Well-Being and Personal Values",
  7: "Personal Challenges and Support Systems",
  8: "Review, Progress, and Transition",
};

const wellbeingLabels = {
  1: "Very Difficult",
  2: "Difficult",
  3: "Fair",
  4: "Good",
  5: "Very Good",
};

async function getReports(assignmentId) {
  const { data, error } = await supabase.rpc(
    "get_my_advisory_student_reports",
    {
      p_assignment_id: assignmentId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("The student's reports could not be loaded.");
  }

  return Array.isArray(data.reports) ? data.reports : [];
}

export default function AdvisoryReportHistoryModal({
  student,
  onClose,
}) {
  const dialogRef = useRef(null);
  const { profile, role } = useAuth();

  const reportsQuery = useQuery({
    queryKey: [
      "advisory-student-reports",
      profile?.id,
      student.assignment_id,
    ],
    queryFn: () => getReports(student.assignment_id),
    enabled:
      Boolean(profile?.id) &&
      Boolean(student.assignment_id) &&
      role === "mentor",
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const reports = reportsQuery.data || [];
  const name =
    student.full_name || student.preferred_name || "Student";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="advisory-history-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
            Advisory Report History
          </p>

          <h2
            id="advisory-history-title"
            className="mt-2 text-2xl font-bold text-blue-950"
          >
            {name}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Read submitted conversations and Advisory Department
            review notes for this assignment.
          </p>
        </div>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close report history"
          className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </header>

      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <p className="text-sm text-slate-600">
          {reportsQuery.isPending
            ? "Loading reports..."
            : `${reports.length} ${
                reports.length === 1 ? "report" : "reports"
              }`}
        </p>

        <button
          type="button"
          onClick={() => reportsQuery.refetch()}
          disabled={reportsQuery.isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
            className={reportsQuery.isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="space-y-5 p-6">
        {reportsQuery.isError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {reportsQuery.error.message}
          </p>
        )}

        {reportsQuery.isPending ? (
          <p role="status" className="py-8 text-center text-slate-500">
            Loading report history...
          </p>
        ) : reports.length ? (
          reports.map((report, index) => (
            <ReportEntry
              key={report.report_id}
              report={report}
              initiallyOpen={index === 0}
            />
          ))
        ) : !reportsQuery.isError ? (
          <div className="py-12 text-center">
            <FileText
              size={40}
              aria-hidden="true"
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold">
              No submitted reports yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Recorded check-ins and follow-ups will appear here.
            </p>
          </div>
        ) : null}
      </div>

      <footer className="flex justify-end border-t border-slate-200 p-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white"
        >
          Close
        </button>
      </footer>
    </dialog>
  );
}

function ReportEntry({ report, initiallyOpen }) {
  const week = Number(report.programme_week);
  const weekly = Number.isInteger(week) && week >= 1 && week <= 8;

  const responses = Array.isArray(report.checkin_responses)
    ? report.checkin_responses.filter(
        (response) =>
          typeof response?.question === "string" &&
          typeof response?.answer === "string" &&
          response.answer.trim(),
      )
    : [];

  return (
    <details
      open={initiallyOpen}
      className="overflow-hidden rounded-xl border border-slate-200"
    >
      <summary className="cursor-pointer bg-slate-50 p-5 focus-visible:outline-blue-700">
        <span className="font-bold text-blue-950">
          {formatLabel(report.report_type)}
          {weekly && ` · Week ${week}`}
        </span>

        <span className="ml-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
          {formatLabel(report.status)}
        </span>

        <span className="mt-2 block text-sm text-slate-600">
          {weekly
            ? `${weekTitles[week]} · ${formatDate(
                report.conversation_date,
              )}`
            : `Submitted ${formatDateTime(report.submitted_at)}`}
        </span>
      </summary>

      <div className="space-y-5 border-t border-slate-200 p-5">
        <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          <Detail
            label="Submitted by"
            value={report.submitted_by_name || "Name unavailable"}
          />

          <Detail
            label="Submitted"
            value={formatDateTime(report.submitted_at)}
          />

          <Detail
            label="Confidentiality"
            value={formatLabel(report.confidentiality_level)}
          />

          {weekly && (
            <Detail
              label="Well-being rating"
              value={formatWellbeing(report.wellbeing_rating)}
            />
          )}
        </div>

        {weekly ? (
          <>
            <section>
              <h3 className="font-bold text-blue-950">
                Recorded Questions and Answers
              </h3>

              {responses.length ? (
                <ol className="mt-4 space-y-4">
                  {responses.map((response, index) => (
                    <li
                      key={`${response.id || "answer"}-${index}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <h4 className="font-semibold leading-6">
                        {index + 1}. {response.question}
                      </h4>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                        {response.answer}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No individual answers were recorded.
                </p>
              )}
            </section>

            <TextSection
              title="Conversation Summary"
              value={report.feedback}
            />

            <p className="text-xs leading-6 text-slate-500">
              The well-being rating is a conversation aid, not a
              mental health diagnosis.
            </p>
          </>
        ) : (
          <>
            <TextSection title="Context" value={report.context} />
            <TextSection title="Strengths" value={report.strengths} />
            <TextSection
              title="Development Area"
              value={report.development_area}
            />
            <TextSection
              title="Advisory Feedback"
              value={report.feedback}
            />
          </>
        )}

        <TextSection
          title="Support Recommended"
          value={report.support_recommended}
        />

        <TextSection
          title="Follow-Up Required"
          value={report.follow_up_required}
        />

        {report.intended_outcome && (
          <TextSection
            title="Intended Outcome"
            value={report.intended_outcome}
          />
        )}

        {report.actual_outcome && (
          <TextSection
            title="Actual Outcome"
            value={report.actual_outcome}
          />
        )}

        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="font-bold text-blue-950">
            Advisory Department Review
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail
              label="Report status"
              value={formatLabel(report.status)}
            />

            <Detail
              label="Reviewed"
              value={
                report.reviewed_at
                  ? formatDateTime(report.reviewed_at)
                  : "Not reviewed yet"
              }
            />

            {report.reviewer_name && (
              <Detail
                label="Reviewed by"
                value={report.reviewer_name}
              />
            )}
          </div>

          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-blue-950">
            {report.department_review_notes ||
              "No department review notes recorded."}
          </p>
        </section>
      </div>
    </details>
  );
}

function TextSection({ title, value }) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h3 className="font-bold text-slate-900">{title}</h3>

      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
        {value || "Not provided"}
      </p>
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function formatWellbeing(value) {
  const rating = Number(value);

  return wellbeingLabels[rating]
    ? `${rating}/5 — ${wellbeingLabels[rating]}`
    : "Not recorded";
}

function formatLabel(value) {
  if (!value) return "Not available";
  if (value === "check_in") return "Check-In";
  if (value === "follow_up") return "Follow-Up";

  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Not recorded";

  const date = new Date(
    `${String(value).slice(0, 10)}T12:00:00+01:00`,
  );

  if (Number.isNaN(date.getTime())) return "Not recorded";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}