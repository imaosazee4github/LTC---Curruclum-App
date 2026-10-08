import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";
import { useState } from "react";

import { useMentorDepartment } from "../../hooks/useMentorDepartment";
import MentoringLayout from "../../layouts/MentoringLayout";

const initialReviewForm = {
  decision: "reviewed",
  reviewNotes: "",
  visibilityDecision: "keep_hidden",
  studentVisibleSummary: "",
};

export default function MentorReportsPage() {
  const [statusFilter, setStatusFilter] =
    useState("");

  const [attentionFilter, setAttentionFilter] =
    useState("");

  const [selectedReport, setSelectedReport] =
    useState(null);

  const [reviewForm, setReviewForm] =
    useState(initialReviewForm);

  const [successMessage, setSuccessMessage] =
    useState("");

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
    attentionLevel:
      attentionFilter || null,
  });

  const reports =
    mentoringReportQueue?.reports || [];

  function openReview(report) {
    resetReviewReport();
    setSuccessMessage("");
    setSelectedReport(report);

    setReviewForm({
      decision:
        report.status === "closed"
          ? "closed"
          : "reviewed",

      reviewNotes:
        report.department_review_notes ||
        "",

      visibilityDecision:
        getVisibilityDecision(
          report.student_visibility_status,
        ),

      studentVisibleSummary:
        report.student_visible_summary ||
        "",
    });
  }

  function closeReview() {
    if (reviewingReport) {
      return;
    }

    setSelectedReport(null);
    setReviewForm(initialReviewForm);
    resetReviewReport();
  }

  function handleReviewChange(event) {
    const {
      name,
      value,
    } = event.target;

    setReviewForm((current) => ({
      ...current,
      [name]: value,

      ...(name ===
        "visibilityDecision" &&
      value !== "approve"
        ? {
            studentVisibleSummary: "",
          }
        : {}),
    }));
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    if (!selectedReport) {
      return;
    }

    try {
      const result = await reviewReport({
        reportId:
          selectedReport.report_id,

        decision:
          reviewForm.decision,

        reviewNotes:
          reviewForm.reviewNotes,

        visibilityDecision:
          reviewForm.visibilityDecision,

        studentVisibleSummary:
          reviewForm.studentVisibleSummary,
      });

      setSuccessMessage(
        result?.message ||
          "The mentor report was reviewed successfully.",
      );

      setSelectedReport(null);
      setReviewForm(initialReviewForm);
    } catch (error) {
      console.error(
        "Report review failed:",
        error,
      );
    }
  }

  if (mentoringReportQueueLoading) {
    return (
      <MentoringLayout>
        <PageMessage message="Loading mentor reports..." />
      </MentoringLayout>
    );
  }

  if (mentoringReportQueueError) {
    return (
      <MentoringLayout>
        <PageMessage
          error
          message={
            mentoringReportQueueError.message ||
            "Mentor reports could not be loaded."
          }
        />
      </MentoringLayout>
    );
  }

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Mentoring Operations
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Mentor Reports
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review reports submitted by mentors,
                determine required actions and approve
                appropriate feedback for students.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshMentoringReportQueue()
              }
              disabled={
                mentoringReportQueueFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  mentoringReportQueueFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </header>

          {successMessage ? (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
            >
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p>{successMessage}</p>
            </div>
          ) : null}

          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <FilterField
                label="Report status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All statuses
                </option>
                <option value="submitted">
                  Submitted
                </option>
                <option value="under_review">
                  Under review
                </option>
                <option value="clarification_requested">
                  Clarification requested
                </option>
                <option value="reviewed">
                  Reviewed
                </option>
                <option value="follow_up_required">
                  Follow-up required
                </option>
                <option value="closed">
                  Closed
                </option>
              </FilterField>

              <FilterField
                label="Attention level"
                value={attentionFilter}
                onChange={(event) =>
                  setAttentionFilter(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All attention levels
                </option>
                <option value="routine">
                  Routine
                </option>
                <option value="monitor">
                  Monitor
                </option>
                <option value="priority">
                  Priority
                </option>
                <option value="urgent">
                  Urgent
                </option>
              </FilterField>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-center gap-3">
                <ClipboardCheck
                  size={22}
                  className="text-blue-900"
                />

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Report Review Queue
                  </h2>

                  <p className="text-sm text-slate-500">
                    {reports.length}{" "}
                    {reports.length === 1
                      ? "report"
                      : "reports"}{" "}
                    found
                  </p>
                </div>
              </div>
            </div>

            {reports.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {reports.map((report) => (
                  <ReportRow
                    key={report.report_id}
                    report={report}
                    onReview={() =>
                      openReview(report)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <FileText
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-bold text-slate-900">
                  No reports found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  No mentor reports match the
                  selected filters.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedReport ? (
        <ReviewModal
          report={selectedReport}
          form={reviewForm}
          onChange={handleReviewChange}
          onSubmit={handleReviewSubmit}
          onClose={closeReview}
          submitting={reviewingReport}
          error={reviewReportError}
        />
      ) : null}
    </MentoringLayout>
  );
}

function ReportRow({
  report,
  onReview,
}) {
  return (
    <article className="p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {report.student?.profile_photo_url ? (
            <img
              src={
                report.student
                  .profile_photo_url
              }
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900">
              {getInitials(
                report.student?.full_name,
              )}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-950">
                {report.student?.full_name ||
                  "Student"}
              </h3>

              <Badge
                value={
                  report.attention_level
                }
                type="attention"
              />

              <Badge
                value={report.status}
                type="status"
              />
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {formatLabel(
                report.report_type,
              )}{" "}
              report by{" "}
              <strong>
                {report.mentor?.full_name ||
                  "Mentor"}
              </strong>
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Submitted{" "}
              {formatDateTime(
                report.submitted_at,
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReview}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white"
        >
          <Eye size={18} />
          View and Review
        </button>
      </div>
    </article>
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
  const highlyRestricted =
    report.confidentiality_level ===
    "highly_restricted";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4">
      <div className="mx-auto my-6 w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Mentor Report Review
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {report.student?.full_name ||
                "Student"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submitted by{" "}
              {report.mentor?.full_name ||
                "Mentor"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close report"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </header>

        <div className="max-h-[85vh] overflow-y-auto">
          <section className="grid gap-4 bg-slate-50 p-6 sm:grid-cols-3">
            <Detail
              label="Report type"
              value={formatLabel(
                report.report_type,
              )}
            />

            <Detail
              label="Attention"
              value={formatLabel(
                report.attention_level,
              )}
            />

            <Detail
              label="Confidentiality"
              value={formatLabel(
                report.confidentiality_level,
              )}
            />
          </section>

          <section className="grid gap-5 p-6 md:grid-cols-2">
            <ReportDetail
              title="Context"
              value={report.context}
            />

            <ReportDetail
              title="Strengths"
              value={report.strengths}
            />

            <ReportDetail
              title="Development Area"
              value={report.development_area}
            />

            <ReportDetail
              title="Mentor Feedback"
              value={report.feedback}
            />

            <ReportDetail
              title="Support Recommended"
              value={
                report.support_recommended
              }
            />

            <ReportDetail
              title="Follow-Up Required"
              value={
                report.follow_up_required
              }
            />

            <ReportDetail
              title="Intended Outcome"
              value={report.intended_outcome}
            />
          </section>

          <form
            onSubmit={onSubmit}
            className="border-t border-slate-200 p-6"
          >
            <h3 className="text-lg font-bold text-slate-950">
              Department Decision
            </h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <FormField
                label="Report decision"
                name="decision"
                value={form.decision}
                onChange={onChange}
              >
                <option value="reviewed">
                  Mark as reviewed
                </option>

                <option value="follow_up_required">
                  Follow-up required
                </option>

                <option value="clarification_requested">
                  Request clarification
                </option>

                <option value="closed">
                  Close report
                </option>
              </FormField>

              <FormField
                label="Student visibility"
                name="visibilityDecision"
                value={
                  form.visibilityDecision
                }
                onChange={onChange}
              >
                <option value="keep_hidden">
                  Keep hidden
                </option>

                {!highlyRestricted ? (
                  <option value="approve">
                    Approve for student
                  </option>
                ) : null}

                <option value="decline">
                  Decline student visibility
                </option>
              </FormField>
            </div>

            {highlyRestricted ? (
              <div className="mt-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle
                  size={19}
                  className="shrink-0"
                />

                Highly restricted reports
                cannot be approved for student
                visibility.
              </div>
            ) : null}

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-slate-700">
                Department review notes
              </span>

              <textarea
                name="reviewNotes"
                value={form.reviewNotes}
                onChange={onChange}
                rows={4}
                placeholder="Record the department's review notes and any instructions for the mentor."
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {form.visibilityDecision ===
            "approve" ? (
              <label className="mt-5 block">
                <span className="text-sm font-semibold text-slate-700">
                  Approved feedback for student
                </span>

                <textarea
                  required
                  name="studentVisibleSummary"
                  value={
                    form.studentVisibleSummary
                  }
                  onChange={onChange}
                  rows={4}
                  placeholder="Write the exact feedback summary that the student is permitted to view."
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />

                <span className="mt-2 block text-xs text-slate-500">
                  The student sees only this
                  approved summary, not the
                  complete internal report.
                </span>
              </label>
            ) : null}

            {error ? (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error.message}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-950 px-6 py-3 font-semibold text-white disabled:opacity-60"
              >
                {submitting
                  ? "Saving Review..."
                  : "Submit Department Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
  ...props
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <select
        {...props}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

function FormField({
  label,
  children,
  ...props
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <select
        {...props}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

function Detail({
  label,
  value,
}) {
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

function ReportDetail({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h4 className="text-sm font-bold text-slate-900">
        {title}
      </h4>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function Badge({
  value,
  type,
}) {
  const tone =
    type === "attention"
      ? {
          urgent:
            "bg-red-100 text-red-700",
          priority:
            "bg-orange-100 text-orange-700",
          monitor:
            "bg-amber-100 text-amber-700",
          routine:
            "bg-blue-100 text-blue-700",
        }[value]
      : {
          submitted:
            "bg-purple-100 text-purple-700",
          under_review:
            "bg-blue-100 text-blue-700",
          clarification_requested:
            "bg-amber-100 text-amber-700",
          reviewed:
            "bg-green-100 text-green-700",
          follow_up_required:
            "bg-orange-100 text-orange-700",
          closed:
            "bg-slate-200 text-slate-700",
        }[value];

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        tone ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {formatLabel(value)}
    </span>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div
        role={error ? "alert" : "status"}
        className={`w-full max-w-lg rounded-xl border p-6 text-center ${
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

function getVisibilityDecision(status) {
  if (status === "approved") {
    return "approve";
  }

  if (status === "declined") {
    return "decline";
  }

  return "keep_hidden";
}

function getInitials(name) {
  if (!name) {
    return "ST";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatLabel(value) {
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
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}