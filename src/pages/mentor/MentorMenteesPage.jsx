import {
  ClipboardPlus,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useMentorDashboard,
} from "../../hooks/useMentorDashboard";

import MentoringLayout from "../../layouts/MentoringLayout";

const initialReportForm = {
  reportType: "check_in",
  reportingPeriodStart: "",
  reportingPeriodEnd: "",
  context: "",
  strengths: "",
  developmentArea: "",
  feedback: "",
  supportRecommended: "",
  followUpRequired: "",
  intendedOutcome: "",
  attentionLevel: "routine",
  confidentialityLevel: "standard",
  requestStudentVisibility: false,
};

const reportTypes = [
  {
    value: "check_in",
    label: "Check-In",
  },
  {
    value: "progress",
    label: "Progress",
  },
  {
    value: "reflection_review",
    label: "Reflection Review",
  },
  {
    value: "goals_and_challenges",
    label: "Goals and Challenges",
  },
  {
    value: "development_need",
    label: "Development Need",
  },
  {
    value: "wellbeing_support",
    label: "Well-Being and Support",
  },
  {
    value: "conduct_concern",
    label: "Conduct Concern",
  },
  {
    value: "general_feedback",
    label: "General Feedback",
  },
];

export default function MentorMenteesPage() {
  const {
    mentorDashboard,
    mentorDashboardLoading,
    mentorDashboardFetching,
    mentorDashboardError,
    refreshMentorDashboard,

    submitReport,
    submittingReport,
    submitReportError,
    resetSubmitReport,
  } = useMentorDashboard();

  const [selectedMentee, setSelectedMentee] =
    useState(null);

  const [form, setForm] =
    useState(initialReportForm);

  const [successMessage, setSuccessMessage] =
    useState("");

  const mentees =
    mentorDashboard?.mentees || [];

  function openReportForm(mentee) {
    setSelectedMentee(mentee);
    setForm(initialReportForm);
    setSuccessMessage("");
    resetSubmitReport();
  }

  function closeReportForm() {
    if (submittingReport) {
      return;
    }

    setSelectedMentee(null);
    setForm(initialReportForm);
    resetSubmitReport();
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setSuccessMessage("");
    resetSubmitReport();

    setForm((current) => {
      const nextForm = {
        ...current,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      if (
        name === "reportType" &&
        value === "conduct_concern" &&
        current.confidentialityLevel ===
          "standard"
      ) {
        nextForm.confidentialityLevel =
          "restricted";
      }

      if (
        name ===
          "confidentialityLevel" &&
        value === "highly_restricted"
      ) {
        nextForm.requestStudentVisibility =
          false;
      }

      return nextForm;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedMentee) {
      return;
    }

    setSuccessMessage("");
    resetSubmitReport();

    try {
      const result =
        await submitReport({
          assignmentId:
            selectedMentee.assignment_id,

          ...form,
        });

      setSelectedMentee(null);
      setForm(initialReportForm);

      setSuccessMessage(
        result?.message ||
          "Your mentor report was submitted successfully.",
      );
    } catch {
      /*
       * The mutation exposes its error
       * through submitReportError.
       */
    }
  }

  if (mentorDashboardLoading) {
    return (
      <MentoringLayout>
        <PageMessage message="Loading your assigned students..." />
      </MentoringLayout>
    );
  }

  if (
    mentorDashboardError ||
    !mentorDashboard
  ) {
    return (
      <MentoringLayout>
        <PageMessage
          error
          message={
            mentorDashboardError?.message ||
            "Your assigned students could not be loaded."
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
                Student Development
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                My Mentees
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review your assigned students
                and submit structured
                developmental reports for
                Mentor Department review.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshMentorDashboard()
              }
              disabled={
                mentorDashboardFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  mentorDashboardFetching
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
              className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700"
            >
              {successMessage}
            </div>
          ) : null}

          <section className="mt-8 grid gap-5 sm:grid-cols-2">
            <SummaryCard
              label="Assigned Students"
              value={mentees.length}
              detail="Active mentoring relationships"
              tone="blue"
            />

            <SummaryCard
              label="Maximum Capacity"
              value={
                mentorDashboard.mentor
                  ?.max_active_mentees || 0
              }
              detail={`${Math.max(
                Number(
                  mentorDashboard.mentor
                    ?.max_active_mentees ||
                    0,
                ) - mentees.length,
                0,
              )} spaces remaining`}
              tone="green"
            />
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Assigned Students
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Reports submitted here go
                directly to the Mentor
                Department review queue.
              </p>
            </div>

            {mentees.length > 0 ? (
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                {mentees.map(
                  (mentee) => (
                    <MenteeCard
                      key={
                        mentee.assignment_id
                      }
                      mentee={mentee}
                      onRecordReport={() =>
                        openReportForm(
                          mentee,
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

      {selectedMentee ? (
        <ReportModal
          mentee={selectedMentee}
          form={form}
          submitting={submittingReport}
          error={submitReportError}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeReportForm}
        />
      ) : null}
    </MentoringLayout>
  );
}

function MenteeCard({
  mentee,
  onRecordReport,
}) {
  const name =
    mentee.preferred_name ||
    mentee.full_name ||
    "Student";

  const lastReport =
    mentee.last_report;

  return (
    <article className="rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <ProfilePhoto
          url={
            mentee.profile_photo_url
          }
          name={name}
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-950">
            {name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {mentee.student_number ||
              "Student number pending"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {mentee.cohort_name ||
              "Cohort pending"}
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Active
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Detail
          label="Next check-in"
          value={formatDateTime(
            mentee.next_check_in_at,
          )}
        />

        <Detail
          label="Open follow-ups"
          value={
            mentee.open_follow_ups || 0
          }
        />
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Latest Report
        </p>

        {lastReport ? (
          <div className="mt-2">
            <p className="font-semibold text-slate-800">
              {formatLabel(
                lastReport.report_type,
              )}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Status:{" "}
              {formatLabel(
                lastReport.status,
              )}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            No mentor report recorded yet.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onRecordReport}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900"
      >
        <ClipboardPlus size={18} />

        Record Mentor Report
      </button>
    </article>
  );
}

function ReportModal({
  mentee,
  form,
  submitting,
  error,
  onChange,
  onSubmit,
  onClose,
}) {
  const isConductConcern =
    form.reportType ===
    "conduct_concern";

  const highlyRestricted =
    form.confidentialityLevel ===
    "highly_restricted";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mentor-report-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
    >
      <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Mentor Report
            </p>

            <h2
              id="mentor-report-title"
              className="mt-1 text-2xl font-bold text-slate-950"
            >
              {mentee.preferred_name ||
                mentee.full_name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submit for Mentor Department
              review.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close report form"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </header>

        <form
          onSubmit={onSubmit}
          className="space-y-8 p-6"
        >
          <section>
            <SectionTitle
              title="Report Information"
              description="Classify the report and reporting period."
            />

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <FormField
                label="Report type"
                htmlFor="reportType"
                required
              >
                <select
                  id="reportType"
                  name="reportType"
                  value={form.reportType}
                  onChange={onChange}
                  disabled={submitting}
                  className={inputClasses}
                >
                  {reportTypes.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </FormField>

              <FormField
                label="Attention level"
                htmlFor="attentionLevel"
                required
              >
                <select
                  id="attentionLevel"
                  name="attentionLevel"
                  value={
                    form.attentionLevel
                  }
                  onChange={onChange}
                  disabled={submitting}
                  className={inputClasses}
                >
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
                </select>
              </FormField>

              <FormField
                label="Period start"
                htmlFor="reportingPeriodStart"
              >
                <input
                  id="reportingPeriodStart"
                  name="reportingPeriodStart"
                  type="date"
                  value={
                    form.reportingPeriodStart
                  }
                  onChange={onChange}
                  disabled={submitting}
                  className={inputClasses}
                />
              </FormField>

              <FormField
                label="Period end"
                htmlFor="reportingPeriodEnd"
              >
                <input
                  id="reportingPeriodEnd"
                  name="reportingPeriodEnd"
                  type="date"
                  value={
                    form.reportingPeriodEnd
                  }
                  onChange={onChange}
                  min={
                    form.reportingPeriodStart ||
                    undefined
                  }
                  disabled={submitting}
                  className={inputClasses}
                />
              </FormField>
            </div>
          </section>

          <section>
            <SectionTitle
              title="Developmental Assessment"
              description="Record the context, strengths and areas requiring growth."
            />

            <div className="mt-4 space-y-5">
              <FormTextarea
                name="context"
                label="Context"
                value={form.context}
                onChange={onChange}
                required
                placeholder="Describe the meeting, observation or situation that led to this report."
                disabled={submitting}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <FormTextarea
                  name="strengths"
                  label="Strengths"
                  value={form.strengths}
                  onChange={onChange}
                  placeholder="Recognized strengths and positive development."
                  disabled={submitting}
                />

                <FormTextarea
                  name="developmentArea"
                  label="Development area"
                  value={
                    form.developmentArea
                  }
                  onChange={onChange}
                  placeholder="Growth opportunities or development needs."
                  disabled={submitting}
                />
              </div>

              <FormTextarea
                name="feedback"
                label="Mentor feedback"
                value={form.feedback}
                onChange={onChange}
                required
                placeholder="Record your professional feedback and guidance."
                disabled={submitting}
              />
            </div>
          </section>

          <section>
            <SectionTitle
              title="Support and Follow-Up"
              description="Document recommended support, follow-up and intended outcomes."
            />

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <FormTextarea
                name="supportRecommended"
                label="Support recommended"
                value={
                  form.supportRecommended
                }
                onChange={onChange}
                placeholder="Support or resources recommended."
                disabled={submitting}
              />

              <FormTextarea
                name="followUpRequired"
                label="Follow-up required"
                value={
                  form.followUpRequired
                }
                onChange={onChange}
                placeholder="Required follow-up actions."
                disabled={submitting}
              />
            </div>

            <div className="mt-5">
              <FormTextarea
                name="intendedOutcome"
                label="Intended outcome"
                value={
                  form.intendedOutcome
                }
                onChange={onChange}
                placeholder="Describe the desired developmental outcome."
                disabled={submitting}
              />
            </div>
          </section>

          <section>
            <SectionTitle
              title="Confidentiality and Visibility"
              description="The Mentor Department makes the final student-visibility decision."
            />

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <FormField
                label="Confidentiality"
                htmlFor="confidentialityLevel"
                required
              >
                <select
                  id="confidentialityLevel"
                  name="confidentialityLevel"
                  value={
                    form.confidentialityLevel
                  }
                  onChange={onChange}
                  disabled={submitting}
                  className={inputClasses}
                >
                  {!isConductConcern ? (
                    <option value="standard">
                      Standard
                    </option>
                  ) : null}

                  <option value="restricted">
                    Restricted
                  </option>

                  <option value="highly_restricted">
                    Highly Restricted
                  </option>
                </select>
              </FormField>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="requestStudentVisibility"
                    checked={
                      form.requestStudentVisibility
                    }
                    onChange={onChange}
                    disabled={
                      submitting ||
                      highlyRestricted
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-900"
                  />

                  <span>
                    <span className="block font-semibold text-slate-800">
                      Request student visibility
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-slate-500">
                      The student will see only
                      the summary approved by
                      the Mentor Department.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {isConductConcern ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Conduct concerns must be
                restricted or highly
                restricted.
              </p>
            ) : null}

            {highlyRestricted ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Highly restricted reports
                cannot be requested for
                student visibility.
              </p>
            ) : null}
          </section>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
            >
              {error.message ||
                "The mentor report could not be submitted."}
            </div>
          ) : null}

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 px-6 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ClipboardPlus size={18} />

              {submitting
                ? "Submitting Report..."
                : "Submit Report"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone,
}) {
  const tones = {
    blue:
      "border-blue-200 bg-blue-50 text-blue-900",
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  return (
    <article
      className={`rounded-xl border p-6 shadow-sm ${tones[tone]}`}
    >
      <p className="font-medium opacity-75">
        {label}
      </p>

      <p className="mt-4 text-4xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-sm opacity-75">
        {detail}
      </p>
    </article>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-800">
        {value ?? "Not available"}
      </p>
    </div>
  );
}

function ProfilePhoto({
  url,
  name,
}) {
  const initials = String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return url ? (
    <img
      src={url}
      alt={`${name} profile`}
      className="h-14 w-14 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900">
      {initials || "?"}
    </div>
  );
}

function SectionTitle({
  title,
  description,
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  required = false,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required ? (
          <span className="ml-1 text-red-600">
            *
          </span>
        ) : null}
      </label>

      {children}
    </div>
  );
}

function FormTextarea({
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}) {
  return (
    <FormField
      label={label}
      htmlFor={name}
      required={required}
    >
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={4}
        maxLength={3000}
        className={`${inputClasses} resize-y`}
      />
    </FormField>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-14 text-center">
      <UserRound
        size={40}
        className="mx-auto text-slate-300"
      />

      <p className="mt-4 font-semibold text-slate-800">
        No assigned students
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Students assigned by the Mentor
        Department will appear here.
      </p>
    </div>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-[65vh] items-center justify-center p-6">
      <div
        role={error ? "alert" : "status"}
        className={`w-full max-w-lg rounded-xl border p-6 text-center shadow-sm ${
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

function formatDateTime(value) {
  if (!value) {
    return "Not scheduled";
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

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";