import {
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useSiteSupervisorWork,
} from "../../hooks/useSiteSupervisorWork";

import SupervisorLayout from "../../layouts/SupervisorLayout";

const initialForm = {
  studentAssignmentId: "",
  workPerformed: "",
  outcome: "",
  quality: "not_observed",
  reliability: "not_observed",
  safety: "not_observed",
  followThrough: "not_observed",
  responseToFeedback:
    "not_observed",
  independence: "not_observed",
  supportRequired: "",
  supervisorRemarks: "",
  increasingResponsibility:
    false,
  recommendedResponsibilityLevel:
    "",
};

const ratingOptions = [
  {
    value: "not_observed",
    label: "Not Observed",
  },
  {
    value: "needs_improvement",
    label: "Needs Improvement",
  },
  {
    value: "developing",
    label: "Developing",
  },
  {
    value: "meets_expectations",
    label: "Meets Expectations",
  },
  {
    value: "exceeds_expectations",
    label: "Exceeds Expectations",
  },
];

export default function StudentServiceWorkRecordsPage() {
  const {
    siteWorkSummary,
    siteWorkAssignments,
    siteWorkLoading,
    siteWorkFetching,
    siteWorkError,
    refreshSiteWork,
    saveWorkReport,
    savingWorkReport,
    workReportError,
    resetWorkReport,
  } = useSiteSupervisorWork();

  const [form, setForm] =
    useState(initialForm);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  const assignments =
    useMemo(
      () =>
        siteWorkAssignments.filter(
          (assignment) =>
            assignment
              .assignment_status !==
            "removed",
        ),
      [siteWorkAssignments],
    );

  function selectAssignment(
    assignmentId,
  ) {
    const selectedAssignment =
      assignments.find(
        (assignment) =>
          assignment
            .assignment_id ===
          assignmentId,
      );

    const workRecord =
      selectedAssignment
        ?.work_record;

    setForm({
      studentAssignmentId:
        assignmentId,

      workPerformed:
        workRecord
          ?.work_performed ||
        "",

      outcome:
        workRecord?.outcome ||
        "",

      quality:
        workRecord?.quality ||
        "not_observed",

      reliability:
        workRecord?.reliability ||
        "not_observed",

      safety:
        workRecord?.safety ||
        "not_observed",

      followThrough:
        workRecord
          ?.follow_through ||
        "not_observed",

      responseToFeedback:
        workRecord
          ?.response_to_feedback ||
        "not_observed",

      independence:
        workRecord
          ?.independence ||
        "not_observed",

      supportRequired:
        workRecord
          ?.support_required ||
        "",

      supervisorRemarks:
        workRecord
          ?.supervisor_remarks ||
        "",

      increasingResponsibility:
        Boolean(
          workRecord
            ?.increasing_responsibility,
        ),

      recommendedResponsibilityLevel:
        workRecord
          ?.recommended_responsibility_level ||
        "",
    });

    setLocalError("");
    setSuccessMessage("");
    resetWorkReport();
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    if (
      name ===
      "studentAssignmentId"
    ) {
      selectAssignment(value);
      return;
    }

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setLocalError("");
    setSuccessMessage("");
    resetWorkReport();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLocalError("");
    setSuccessMessage("");
    resetWorkReport();

    if (
      !form.studentAssignmentId
    ) {
      setLocalError(
        "Select a student assignment.",
      );
      return;
    }

    if (
      !form.workPerformed.trim()
    ) {
      setLocalError(
        "Enter the work performed by the student.",
      );
      return;
    }

    try {
      const result =
        await saveWorkReport(
          form,
        );

      setSuccessMessage(
        result?.message ||
          "The student work report was recorded successfully.",
      );
    } catch (error) {
      setLocalError(
        error.message ||
          "The student work report could not be saved.",
      );
    }
  }

  if (siteWorkLoading) {
    return (
      <SupervisorLayout
        supervisorType="site_supervisor"
      >
        <PageMessage message="Loading student work records..." />
      </SupervisorLayout>
    );
  }

  if (
    siteWorkError ||
    !siteWorkSummary
  ) {
    return (
      <SupervisorLayout
        supervisorType="site_supervisor"
      >
        <PageMessage
          error
          message={
            siteWorkError?.message ||
            "Student work records could not be loaded."
          }
        />
      </SupervisorLayout>
    );
  }

  return (
    <SupervisorLayout
      supervisorType="site_supervisor"
    >
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Site Supervision
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Student Work Records
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Record work completed,
                outcomes, performance,
                support needs and readiness
                for increased
                responsibility.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshSiteWork()
              }
              disabled={
                siteWorkFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  siteWorkFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Assigned Students"
              value={
                siteWorkSummary
                  .assignedStudents
              }
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Reports Pending"
              value={
                siteWorkSummary
                  .workReportsPending
              }
              icon={ClipboardCheck}
              tone="amber"
            />

            <SummaryCard
              label="Reports Recorded"
              value={
                siteWorkSummary
                  .workReportsRecorded
              }
              icon={CheckCircle2}
              tone="green"
            />

            <SummaryCard
              label="Today's Assignments"
              value={
                siteWorkSummary
                  .todaysAssignments
              }
              icon={TrendingUp}
              tone="purple"
            />
          </section>

          {successMessage ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <WorkRecordForm
              form={form}
              assignments={
                assignments
              }
              onChange={
                handleChange
              }
              onSubmit={
                handleSubmit
              }
              submitting={
                savingWorkReport
              }
              error={
                localError ||
                workReportError
                  ?.message
              }
            />

            <WorkRecordDirectory
              assignments={
                assignments
              }
              onSelect={
                selectAssignment
              }
            />
          </div>
        </div>
      </main>
    </SupervisorLayout>
  );
}

function WorkRecordForm({
  form,
  assignments,
  onChange,
  onSubmit,
  submitting,
  error,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
          <ClipboardCheck className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Record Student Work
          </h2>

          <p className="text-sm text-slate-500">
            Document performance and
            development during service.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <SelectField
          label="Student Assignment"
          name="studentAssignmentId"
          value={
            form.studentAssignmentId
          }
          onChange={onChange}
          required
        >
          <option value="">
            Select a student
          </option>

          {assignments.map(
            (assignment) => (
              <option
                key={
                  assignment
                    .assignment_id
                }
                value={
                  assignment
                    .assignment_id
                }
              >
                {getAssignmentLabel(
                  assignment,
                )}
              </option>
            ),
          )}
        </SelectField>

        <TextAreaField
          label="Work Performed"
          name="workPerformed"
          value={
            form.workPerformed
          }
          onChange={onChange}
          placeholder="Describe the work completed by the student."
          required
        />

        <TextAreaField
          label="Outcome"
          name="outcome"
          value={form.outcome}
          onChange={onChange}
          placeholder="Describe the result or outcome of the work."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <RatingField
            label="Quality"
            name="quality"
            value={form.quality}
            onChange={onChange}
          />

          <RatingField
            label="Reliability"
            name="reliability"
            value={
              form.reliability
            }
            onChange={onChange}
          />

          <RatingField
            label="Safety"
            name="safety"
            value={form.safety}
            onChange={onChange}
          />

          <RatingField
            label="Follow-Through"
            name="followThrough"
            value={
              form.followThrough
            }
            onChange={onChange}
          />

          <RatingField
            label="Response to Instruction/Feedback"
            name="responseToFeedback"
            value={
              form.responseToFeedback
            }
            onChange={onChange}
          />

          <RatingField
            label="Independence"
            name="independence"
            value={
              form.independence
            }
            onChange={onChange}
          />
        </div>

        <TextAreaField
          label="Support Required"
          name="supportRequired"
          value={
            form.supportRequired
          }
          onChange={onChange}
          placeholder="Describe any support, coaching or follow-up required."
        />

        <TextAreaField
          label="Supervisor Remarks"
          name="supervisorRemarks"
          value={
            form.supervisorRemarks
          }
          onChange={onChange}
          placeholder="Add observations and remarks about the student."
        />

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            name="increasingResponsibility"
            checked={
              form.increasingResponsibility
            }
            onChange={onChange}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700"
          />

          <span>
            <span className="block font-semibold text-slate-800">
              Increasing Responsibility
            </span>

            <span className="mt-1 block text-sm text-slate-500">
              The student is ready for
              greater responsibility.
            </span>
          </span>
        </label>

        <SelectField
          label="Recommended Responsibility Level"
          name="recommendedResponsibilityLevel"
          value={
            form.recommendedResponsibilityLevel
          }
          onChange={onChange}
        >
          <option value="">
            No recommendation
          </option>

          <option value="guided">
            Guided
          </option>

          <option value="supported">
            Supported
          </option>

          <option value="independent">
            Independent
          </option>

          <option value="team_lead">
            Team Lead
          </option>
        </SelectField>
      </div>

      {error ? (
        <ErrorMessage
          message={error}
        />
      ) : null}

      <button
        type="submit"
        disabled={
          submitting ||
          assignments.length === 0
        }
        className="mt-6 w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Saving Work Report..."
          : "Save Work Report"}
      </button>
    </form>
  );
}

