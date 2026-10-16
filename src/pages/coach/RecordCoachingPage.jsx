import {
  CheckCircle2,
  ClipboardPlus,
  RefreshCw,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

import { useCoachDashboard } from "../../hooks/useCoachDashboard";
import CoachLayout from "../../layouts/CoachLayout";

const initialForm = {
  assignmentId: "",
  sessionDate: "",
  sessionSummary: "",
  performance: "",
  practice: "",
  feedback: "",
  progress: "",
  improvement: "",
  challenges: "",
  support: "",
  nextGoal: "",
  practiceAdjustment: "",
  followUpRequired: false,
  followUpImprovementArea: "",
  followUpAction: "",
  followUpDueDate: "",
};

const coachingFields = [
  {
    label: "Performance",
    name: "performance",
    placeholder: "Describe the student's performance.",
  },
  {
    label: "Practice",
    name: "practice",
    placeholder: "Describe the practice completed.",
  },
  {
    label: "Feedback",
    name: "feedback",
    placeholder: "Enter coaching feedback.",
    required: true,
  },
  {
    label: "Progress",
    name: "progress",
    placeholder: "Describe the progress made.",
  },
  {
    label: "Improvement",
    name: "improvement",
    placeholder: "Describe areas of improvement.",
  },
  {
    label: "Challenges",
    name: "challenges",
    placeholder: "Describe any challenges.",
  },
  {
    label: "Support",
    name: "support",
    placeholder: "Describe the support required or provided.",
  },
  {
    label: "Next Goal",
    name: "nextGoal",
    placeholder: "Enter the student's next goal.",
  },
];

export default function RecordCoachingPage() {
  const {
    coachDashboard,
    coachDashboardLoading,
    coachDashboardError,
    refreshCoachDashboard,
    recordSession,
    recordingSession,
    recordSessionError,
    resetRecordSession,
  } = useCoachDashboard();

  const [form, setForm] = useState(initialForm);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const assignments = Array.isArray(coachDashboard?.assignments)
    ? coachDashboard.assignments.filter(
        (assignment) => assignment.status === "active",
      )
    : [];

  const selectedAssignment = assignments.find(
    (assignment) =>
      getAssignmentId(assignment) === form.assignmentId,
  );

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccessMessage("");
    setValidationError("");
    resetRecordSession();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (recordingSession) return;

    setSuccessMessage("");
    setValidationError("");

    if (!selectedAssignment) {
      setValidationError("Select an active student and course.");
      return;
    }

    if (!form.sessionSummary.trim() || !form.feedback.trim()) {
      setValidationError("Enter a session summary and coaching feedback.");
      return;
    }

    if (
      form.followUpRequired &&
      (!form.followUpImprovementArea.trim() ||
        !form.followUpAction.trim())
    ) {
      setValidationError(
        "Enter the improvement area and action required for the follow-up.",
      );
      return;
    }

    try {
      const result = await recordSession({
        ...form,
        followUpImprovementArea: form.followUpRequired
          ? form.followUpImprovementArea
          : "",
        followUpAction: form.followUpRequired
          ? form.followUpAction
          : "",
        followUpDueDate: form.followUpRequired
          ? form.followUpDueDate
          : "",
      });

      setSuccessMessage(
        result?.message ||
          "The coaching session was recorded successfully.",
      );

      setForm({ ...initialForm });
    } catch {
      // The mutation error is displayed below.
    }
  }

  if (coachDashboardLoading) {
    return (
      <CoachLayout>
        <PageState message="Loading your students and courses..." />
      </CoachLayout>
    );
  }

  if (coachDashboardError) {
    return (
      <CoachLayout>
        <main className="px-5 py-8 md:px-8">
          <section className="mx-auto max-w-5xl">
            <Alert
              type="error"
              message={
                coachDashboardError.message ||
                "Your students and courses could not be loaded."
              }
            />

            <button
              type="button"
              onClick={() => refreshCoachDashboard()}
              className="mt-4 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white"
            >
              Try Again
            </button>
          </section>
        </main>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <main className="px-5 py-8 md:px-8">
        <section className="mx-auto max-w-5xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
                Coach Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-blue-950">
                Record Coaching
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Select a student and course, then record the session,
                feedback, progress and any required follow-up.
                Fields marked * are required.
              </p>
            </div>

            <Link
              to="/coach/records"
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Coaching Records
            </Link>
          </header>

          {successMessage && (
            <Alert type="success" message={successMessage} />
          )}

          {assignments.length === 0 ? (
            <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <ClipboardPlus
                aria-hidden="true"
                className="mx-auto h-10 w-10 text-slate-400"
              />

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No active students and courses
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-slate-500">
                Students appear automatically when an administrator assigns
                you as a coach to their course in Staff Management.
                Session recording requires an active coaching assignment.
              </p>
            </section>
          ) : (
            <form
              onSubmit={handleSubmit}
              aria-busy={recordingSession}
              className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <fieldset
                disabled={recordingSession}
                className="min-w-0"
              >
                <legend className="sr-only">
                  Coaching session details
                </legend>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Student and Course" required>
                    <select
                      name="assignmentId"
                      value={form.assignmentId}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">
                        Select a student and course
                      </option>

                      {assignments.map((assignment) => (
                        <option
                          key={getAssignmentId(assignment)}
                          value={getAssignmentId(assignment)}
                        >
                          {getAssignmentLabel(assignment)}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Session Date">
                    <input
                      type="date"
                      name="sessionDate"
                      value={form.sessionDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </FormField>
                </div>

                {selectedAssignment && (
                  <section
                    aria-label="Selected coaching assignment"
                    className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4"
                  >
                    <p className="font-semibold text-blue-950">
                      {getAssignmentLabel(selectedAssignment)}
                    </p>

                    {selectedAssignment.goal && (
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        <span className="font-semibold">Coaching goal: </span>
                        {selectedAssignment.goal}
                      </p>
                    )}
                  </section>
                )}

                <div className="mt-5">
                  <FormField label="Session Summary" required>
                    <textarea
                      name="sessionSummary"
                      value={form.sessionSummary}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Summarize what was discussed and practised during the coaching session."
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {coachingFields.map((field) => (
                    <TextArea
                      key={field.name}
                      {...field}
                      value={form[field.name]}
                      onChange={handleChange}
                    />
                  ))}

                  <div className="md:col-span-2">
                    <TextArea
                      label="Practice Adjustment"
                      name="practiceAdjustment"
                      value={form.practiceAdjustment}
                      onChange={handleChange}
                      placeholder="Describe any change required in the practice plan."
                    />
                  </div>
                </div>

                <section className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="followUpRequired"
                      checked={form.followUpRequired}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-950"
                    />

                    <span>
                      <span className="block font-bold text-slate-900">
                        Follow-up required
                      </span>

                      <span className="mt-1 block text-sm text-slate-600">
                        Create a follow-up action for this student.
                      </span>
                    </span>
                  </label>

                  {form.followUpRequired && (
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <TextArea
                        label="Improvement Area"
                        name="followUpImprovementArea"
                        value={form.followUpImprovementArea}
                        onChange={handleChange}
                        required
                        placeholder="State the area requiring improvement."
                      />

                      <TextArea
                        label="Follow-Up Action"
                        name="followUpAction"
                        value={form.followUpAction}
                        onChange={handleChange}
                        required
                        placeholder="Describe the action to be taken."
                      />

                      <FormField label="Due Date">
                        <input
                          type="date"
                          name="followUpDueDate"
                          value={form.followUpDueDate}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </FormField>
                    </div>
                  )}
                </section>

                {(validationError || recordSessionError) && (
                  <Alert
                    type="error"
                    message={
                      validationError ||
                      recordSessionError?.message ||
                      "The coaching session could not be recorded."
                    }
                  />
                )}

                <button
                  type="submit"
                  disabled={recordingSession}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {recordingSession ? (
                    <RefreshCw
                      aria-hidden="true"
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 aria-hidden="true" size={19} />
                  )}

                  {recordingSession
                    ? "Recording Session..."
                    : "Record Coaching Session"}
                </button>
              </fieldset>
            </form>
          )}
        </section>
      </main>
    </CoachLayout>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <FormField label={label} required={required}>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={3}
        placeholder={placeholder}
        className={inputClass}
      />
    </FormField>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span aria-hidden="true" className="text-red-600">
            {" "}*
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function Alert({ type, message }) {
  const success = type === "success";

  return (
    <div
      role={success ? "status" : "alert"}
      className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {message}
    </div>
  );
}

function PageState({ message }) {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5">
      <div role="status" className="text-center">
        <RefreshCw
          aria-hidden="true"
          className="mx-auto h-8 w-8 animate-spin text-blue-900"
        />

        <p className="mt-4 font-semibold text-slate-700">
          {message}
        </p>
      </div>
    </main>
  );
}

function getAssignmentId(assignment) {
  return assignment.assignment_id || assignment.id;
}

function getAssignmentLabel(assignment) {
  const studentName =
    assignment.student?.full_name ||
    assignment.student_name ||
    assignment.full_name ||
    "Student";

  const course =
    assignment.development_area ||
    assignment.developmentArea ||
    "Course / Development Area";

  return `${studentName} — ${course}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";