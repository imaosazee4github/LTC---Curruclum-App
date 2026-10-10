import {
  CheckCircle2,
  ClipboardPlus,
  RefreshCw,
} from "lucide-react";

import { useState } from "react";

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

export default function RecordCoachingPage() {
  const {
    coachDashboard,
    coachDashboardLoading,
    coachDashboardError,
    recordSession,
    recordingSession,
    recordSessionError,
    resetRecordSession,
  } = useCoachDashboard();

  const [form, setForm] =
    useState(initialForm);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const assignments =
    Array.isArray(
      coachDashboard?.assignments,
    )
      ? coachDashboard.assignments.filter(
          (assignment) =>
            assignment.status ===
            "active",
        )
      : [];

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setSuccessMessage("");
    resetRecordSession();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");

    try {
      const result =
        await recordSession(form);

      setSuccessMessage(
        result?.message ||
          "The coaching session was recorded successfully.",
      );

      setForm(initialForm);
    } catch {
      // The mutation error is displayed below.
    }
  }

  if (coachDashboardLoading) {
    return (
      <CoachLayout>
        <PageState message="Loading coaching assignments..." />
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <main className="px-5 py-8 md:px-8">
        <section className="mx-auto max-w-5xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
              Capability Development
            </p>

            <h1 className="mt-1 text-3xl font-bold text-blue-950">
              Record Coaching
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              Record a coaching session,
              student performance,
              practice, progress,
              feedback, next goals and
              required follow-up.
            </p>
          </div>

          {coachDashboardError ? (
            <Alert
              type="error"
              message={
                coachDashboardError.message
              }
            />
          ) : null}

          {successMessage ? (
            <Alert
              type="success"
              message={successMessage}
            />
          ) : null}

          {assignments.length === 0 ? (
            <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <ClipboardPlus className="mx-auto h-10 w-10 text-slate-400" />

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No active coaching assignment
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                A Super Administrator
                must assign a student to
                you before you can record
                a coaching session.
              </p>
            </section>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Student Assignment"
                  required
                >
                  <select
                    name="assignmentId"
                    value={
                      form.assignmentId
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className={inputClass}
                  >
                    <option value="">
                      Select an assigned
                      student
                    </option>

                    {assignments.map(
                      (assignment) => (
                        <option
                          key={
                            assignment.assignment_id ||
                            assignment.id
                          }
                          value={
                            assignment.assignment_id ||
                            assignment.id
                          }
                        >
                          {getAssignmentLabel(
                            assignment,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </FormField>

                <FormField label="Session Date">
                  <input
                    type="date"
                    name="sessionDate"
                    value={
                      form.sessionDate
                    }
                    onChange={
                      handleChange
                    }
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="mt-5">
                <FormField
                  label="Session Summary"
                  required
                >
                  <textarea
                    name="sessionSummary"
                    value={
                      form.sessionSummary
                    }
                    onChange={
                      handleChange
                    }
                    required
                    rows={4}
                    placeholder="Summarize what was discussed and practised during the coaching session."
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <TextArea
                  label="Performance"
                  name="performance"
                  value={
                    form.performance
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the student's performance."
                />

                <TextArea
                  label="Practice"
                  name="practice"
                  value={form.practice}
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the practice completed."
                />

                <TextArea
                  label="Feedback"
                  name="feedback"
                  value={form.feedback}
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Enter coaching feedback."
                />

                <TextArea
                  label="Progress"
                  name="progress"
                  value={form.progress}
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the progress made."
                />

                <TextArea
                  label="Improvement"
                  name="improvement"
                  value={
                    form.improvement
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe areas of improvement."
                />

                <TextArea
                  label="Challenges"
                  name="challenges"
                  value={
                    form.challenges
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe any challenges."
                />

                <TextArea
                  label="Support"
                  name="support"
                  value={form.support}
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the support required or provided."
                />

                <TextArea
                  label="Next Goal"
                  name="nextGoal"
                  value={form.nextGoal}
                  onChange={
                    handleChange
                  }
                  placeholder="Enter the student's next goal."
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Practice Adjustment"
                    name="practiceAdjustment"
                    value={
                      form.practiceAdjustment
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Describe any change required in the practice plan."
                  />
                </div>
              </div>

              <section className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="followUpRequired"
                    checked={
                      form.followUpRequired
                    }
                    onChange={
                      handleChange
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-950"
                  />

                  <span>
                    <span className="block font-bold text-slate-900">
                      Follow-up required
                    </span>

                    <span className="mt-1 block text-sm text-slate-600">
                      Create a follow-up
                      action for this
                      student.
                    </span>
                  </span>
                </label>

                {form.followUpRequired ? (
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <FormField
                      label="Improvement Area"
                      required
                    >
                      <textarea
                        name="followUpImprovementArea"
                        value={
                          form.followUpImprovementArea
                        }
                        onChange={
                          handleChange
                        }
                        required
                        rows={3}
                        className={
                          inputClass
                        }
                        placeholder="State the area requiring improvement."
                      />
                    </FormField>

                    <FormField
                      label="Follow-Up Action"
                      required
                    >
                      <textarea
                        name="followUpAction"
                        value={
                          form.followUpAction
                        }
                        onChange={
                          handleChange
                        }
                        required
                        rows={3}
                        className={
                          inputClass
                        }
                        placeholder="Describe the action to be taken."
                      />
                    </FormField>

                    <FormField label="Due Date">
                      <input
                        type="date"
                        name="followUpDueDate"
                        value={
                          form.followUpDueDate
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          inputClass
                        }
                      />
                    </FormField>
                  </div>
                ) : null}
              </section>

              {recordSessionError ? (
                <Alert
                  type="error"
                  message={
                    recordSessionError.message
                  }
                />
              ) : null}

              <button
                type="submit"
                disabled={
                  recordingSession
                }
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2
                  size={19}
                />

                {recordingSession
                  ? "Recording Session..."
                  : "Record Coaching Session"}
              </button>
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
    <FormField
      label={label}
      required={required}
    >
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

function FormField({
  label,
  required,
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

function Alert({
  type,
  message,
}) {
  const success =
    type === "success";

  return (
    <div
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

function PageState({
  message,
}) {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5">
      <div className="text-center">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-900" />

        <p className="mt-4 font-semibold text-slate-700">
          {message}
        </p>
      </div>
    </main>
  );
}

function getAssignmentLabel(
  assignment,
) {
  const studentName =
    assignment.student?.full_name ||
    assignment.student_name ||
    assignment.full_name ||
    "Student";

  const developmentArea =
    assignment.development_area ||
    assignment.developmentArea ||
    "Development area";

  return `${studentName} — ${developmentArea}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100";