function WorkRecordDirectory({
  assignments,
  onSelect,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="text-xl font-bold text-slate-950">
          Work Report Status
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Select a student to create or
          update their work report.
        </p>
      </div>

      {assignments.length > 0 ? (
        <div className="divide-y divide-slate-200">
          {assignments.map(
            (assignment) => (
              <WorkRecordCard
                key={
                  assignment
                    .assignment_id
                }
                assignment={
                  assignment
                }
                onSelect={
                  onSelect
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-300" />

          <h3 className="mt-4 font-bold text-slate-900">
            No student assignments
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Student assignments will
            appear here when created by
            the Service Coordinator.
          </p>
        </div>
      )}
    </section>
  );
}

function WorkRecordCard({
  assignment,
  onSelect,
}) {
  const student =
    assignment.student || {};

  const project =
    assignment.project || {};

  const schedule =
    assignment.schedule || {};

  const workRecord =
    assignment.work_record;

  return (
    <article className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-950">
            {student.full_name ||
              student.email ||
              "Student"}
          </h3>

          <p className="mt-1 text-sm font-semibold text-blue-700">
            {project.title ||
              "Service Project"}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {schedule.task_title ||
              "Scheduled Activity"}
          </p>
        </div>

        <ReportBadge
          recorded={
            Boolean(workRecord)
          }
        />
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
        <p className="font-semibold text-slate-800">
          Assigned Task
        </p>

        <p className="mt-1 text-slate-600">
          {assignment.assigned_task ||
            "No specific task entered"}
        </p>
      </div>

      {workRecord ? (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Detail
            label="Quality"
            value={formatLabel(
              workRecord.quality,
            )}
          />

          <Detail
            label="Reliability"
            value={formatLabel(
              workRecord.reliability,
            )}
          />

          <Detail
            label="Safety"
            value={formatLabel(
              workRecord.safety,
            )}
          />

          <Detail
            label="Independence"
            value={formatLabel(
              workRecord.independence,
            )}
          />
        </dl>
      ) : null}

      <button
        type="button"
        onClick={() =>
          onSelect(
            assignment
              .assignment_id,
          )
        }
        className="mt-4 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
      >
        {workRecord
          ? "Edit Work Report"
          : "Record Work Report"}
      </button>
    </article>
  );
}

function RatingField({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <SelectField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      required
    >
      {ratingOptions.map(
        (option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ),
      )}
    </SelectField>
  );
}

function TextAreaField({
  label,
  ...props
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <textarea
        {...props}
        rows={4}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({
  label,
  children,
  ...props
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <select
        {...props}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}) {
  const tones = {
    blue:
      "bg-blue-100 text-blue-700",
    green:
      "bg-emerald-100 text-emerald-700",
    amber:
      "bg-amber-100 text-amber-700",
    purple:
      "bg-purple-100 text-purple-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`rounded-lg p-3 ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function ReportBadge({
  recorded,
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        recorded
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {recorded
        ? "Recorded"
        : "Pending"}
    </span>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function ErrorMessage({
  message,
}) {
  return (
    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
        className={`mx-auto max-w-4xl rounded-xl border p-8 text-center ${
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

function getAssignmentLabel(
  assignment,
) {
  const studentName =
    assignment.student
      ?.full_name ||
    assignment.student?.email ||
    "Student";

  const projectTitle =
    assignment.project?.title ||
    "Service Project";

  const activityTitle =
    assignment.schedule
      ?.task_title ||
    "Scheduled Activity";

  return `${studentName} — ${projectTitle} — ${activityTitle}`;
}

function formatLabel(value) {
  if (!value) {
    return "Not Observed";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}