import { useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

import { useSiteSupervisorWork } from "../../hooks/useSiteSupervisorWork";
import SupervisorLayout from "../../layouts/SupervisorLayout";

const initialForm = {
  studentAssignmentId: "",
  workPerformed: "",
  outcome: "",
  quality: "not_observed",
  reliability: "not_observed",
  safety: "not_observed",
  followThrough: "not_observed",
  responseToFeedback: "not_observed",
  independence: "not_observed",
  supportRequired: "",
  supervisorRemarks: "",
  increasingResponsibility: false,
  recommendedResponsibilityLevel: "",
};

const ratingOptions = [
  { value: "not_observed", label: "Not Observed" },
  { value: "needs_improvement", label: "Needs Improvement" },
  { value: "developing", label: "Developing" },
  { value: "meets_expectations", label: "Meets Expectations" },
  { value: "exceeds_expectations", label: "Exceeds Expectations" },
];

const ratingFields = [
  { name: "quality", key: "quality", label: "Quality" },
  { name: "reliability", key: "reliability", label: "Reliability" },
  { name: "safety", key: "safety", label: "Safety" },
  {
    name: "followThrough",
    key: "follow_through",
    label: "Follow-Through",
  },
  {
    name: "responseToFeedback",
    key: "response_to_feedback",
    label: "Response to Instruction/Feedback",
  },
  {
    name: "independence",
    key: "independence",
    label: "Independence",
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

  const [date, setDate] = useState(getTodayInNigeria);
  const [projectId, setProjectId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const dailyAssignments = siteWorkAssignments.filter(
    (assignment) =>
      assignment.assignment_status !== "removed" &&
      assignment.schedule?.status !== "cancelled" &&
      assignment.project?.status !== "cancelled" &&
      assignment.schedule?.schedule_date === date,
  );

  const projects = groupByProject(dailyAssignments);

  const assignments = dailyAssignments.filter(
    (assignment) =>
      !projectId || assignment.project?.project_id === projectId,
  );

  const groups = groupByProject(assignments);

  const studentCount = new Set(
    assignments.map(
      (assignment) =>
        assignment.student?.student_profile_id ||
        assignment.student?.profile_id ||
        assignment.assignment_id,
    ),
  ).size;

  const recordedCount = assignments.filter(
    (assignment) => Boolean(assignment.work_record),
  ).length;

  const selectedAssignment = assignments.find(
    (assignment) =>
      assignment.assignment_id === form.studentAssignmentId,
  );

  function clearMessages() {
    setLocalError("");
    setSuccessMessage("");
    resetWorkReport();
  }

  function changeFilters(nextDate, nextProjectId) {
    if (savingWorkReport) return;

    setDate(nextDate);
    setProjectId(nextProjectId);
    setForm(initialForm);
    clearMessages();
  }

  function selectAssignment(assignmentId) {
    if (savingWorkReport) return;

    const assignment = assignments.find(
      (item) => item.assignment_id === assignmentId,
    );

    const record = assignment?.work_record;

    setForm({
      studentAssignmentId: assignment?.assignment_id || "",
      workPerformed: record?.work_performed || "",
      outcome: record?.outcome || "",
      quality: record?.quality || "not_observed",
      reliability: record?.reliability || "not_observed",
      safety: record?.safety || "not_observed",
      followThrough: record?.follow_through || "not_observed",
      responseToFeedback:
        record?.response_to_feedback || "not_observed",
      independence: record?.independence || "not_observed",
      supportRequired: record?.support_required || "",
      supervisorRemarks: record?.supervisor_remarks || "",
      increasingResponsibility: Boolean(
        record?.increasing_responsibility,
      ),
      recommendedResponsibilityLevel:
        record?.recommended_responsibility_level || "",
    });

    clearMessages();
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    if (name === "studentAssignmentId") {
      selectAssignment(value);
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    clearMessages();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (savingWorkReport) return;

    clearMessages();

    if (!form.studentAssignmentId) {
      setLocalError("Select a student assignment.");
      return;
    }

    if (!selectedAssignment) {
      setLocalError(
        "This assignment is no longer in the selected view. Select a student again.",
      );
      return;
    }

    if (!form.workPerformed.trim()) {
      setLocalError("Enter the work performed by the student.");
      return;
    }

    try {
      const result = await saveWorkReport(form);

      setSuccessMessage(
        result?.message ||
          "The student work report was recorded successfully.",
      );
    } catch (error) {
      setLocalError(
        error.message || "The student work report could not be saved.",
      );
    }
  }

  if (siteWorkLoading) {
    return (
      <SupervisorLayout supervisorType="site_supervisor">
        <PageMessage message="Loading student work records..." />
      </SupervisorLayout>
    );
  }

  if (siteWorkError || !siteWorkSummary) {
    return (
      <SupervisorLayout supervisorType="site_supervisor">
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
    <SupervisorLayout supervisorType="site_supervisor">
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Site Supervision
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Student Work Records
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Record work completed, outcomes, performance, support
                needs and readiness for increased responsibility.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshSiteWork()}
              disabled={siteWorkFetching || savingWorkReport}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 disabled:opacity-60"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${
                  siteWorkFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </header>

          <section
            aria-label="Work report filters"
            className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="grid items-end gap-4 md:grid-cols-[1fr_2fr_auto]">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Reporting date (Nigeria)
                </span>

                <input
                  type="date"
                  value={date}
                  disabled={savingWorkReport}
                  required
                  onChange={(event) => {
                    if (event.target.value) {
                      changeFilters(event.target.value, "");
                    }
                  }}
                  className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />
              </label>

              <SelectField
                label="Project"
                value={projectId}
                disabled={savingWorkReport}
                onChange={(event) =>
                  changeFilters(date, event.target.value)
                }
              >
                <option value="">All projects for this date</option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </SelectField>

              <button
                type="button"
                disabled={savingWorkReport}
                onClick={() =>
                  changeFilters(getTodayInNigeria(), "")
                }
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                Today
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Counts and student lists follow the selected date and
              project. Changing a filter clears the current form.
              Each report belongs to one student activity.
            </p>
          </section>

          <section
            aria-label="Selected work report summary"
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <SummaryCard
              label="Students in Selected View"
              value={studentCount}
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Reports Pending"
              value={assignments.length - recordedCount}
              icon={ClipboardCheck}
              tone="amber"
            />

            <SummaryCard
              label="Reports Recorded"
              value={recordedCount}
              icon={CheckCircle2}
              tone="green"
            />

            <SummaryCard
              label="Activity Assignments"
              value={assignments.length}
              icon={TrendingUp}
              tone="purple"
            />
          </section>

          {successMessage && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800"
            >
              {successMessage}
            </div>
          )}

          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <fieldset
                disabled={savingWorkReport}
                className="min-w-0 border-0 p-0"
              >
                <h2 className="text-xl font-bold text-slate-950">
                  Record Student Work
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Document performance and development during service.
                </p>

                <div className="mt-6 space-y-5">
                  <SelectField
                    label="Student Assignment"
                    name="studentAssignmentId"
                    value={form.studentAssignmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a student activity</option>

                    {groups.map((group) => (
                      <optgroup key={group.id} label={group.title}>
                        {group.assignments.map((assignment) => (
                          <option
                            key={assignment.assignment_id}
                            value={assignment.assignment_id}
                          >
                            {getAssignmentLabel(assignment)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </SelectField>

                  {selectedAssignment && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="font-semibold text-blue-950">
                        {selectedAssignment.project?.title ||
                          "Service Project"}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-blue-900">
                        Assigned task:{" "}
                        {selectedAssignment.assigned_task ||
                          selectedAssignment.schedule?.task_title ||
                          "Not specified"}
                      </p>

                      <p className="mt-2 text-xs text-blue-800">
                        Team:{" "}
                        {selectedAssignment.team_name || "Not specified"}
                        {" · "}
                        Responsibility:{" "}
                        {formatLabel(
                          selectedAssignment.responsibility_level,
                        )}
                      </p>
                    </div>
                  )}

                  <TextAreaField
                    label="Work Performed"
                    name="workPerformed"
                    value={form.workPerformed}
                    onChange={handleChange}
                    placeholder="Describe the work completed by the student."
                    required
                  />

                  <TextAreaField
                    label="Outcome"
                    name="outcome"
                    value={form.outcome}
                    onChange={handleChange}
                    placeholder="Describe the result or outcome of the work."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    {ratingFields.map((field) => (
                      <SelectField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        required
                      >
                        {ratingOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </SelectField>
                    ))}
                  </div>

                  <TextAreaField
                    label="Support Required"
                    name="supportRequired"
                    value={form.supportRequired}
                    onChange={handleChange}
                    placeholder="Describe support, coaching or follow-up required."
                  />

                  <TextAreaField
                    label="Supervisor Remarks"
                    name="supervisorRemarks"
                    value={form.supervisorRemarks}
                    onChange={handleChange}
                    placeholder="Add observations and remarks about the student."
                  />

                  <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      name="increasingResponsibility"
                      checked={form.increasingResponsibility}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700"
                    />

                    <span>
                      <span className="block font-semibold text-slate-800">
                        Increasing Responsibility
                      </span>

                      <span className="mt-1 block text-sm text-slate-500">
                        The student is ready for greater responsibility.
                      </span>
                    </span>
                  </label>

                  <SelectField
                    label="Recommended Responsibility Level"
                    name="recommendedResponsibilityLevel"
                    value={form.recommendedResponsibilityLevel}
                    onChange={handleChange}
                  >
                    <option value="">No recommendation</option>
                    <option value="guided">Guided</option>
                    <option value="supported">Supported</option>
                    <option value="independent">Independent</option>
                    <option value="team_lead">Team Lead</option>
                  </SelectField>
                </div>

                {(localError || workReportError?.message) && (
                  <div
                    role="alert"
                    className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    {localError || workReportError?.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    savingWorkReport ||
                    !form.studentAssignmentId ||
                    assignments.length === 0
                  }
                  className="mt-6 w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingWorkReport
                    ? "Saving Work Report..."
                    : "Save Work Report"}
                </button>
              </fieldset>
            </form>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-200 p-5">
                <h2 className="text-xl font-bold text-slate-950">
                  Work Report Status
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  {formatDate(date)} · Grouped by project
                </p>
              </header>

              {groups.length > 0 ? (
                groups.map((group) => (
                  <section key={group.id}>
                    <header className="border-y border-slate-200 bg-blue-50 px-5 py-4">
                      <h3 className="font-bold text-blue-950">
                        {group.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-600">
                        {group.assignments.length} student activity
                        assignments
                      </p>
                    </header>

                    <div className="divide-y divide-slate-200">
                      {group.assignments.map((assignment) => (
                        <WorkRecordCard
                          key={assignment.assignment_id}
                          assignment={assignment}
                          onSelect={selectAssignment}
                          disabled={savingWorkReport}
                        />
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="p-10 text-center">
                  <Users
                    aria-hidden="true"
                    className="mx-auto h-10 w-10 text-slate-300"
                  />

                  <h3 className="mt-4 font-bold text-slate-900">
                    No assignments for this selection
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose another date or project, or ask the Service
                    Coordinator to assign students.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </SupervisorLayout>
  );
}

function WorkRecordCard({ assignment, onSelect, disabled }) {
  const student = assignment.student || {};
  const schedule = assignment.schedule || {};
  const record = assignment.work_record;

  return (
    <article className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-950">
            {student.full_name || student.email || "Student"}
          </h4>

          {student.student_number && (
            <p className="mt-1 text-xs text-slate-500">
              {student.student_number}
            </p>
          )}

          <p className="mt-2 text-sm font-semibold text-blue-700">
            {schedule.task_title || "Scheduled Activity"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {formatDate(schedule.schedule_date)}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
            record
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {record ? "Recorded" : "Pending"}
        </span>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
        <p className="font-semibold text-slate-800">
          Assigned Task
        </p>

        <p className="mt-1 whitespace-pre-wrap text-slate-600">
          {assignment.assigned_task || "No specific task entered"}
        </p>
      </div>

      {record && (
        <>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {ratingFields.map((field) => (
              <Detail
                key={field.key}
                label={field.label}
                value={formatLabel(record[field.key])}
              />
            ))}
          </dl>

          <details className="mt-4 rounded-lg border border-slate-200">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-blue-950">
              View report details
            </summary>

            <dl className="space-y-3 border-t border-slate-200 p-4 text-sm">
              <Detail
                label="Work Performed"
                value={record.work_performed || "Not recorded"}
              />

              <Detail
                label="Outcome"
                value={record.outcome || "Not recorded"}
              />

              <Detail
                label="Support Required"
                value={record.support_required || "Not recorded"}
              />

              <Detail
                label="Supervisor Remarks"
                value={record.supervisor_remarks || "Not recorded"}
              />

              <Detail
                label="Increasing Responsibility"
                value={record.increasing_responsibility ? "Yes" : "No"}
              />

              <Detail
                label="Recommended Level"
                value={
                  record.recommended_responsibility_level
                    ? formatLabel(
                        record.recommended_responsibility_level,
                      )
                    : "No recommendation"
                }
              />
            </dl>
          </details>
        </>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(assignment.assignment_id)}
        className="mt-4 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50 disabled:opacity-60"
      >
        {record ? "Edit Work Report" : "Record Work Report"}
      </button>
    </article>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <textarea
        {...props}
        rows={4}
        className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <select
        {...props}
        className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      >
        {children}
      </select>
    </label>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
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

        <div className={`rounded-lg p-3 ${tones[tone]}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 whitespace-pre-wrap text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function PageMessage({ message, error = false }) {
  return (
    <main className="p-5 md:p-8">
      <div
        role={error ? "alert" : "status"}
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

function groupByProject(assignments) {
  const groups = new Map();

  for (const assignment of assignments) {
    const id = assignment.project?.project_id || "unavailable";

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        title: assignment.project?.title || "Service Project",
        assignments: [],
      });
    }

    groups.get(id).assignments.push(assignment);
  }

  return [...groups.values()].sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

function getAssignmentLabel(assignment) {
  const student =
    assignment.student?.full_name ||
    assignment.student?.email ||
    "Student";

  const activity =
    assignment.schedule?.task_title || "Scheduled Activity";

  return `${student} — ${activity}`;
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

function formatDate(value) {
  if (!value) return "Date not specified";

  const date = new Date(`${value}T12:00:00+01:00`);

  if (Number.isNaN(date.getTime())) return "Date not available";

  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatLabel(value) {
  if (!value) return "Not Observed";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}