import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  ListChecks,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import InstructorLayout from "../../layouts/InstructorLayout";

import {
  useInstructorAssignmentFollowUps,
} from "../../hooks/useInstructorAssignmentFollowUps";

const initialReviewForm = {
  assignmentStudentId: "",
  instructorFeedback: "",
  followUpRequired: false,
  followUpAction: "",
  followUpStatus: "open",
  followUpNotes: "",
};

export default function InstructorFollowUpsPage() {
  const [
    selectedSubmission,
    setSelectedSubmission,
  ] = useState(null);

  const [
    reviewForm,
    setReviewForm,
  ] = useState(
    initialReviewForm,
  );

  const [
    filter,
    setFilter,
  ] = useState("all");

  const [
    pageMessage,
    setPageMessage,
  ] = useState(null);

  const {
    followUpSummary,
    assignmentSubmissions,
    followUpsLoading,
    followUpsFetching,
    followUpsError,
    refreshFollowUps,
    reviewSubmission,
    reviewingSubmission,
  } =
    useInstructorAssignmentFollowUps();

  function openReview(
    submission,
  ) {
    setSelectedSubmission(
      submission,
    );

    setReviewForm({
      assignmentStudentId:
        submission
          .assignment_student_id,

      instructorFeedback:
        submission
          .instructor_feedback ||
        "",

      followUpRequired:
        Boolean(
          submission
            .follow_up_required,
        ),

      followUpAction:
        submission
          .follow_up_action ||
        "",

      followUpStatus:
        submission
          .follow_up_status ===
        "not_required"
          ? "open"
          : submission
              .follow_up_status ||
            "open",

      followUpNotes:
        submission
          .follow_up_notes ||
        "",
    });

    setPageMessage(null);
  }

  function closeReview() {
    if (reviewingSubmission) {
      return;
    }

    setSelectedSubmission(null);
    setReviewForm(
      initialReviewForm,
    );
  }

  function updateField(
    field,
    value,
  ) {
    setReviewForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  }

  async function handleReview(
    event,
  ) {
    event.preventDefault();
    setPageMessage(null);

    try {
      const result =
        await reviewSubmission(
          reviewForm,
        );

      setPageMessage({
        type: "success",

        text:
          result?.message ||
          "The submission was reviewed successfully.",
      });

      setSelectedSubmission(null);
      setReviewForm(
        initialReviewForm,
      );
    } catch (error) {
      setPageMessage({
        type: "error",

        text:
          error.message ||
          "The submission could not be reviewed.",
      });
    }
  }

  if (followUpsLoading) {
    return (
      <InstructorLayout>
        <PageMessage message="Loading assignment follow-ups..." />
      </InstructorLayout>
    );
  }

  if (followUpsError) {
    return (
      <InstructorLayout>
        <PageMessage
          error
          message={
            followUpsError.message ||
            "Unable to load assignment follow-ups."
          }
        />
      </InstructorLayout>
    );
  }

  const summary =
    followUpSummary || {
      totalSubmissions: 0,
      awaitingReview: 0,
      openFollowUps: 0,
      completedFollowUps: 0,
    };

  const visibleSubmissions =
    assignmentSubmissions.filter(
      (submission) => {
        if (
          filter ===
          "awaiting_review"
        ) {
          return (
            submission
              .student_assignment_status ===
            "submitted"
          );
        }

        if (
          filter ===
          "open_follow_up"
        ) {
          return (
            submission
              .follow_up_required &&
            [
              "open",
              "in_progress",
            ].includes(
              submission
                .follow_up_status,
            )
          );
        }

        if (
          filter ===
          "completed"
        ) {
          return (
            submission
              .student_assignment_status ===
              "reviewed" &&
            (!submission
              .follow_up_required ||
              [
                "resolved",
                "closed",
              ].includes(
                submission
                  .follow_up_status,
              ))
          );
        }

        return true;
      },
    );

  return (
    <InstructorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Assignment Review
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Follow-Up Needed
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review student assignment
                submissions, provide written
                feedback and record required
                support actions.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshFollowUps()
              }
              disabled={
                followUpsFetching
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  followUpsFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Submissions"
              value={
                summary.totalSubmissions
              }
              icon={ClipboardCheck}
              tone="blue"
            />

            <SummaryCard
              label="Awaiting Review"
              value={
                summary.awaitingReview
              }
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Open Follow-Ups"
              value={
                summary.openFollowUps
              }
              icon={ListChecks}
              tone="red"
            />

            <SummaryCard
              label="Completed"
              value={
                summary
                  .completedFollowUps
              }
              icon={CheckCircle2}
              tone="green"
            />
          </section>

          {pageMessage ? (
            <div
              className={`mt-6 rounded-lg border px-4 py-3 text-sm font-medium ${
                pageMessage.type ===
                "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {pageMessage.text}
            </div>
          ) : null}

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Student Submissions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a submission to
                  review or update its
                  follow-up.
                </p>
              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value,
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                <option value="all">
                  All submissions
                </option>

                <option value="awaiting_review">
                  Awaiting review
                </option>

                <option value="open_follow_up">
                  Open follow-ups
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>
            </div>

            {visibleSubmissions.length >
            0 ? (
              <div className="divide-y divide-slate-200">
                {visibleSubmissions.map(
                  (submission) => (
                    <SubmissionCard
                      key={
                        submission
                          .assignment_student_id
                      }
                      submission={
                        submission
                      }
                      onReview={() =>
                        openReview(
                          submission,
                        )
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </main>

      {selectedSubmission ? (
        <ReviewModal
          submission={
            selectedSubmission
          }
          form={reviewForm}
          onChange={updateField}
          onSubmit={handleReview}
          onClose={closeReview}
          loading={
            reviewingSubmission
          }
        />
      ) : null}
    </InstructorLayout>
  );
}

function SubmissionCard({
  submission,
  onReview,
}) {
  return (
    <article className="p-5">
      <div className="flex flex-col justify-between gap-5 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={
                submission
                  .student_assignment_status
              }
            />

            {submission
              .follow_up_required ? (
              <StatusBadge
                status={
                  submission
                    .follow_up_status
                }
              />
            ) : null}
          </div>

          <h2 className="mt-3 text-lg font-bold text-slate-950">
            {
              submission.assignment_title
            }
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Week{" "}
            {submission.week_number} ·{" "}
            {submission.course_code} ·{" "}
            {submission.class_name}
          </p>

          <div className="mt-4 flex items-start gap-3 rounded-lg bg-slate-50 p-4">
            <UserRound
              size={19}
              className="mt-0.5 shrink-0 text-slate-500"
            />

            <div>
              <p className="font-semibold text-slate-900">
                {submission.student_name ||
                  "Student"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {submission.student_number ||
                  submission.student_email ||
                  "No student number"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Student Submission
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {submission.submission_text ||
                "No written response was provided."}
            </p>
          </div>

          {submission.evidence_url ? (
            <a
              href={
                submission.evidence_url
              }
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
            >
              View submitted evidence

              <ExternalLink
                size={15}
              />
            </a>
          ) : null}

          {submission
            .instructor_feedback ? (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Instructor Feedback
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-950">
                {
                  submission
                    .instructor_feedback
                }
              </p>
            </div>
          ) : null}

          {submission
            .follow_up_required ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Follow-Up Action
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-950">
                {submission
                  .follow_up_action ||
                  "No action recorded."}
              </p>

              {submission
                .follow_up_notes ? (
                <p className="mt-2 text-sm text-amber-800">
                  {
                    submission
                      .follow_up_notes
                  }
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 lg:w-44">
          <p className="text-sm text-slate-500">
            Submitted
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {formatDateTime(
              submission.submitted_at,
            )}
          </p>

          <button
            type="button"
            onClick={onReview}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
          >
            <ClipboardCheck
              size={16}
            />

            {submission
              .student_assignment_status ===
            "reviewed"
              ? "Update Review"
              : "Review"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ReviewModal({
  submission,
  form,
  onChange,
  onSubmit,
  onClose,
  loading,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Review Submission
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {submission.student_name} ·{" "}
              {submission.assignment_title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >
          <FormField label="Instructor Feedback">
            <textarea
              rows="5"
              value={
                form.instructorFeedback
              }
              onChange={(event) =>
                onChange(
                  "instructorFeedback",
                  event.target.value,
                )
              }
              placeholder="Provide clear written feedback to the student."
              className={inputClass}
            />
          </FormField>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={
                form.followUpRequired
              }
              onChange={(event) =>
                onChange(
                  "followUpRequired",
                  event.target.checked,
                )
              }
              className="mt-1"
            />

            <span>
              <span className="block font-semibold text-slate-800">
                Follow-up required
              </span>

              <span className="mt-1 block text-sm text-slate-500">
                Enable this when the
                student needs additional
                guidance or support.
              </span>
            </span>
          </label>

          {form.followUpRequired ? (
            <>
              <FormField
                label="Required Action"
                required
              >
                <textarea
                  required
                  rows="3"
                  value={
                    form.followUpAction
                  }
                  onChange={(event) =>
                    onChange(
                      "followUpAction",
                      event.target.value,
                    )
                  }
                  placeholder="Describe what the student or instructor needs to do."
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Follow-Up Status"
                required
              >
                <select
                  required
                  value={
                    form.followUpStatus
                  }
                  onChange={(event) =>
                    onChange(
                      "followUpStatus",
                      event.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="open">
                    Open
                  </option>

                  <option value="in_progress">
                    In progress
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>

                  <option value="closed">
                    Closed
                  </option>
                </select>
              </FormField>

              <FormField label="Follow-Up Notes">
                <textarea
                  rows="3"
                  value={
                    form.followUpNotes
                  }
                  onChange={(event) =>
                    onChange(
                      "followUpNotes",
                      event.target.value,
                    )
                  }
                  placeholder="Add support notes or progress updates."
                  className={inputClass}
                />
              </FormField>
            </>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-5 py-2.5 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              <CheckCircle2
                size={17}
              />

              {loading
                ? "Saving..."
                : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    amber:
      "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    green:
      "bg-emerald-100 text-emerald-800",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${tones[tone]}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}) {
  const tones = {
    submitted:
      "bg-amber-100 text-amber-800",
    reviewed:
      "bg-emerald-100 text-emerald-800",
    open:
      "bg-red-100 text-red-800",
    in_progress:
      "bg-blue-100 text-blue-800",
    resolved:
      "bg-emerald-100 text-emerald-800",
    closed:
      "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
        tones[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {String(status || "unknown").replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <ListChecks className="mx-auto h-11 w-11 text-slate-300" />

      <h2 className="mt-4 font-bold text-slate-800">
        No submissions found
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Student submissions and follow-up
        records will appear here.
      </p>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required ? (
          <span className="text-red-600">
            {" "}
            *
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="p-8">
      <div
        className={`mx-auto max-w-3xl rounded-xl border p-6 ${
          error
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        {message}
      </div>
    </main>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100";