import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useMentorDepartment } from "../../hooks/useMentorDepartment";
import MentoringLayout from "../../layouts/MentoringLayout";

const initialReviewForm = {
  decision: "reviewed",
  reviewNotes: "",
  visibilityDecision: "keep_hidden",
  studentVisibleSummary: "",
};

const inputClasses =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

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

export default function MentorReportsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionFilter, setAttentionFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    mentoringReportQueue,
    mentoringReportQueueLoading,
    mentoringReportQueueFetching,
    mentoringReportQueueError,
    refreshMentoringReportQueue,
    reviewReport,
    reviewingReport,
    reviewReportError,
    resetReviewReport,
  } = useMentorDepartment({
    reportStatus: statusFilter || null,
    attentionLevel: attentionFilter || null,
  });

  const reports = mentoringReportQueue?.reports || [];

  function openReview(report) {
    resetReviewReport();
    setSuccessMessage("");
    setSelectedReport(report);
    setReviewForm({
      decision: report.status === "closed" ? "closed" : "reviewed",
      reviewNotes: report.department_review_notes || "",
      visibilityDecision:
        report.confidentiality_level === "highly_restricted"
          ? "keep_hidden"
          : getVisibilityDecision(report.student_visibility_status),
      studentVisibleSummary: report.student_visible_summary || "",
    });
  }

  function closeReview() {
    if (reviewingReport) return;
    setSelectedReport(null);
    setReviewForm(initialReviewForm);
    resetReviewReport();
  }

  function handleReviewChange(event) {
    const { name, value } = event.target;
    resetReviewReport();
    setReviewForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "visibilityDecision" && value !== "approve"
        ? { studentVisibleSummary: "" }
        : {}),
    }));
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    if (!selectedReport || reviewingReport) return;

    try {
      await reviewReport({
        reportId: selectedReport.report_id,
        decision: reviewForm.decision,
        reviewNotes: reviewForm.reviewNotes,
        visibilityDecision: reviewForm.visibilityDecision,
        studentVisibleSummary: reviewForm.studentVisibleSummary,
      });

      setSuccessMessage("The advisory report was reviewed successfully.");
      setSelectedReport(null);
      setReviewForm(initialReviewForm);
    } catch {
      // The mutation exposes the error in the modal.
    }
  }

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Advisory Operations
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Advisory Reports
              </h1>
              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review weekly conversations, student support needs and
                follow-up updates from advisory couples.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshMentoringReportQueue()}
              disabled={mentoringReportQueueFetching || reviewingReport}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={mentoringReportQueueFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {successMessage && (
            <div
              role="status"
              className="mt-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
            >
              <CheckCircle2 size={20} aria-hidden="true" className="shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          <section
            aria-label="Report filters"
            className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2"
          >
            <SelectField
              label="Report status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under review</option>
              <option value="clarification_requested">
                Clarification requested
              </option>
              <option value="reviewed">Reviewed</option>
              <option value="follow_up_required">Follow-up required</option>
              <option value="closed">Closed</option>
            </SelectField>

            <SelectField
              label="Attention level"
              value={attentionFilter}
              onChange={(event) => setAttentionFilter(event.target.value)}
            >
              <option value="">All attention levels</option>
              <option value="routine">Routine</option>
              <option value="monitor">Monitor</option>
              <option value="priority">Priority</option>
              <option value="urgent">Urgent</option>
            </SelectField>
          </section>

          {mentoringReportQueueLoading ? (
            <PageMessage message="Loading advisory reports..." />
          ) : mentoringReportQueueError ? (
            <PageMessage
              error
              message={
                mentoringReportQueueError.message ||
                "Advisory reports could not be loaded."
              }
            />
          ) : (
            <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 border-b border-slate-200 p-5">
                <ClipboardCheck
                  size={22}
                  aria-hidden="true"
                  className="text-blue-900"
                />
                <div>
                  <h2 className="text-lg font-bold">Report Review Queue</h2>
                  <p className="text-sm text-slate-500">
                    {reports.length}{" "}
                    {reports.length === 1 ? "report" : "reports"} found
                  </p>
                </div>
              </div>

              {reports.length ? (
                <div className="divide-y divide-slate-200">
                  {reports.map((report) => (
                    <ReportRow
                      key={report.report_id}
                      report={report}
                      onReview={() => openReview(report)}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <FileText
                    size={42}
                    aria-hidden="true"
                    className="mx-auto text-slate-300"
                  />
                  <h3 className="mt-4 font-bold">No reports found</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    No advisory reports match the selected filters.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {selectedReport && (
        <ReviewModal
          report={selectedReport}
          form={reviewForm}
          onChange={handleReviewChange}
          onSubmit={handleReviewSubmit}
          onClose={closeReview}
          submitting={reviewingReport}
          error={reviewReportError}
        />
      )}
    </MentoringLayout>
  );
}

function ReportRow({ report, onReview }) {
  const weekly = isWeeklyReport(report);

  return (
    <article className="p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {report.student?.profile_photo_url ? (
            <img
              src={report.student.profile_photo_url}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900">
              {getInitials(report.student?.full_name)}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-950">
                {report.student?.full_name || "Student"}
              </h3>
              <Badge value={report.status} type="status" />
              {(!weekly || report.attention_level !== "routine") && (
                <Badge value={report.attention_level} type="attention" />
              )}
            </div>

            <p className="mt-2 text-sm font-semibold text-blue-900">
              {formatLabel(report.report_type)}
              {weekly && ` · Week ${report.programme_week}`}
            </p>

            {weekly && (
              <p className="mt-1 text-sm text-slate-600">
                {weekTitles[report.programme_week]}
                {" · "}
                {formatDate(report.conversation_date)}
              </p>
            )}

            <ReportAttribution report={report} />

            <p className="mt-3 text-xs text-slate-500">
              Submitted {formatDateTime(report.submitted_at)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReview}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900"
        >
          <Eye size={18} aria-hidden="true" />
          View and Review
        </button>
      </div>
    </article>
  );
}

function ReportAttribution({ report }) {
  const coupleReport = Boolean(report.advisory_couple_id);

  return (
    <div className="mt-3 space-y-2 text-sm">
      <p className="break-words text-slate-700">
        <span className="font-semibold">
          {coupleReport ? "Advisory couple: " : "Advisor: "}
        </span>
        {coupleReport
          ? report.advisor_names ||
            report.couple_name ||
            "Couple details unavailable"
          : report.mentor?.full_name || "Advisor details unavailable"}
      </p>

      {coupleReport && report.couple_name && report.advisor_names && (
        <p className="text-xs text-slate-500">{report.couple_name}</p>
      )}

      <p className="text-slate-600">
        <span className="font-semibold">Submitted by: </span>
        {report.submitted_by_name || "Name unavailable"}
      </p>
    </div>
  );
}

function ReviewModal({
  report,
  form,
  onChange,
  onSubmit,
  onClose,
  submitting,
  error,
}) {
  const dialogRef = useRef(null);
  const weekly = isWeeklyReport(report);
  const highlyRestricted =
    report.confidentiality_level === "highly_restricted";

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

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="advisory-review-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
            Advisory Report Review
          </p>
          <h2
            id="advisory-review-title"
            className="mt-1 text-2xl font-bold text-slate-950"
          >
            {report.student?.full_name || "Student"}
          </h2>
          <ReportAttribution report={report} />
        </div>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          disabled={submitting}
          aria-label="Close report"
          className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-60"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </header>

      <section className="grid gap-5 bg-slate-50 p-6 sm:grid-cols-3">
        <Detail label="Report type" value={formatLabel(report.report_type)} />

        {weekly ? (
          <>
            <Detail label="Programme week" value={`Week ${report.programme_week}`} />
            <Detail label="Conversation date" value={formatDate(report.conversation_date)} />
          </>
        ) : (
          <Detail label="Attention" value={formatLabel(report.attention_level)} />
        )}

        <Detail label="Confidentiality" value={formatLabel(report.confidentiality_level)} />
        <Detail label="Status" value={formatLabel(report.status)} />
        <Detail label="Submitted" value={formatDateTime(report.submitted_at)} />
        <Detail label="Student visibility" value={formatLabel(report.student_visibility_status)} />

        {weekly && (
          <Detail
            label="Well-being rating"
            value={formatWellbeing(report.wellbeing_rating)}
          />
        )}

        {weekly && report.attention_level !== "routine" && (
          <Detail label="Attention" value={formatLabel(report.attention_level)} />
        )}
      </section>

      {weekly ? (
        <WeeklyReportContent report={report} />
      ) : (
        <LegacyReportContent report={report} />
      )}

      <form onSubmit={onSubmit} className="border-t border-slate-200 p-6">
        <fieldset disabled={submitting}>
          <legend className="text-lg font-bold text-slate-950">
            Department Decision
          </legend>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <SelectField
              label="Report decision"
              name="decision"
              value={form.decision}
              onChange={onChange}
              required
            >
              <option value="reviewed">Mark as reviewed</option>
              <option value="follow_up_required">Follow-up required</option>
              <option value="clarification_requested">Request clarification</option>
              <option value="closed">Close report</option>
            </SelectField>

            <SelectField
              label="Student visibility"
              name="visibilityDecision"
              value={form.visibilityDecision}
              onChange={onChange}
              required
            >
              <option value="keep_hidden">Keep hidden</option>
              {!highlyRestricted && (
                <option value="approve">Approve for student</option>
              )}
              <option value="decline">Decline student visibility</option>
            </SelectField>
          </div>

          {highlyRestricted && (
            <div className="mt-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} aria-hidden="true" className="shrink-0" />
              <p>
                Highly restricted reports cannot be approved for student visibility.
              </p>
            </div>
          )}

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">
              Department review notes
            </span>
            <textarea
              name="reviewNotes"
              value={form.reviewNotes}
              onChange={onChange}
              rows={4}
              placeholder="Record relevant review notes and instructions for the advisory couple."
              className={inputClasses}
            />
          </label>

          {form.visibilityDecision === "approve" && (
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-slate-700">
                Approved feedback for student
              </span>
              <textarea
                required
                name="studentVisibleSummary"
                value={form.studentVisibleSummary}
                onChange={onChange}
                rows={4}
                placeholder="Write the exact summary the student is permitted to view."
                className={inputClasses}
              />
              <span className="mt-2 block text-xs text-slate-500">
                The student sees only this approved summary, not the complete
                internal report or weekly answers.
              </span>
            </label>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-950 px-6 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {submitting ? "Saving Review..." : "Submit Department Review"}
            </button>
          </div>
        </fieldset>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error.message}
          </div>
        )}
      </form>
    </dialog>
  );
}

function WeeklyReportContent({ report }) {
  const responses = Array.isArray(report.checkin_responses)
    ? report.checkin_responses.filter(
        (response) =>
          typeof response?.question === "string" &&
          typeof response?.answer === "string" &&
          response.answer.trim(),
      )
    : [];

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-700">
          Week {report.programme_week}
        </p>
        <h3 className="mt-1 text-xl font-bold text-blue-950">
          {weekTitles[report.programme_week] || "Weekly Advisory Conversation"}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Questions were selected to support a natural conversation. Unanswered
          questions are not treated as incomplete work.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The well-being rating is a conversation aid, not a mental health diagnosis.
        </p>
      </section>

      <section aria-labelledby="recorded-answers-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="recorded-answers-title" className="text-lg font-bold">
            Recorded Questions and Answers
          </h3>
          <span className="text-sm text-slate-500">
            {responses.length} {responses.length === 1 ? "answer" : "answers"} recorded
          </span>
        </div>

        {responses.length ? (
          <ol className="mt-4 space-y-4">
            {responses.map((response, index) => (
              <li
                key={`${response.id || "response"}-${index}`}
                className="rounded-xl border border-slate-200 p-5"
              >
                <h4 className="font-semibold leading-6 text-slate-900">
                  {index + 1}. {response.question}
                </h4>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {response.answer}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-xl border border-slate-200 p-5 text-sm text-slate-600">
            No individual question responses were recorded. See the conversation
            summary below.
          </p>
        )}
      </section>

      <ReportDetail title="Conversation Summary" value={report.feedback} />

      <div className="grid gap-5 md:grid-cols-2">
        <ReportDetail title="Support Recommended" value={report.support_recommended} />
        <ReportDetail title="Follow-Up Required" value={report.follow_up_required} />
      </div>

      {(report.intended_outcome || report.actual_outcome) && (
        <div className="grid gap-5 md:grid-cols-2">
          {report.intended_outcome && (
            <ReportDetail title="Intended Outcome" value={report.intended_outcome} />
          )}
          {report.actual_outcome && (
            <ReportDetail title="Actual Outcome" value={report.actual_outcome} />
          )}
        </div>
      )}
    </div>
  );
}

function LegacyReportContent({ report }) {
  const fields = [
    ["Context", report.context],
    ["Strengths", report.strengths],
    ["Development Area", report.development_area],
    ["Advisory Feedback", report.feedback],
    ["Support Recommended", report.support_recommended],
    ["Follow-Up Required", report.follow_up_required],
    ["Intended Outcome", report.intended_outcome],
    ["Actual Outcome", report.actual_outcome],
  ];

  return (
    <section className="grid gap-5 p-6 md:grid-cols-2">
      {fields.map(([title, value]) => (
        <ReportDetail key={title} title={title} value={value} />
      ))}
    </section>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select {...props} className={inputClasses}>
        {children}
      </select>
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

function ReportDetail({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function Badge({ value, type }) {
  const attentionTones = {
    urgent: "bg-red-100 text-red-700",
    priority: "bg-orange-100 text-orange-700",
    monitor: "bg-amber-100 text-amber-700",
    routine: "bg-blue-100 text-blue-700",
  };
  const statusTones = {
    submitted: "bg-purple-100 text-purple-700",
    under_review: "bg-blue-100 text-blue-700",
    clarification_requested: "bg-amber-100 text-amber-700",
    reviewed: "bg-green-100 text-green-700",
    follow_up_required: "bg-orange-100 text-orange-700",
    closed: "bg-slate-200 text-slate-700",
  };
  const tone =
    (type === "attention" ? attentionTones : statusTones)[value] ||
    "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {formatLabel(value)}
    </span>
  );
}

function PageMessage({ message, error = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mt-6 rounded-xl border p-6 text-center ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {message}
    </div>
  );
}

function isWeeklyReport(report) {
  const week = Number(report.programme_week);
  return Number.isInteger(week) && week >= 1 && week <= 8;
}

function formatWellbeing(value) {
  const rating = Number(value);
  return wellbeingLabels[rating]
    ? `${rating}/5 — ${wellbeingLabels[rating]}`
    : "Not recorded";
}

function getVisibilityDecision(status) {
  if (status === "approved") return "approve";
  if (status === "declined") return "decline";
  return "keep_hidden";
}

function getInitials(name) {
  if (!name?.trim()) return "ST";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
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

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00+01:00`);
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