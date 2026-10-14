import {
  BookOpenCheck,
  RefreshCw,
  Save,
} from "lucide-react";

import { useState } from "react";

import { useInstructorDashboard } from "../../hooks/useInstructorDashboard";
import InstructorLayout from "../../layouts/InstructorLayout";

const initialForm = {
  classId: "",
  studentProfileId: "",
  recordType: "progress",
  learningStatus: "not_assessed",
  sessionId: "",
  activityTitle: "",
  observation: "",
  evidenceDescription: "",
  evidenceUrl: "",
  strengths: "",
  developmentArea: "",
  feedback: "",
  concern: "",
  followUpRequired: false,
  followUpAction: "",
  followUpStatus: "open",
};

export default function InstructorLearningPage() {
  const [form, setForm] =
    useState(initialForm);

  const [message, setMessage] =
    useState(null);

  const {
    instructorDashboard,
    instructorStudents,
    instructorDashboardLoading,
    instructorStudentsLoading,
    instructorDashboardError,
    instructorStudentsError,
    saveLearningRecord,
    savingLearningRecord,
    learningRecordError,
    resetLearningRecord,
    refreshInstructorDashboard,
  } = useInstructorDashboard({
    classId: form.classId || null,
  });

  const courses =
    instructorDashboard?.courses || [];

  const sessions =
    instructorDashboard?.upcomingSessions ||
    [];

  const classes = courses.flatMap(
    (course) =>
      (course.classes || []).map(
        (classItem) => ({
          ...classItem,
          course_code: course.code,
          course_title: course.title,
        }),
      ),
  );

  const classSessions =
    sessions.filter(
      (session) =>
        session.class_id ===
        form.classId,
    );

  function updateField(
    field,
    value,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage(null);
    resetLearningRecord();
  }

  function handleClassChange(
    event,
  ) {
    const classId =
      event.target.value;

    setForm((current) => ({
      ...current,
      classId,
      studentProfileId: "",
      sessionId: "",
    }));

    setMessage(null);
    resetLearningRecord();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    try {
      await saveLearningRecord(form);

      setMessage({
        type: "success",
        text: "Student learning record saved successfully.",
      });

      setForm((current) => ({
        ...initialForm,
        classId: current.classId,
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to save the learning record.",
      });
    }
  }

  if (instructorDashboardLoading) {
    return (
      <InstructorLayout>
        <PageMessage message="Loading learning-record information..." />
      </InstructorLayout>
    );
  }

  if (instructorDashboardError) {
    return (
      <InstructorLayout>
        <PageMessage
          error
          message={
            instructorDashboardError
              .message ||
            "Unable to load learning-record information."
          }
        />
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Learning Progress
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Record Learning
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Record learning activities,
                evidence, observations,
                feedback, concerns and
                required follow-up.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshInstructorDashboard()
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </header>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5 text-blue-800">
                  <BookOpenCheck
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Student Learning Record
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Complete at least one
                    activity, observation,
                    evidence, feedback or
                    concern field.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-8 p-6"
            >
              {message ? (
                <Alert
                  type={message.type}
                  text={message.text}
                />
              ) : null}

              {learningRecordError &&
              !message ? (
                <Alert
                  type="error"
                  text={
                    learningRecordError.message
                  }
                />
              ) : null}

              <FormSection title="Student and class">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Class"
                    required
                  >
                    <select
                      required
                      value={form.classId}
                      onChange={
                        handleClassChange
                      }
                      className={inputClass}
                    >
                      <option value="">
                        Select a class
                      </option>

                      {classes.map(
                        (classItem) => (
                          <option
                            key={
                              classItem.class_id
                            }
                            value={
                              classItem.class_id
                            }
                          >
                            {
                              classItem.course_code
                            }{" "}
                            — {classItem.name}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="Student"
                    required
                  >
                    <select
                      required
                      value={
                        form.studentProfileId
                      }
                      disabled={
                        !form.classId ||
                        instructorStudentsLoading
                      }
                      onChange={(event) =>
                        updateField(
                          "studentProfileId",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    >
                      <option value="">
                        {instructorStudentsLoading
                          ? "Loading students..."
                          : "Select a student"}
                      </option>

                      {instructorStudents.map(
                        (student) => (
                          <option
                            key={
                              student
                                .class_enrollment_id
                            }
                            value={
                              student
                                .student_profile_id
                            }
                          >
                            {
                              student.full_name
                            }
                            {student.student_number
                              ? ` — ${student.student_number}`
                              : ""}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField label="Related Session">
                    <select
                      value={form.sessionId}
                      disabled={!form.classId}
                      onChange={(event) =>
                        updateField(
                          "sessionId",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    >
                      <option value="">
                        No session selected
                      </option>

                      {classSessions.map(
                        (session) => (
                          <option
                            key={
                              session.session_id
                            }
                            value={
                              session.session_id
                            }
                          >
                            {formatDate(
                              session.session_date,
                            )}
                            {" — "}
                            {session.title}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="Record Type"
                    required
                  >
                    <select
                      required
                      value={form.recordType}
                      onChange={(event) =>
                        updateField(
                          "recordType",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    >
                      <option value="activity">
                        Activity
                      </option>
                      <option value="evidence">
                        Evidence
                      </option>
                      <option value="progress">
                        Progress
                      </option>
                      <option value="feedback">
                        Feedback
                      </option>
                      <option value="concern">
                        Concern
                      </option>
                    </select>
                  </FormField>

                  <FormField
                    label="Learning Status"
                    required
                  >
                    <select
                      required
                      value={
                        form.learningStatus
                      }
                      onChange={(event) =>
                        updateField(
                          "learningStatus",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    >
                      <option value="not_assessed">
                        Not Assessed
                      </option>
                      <option value="beginning">
                        Beginning
                      </option>
                      <option value="developing">
                        Developing
                      </option>
                      <option value="competent">
                        Competent
                      </option>
                      <option value="independent">
                        Independent
                      </option>
                      <option value="advanced">
                        Advanced
                      </option>
                    </select>
                  </FormField>
                </div>

                {instructorStudentsError ? (
                  <Alert
                    type="error"
                    text={
                      instructorStudentsError
                        .message
                    }
                  />
                ) : null}
              </FormSection>

              <FormSection title="Activity and observation">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Activity Title">
                    <input
                      type="text"
                      value={
                        form.activityTitle
                      }
                      onChange={(event) =>
                        updateField(
                          "activityTitle",
                          event.target.value,
                        )
                      }
                      placeholder="Learning activity or assessment"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Observation">
                    <textarea
                      rows="4"
                      value={form.observation}
                      onChange={(event) =>
                        updateField(
                          "observation",
                          event.target.value,
                        )
                      }
                      placeholder="What did you observe?"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Evidence">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Evidence Description">
                    <textarea
                      rows="4"
                      value={
                        form.evidenceDescription
                      }
                      onChange={(event) =>
                        updateField(
                          "evidenceDescription",
                          event.target.value,
                        )
                      }
                      placeholder="Describe the work or evidence produced"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Evidence URL">
                    <input
                      type="url"
                      value={form.evidenceUrl}
                      onChange={(event) =>
                        updateField(
                          "evidenceUrl",
                          event.target.value,
                        )
                      }
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Development and feedback">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Strengths">
                    <textarea
                      rows="4"
                      value={form.strengths}
                      onChange={(event) =>
                        updateField(
                          "strengths",
                          event.target.value,
                        )
                      }
                      placeholder="Skills or strengths demonstrated"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Development Area">
                    <textarea
                      rows="4"
                      value={
                        form.developmentArea
                      }
                      onChange={(event) =>
                        updateField(
                          "developmentArea",
                          event.target.value,
                        )
                      }
                      placeholder="Area requiring further development"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Feedback">
                    <textarea
                      rows="4"
                      value={form.feedback}
                      onChange={(event) =>
                        updateField(
                          "feedback",
                          event.target.value,
                        )
                      }
                      placeholder="Feedback provided to the student"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Concern">
                    <textarea
                      rows="4"
                      value={form.concern}
                      onChange={(event) =>
                        updateField(
                          "concern",
                          event.target.value,
                        )
                      }
                      placeholder="Record any learning concern"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Follow-up">
                <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <input
                    type="checkbox"
                    checked={
                      form.followUpRequired
                    }
                    onChange={(event) =>
                      updateField(
                        "followUpRequired",
                        event.target.checked,
                      )
                    }
                    className="mt-1 h-4 w-4"
                  />

                  <span>
                    <span className="block font-semibold text-slate-900">
                      Follow-up required
                    </span>

                    <span className="mt-1 block text-sm text-slate-600">
                      Create an action requiring
                      continued instructor
                      attention.
                    </span>
                  </span>
                </label>

                {form.followUpRequired ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      label="Required Action"
                      required
                    >
                      <textarea
                        required
                        rows="4"
                        value={
                          form.followUpAction
                        }
                        onChange={(event) =>
                          updateField(
                            "followUpAction",
                            event.target.value,
                          )
                        }
                        placeholder="Describe the required action"
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
                          updateField(
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
                          In Progress
                        </option>
                        <option value="resolved">
                          Resolved
                        </option>
                        <option value="closed">
                          Closed
                        </option>
                      </select>
                    </FormField>
                  </div>
                ) : null}
              </FormSection>

              <button
                type="submit"
                disabled={
                  savingLearningRecord ||
                  !form.classId ||
                  !form.studentProfileId
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />

                {savingLearningRecord
                  ? "Saving..."
                  : "Save Learning Record"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </InstructorLayout>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

function FormSection({
  title,
  children,
}) {
  return (
    <section className="space-y-5">
      <h3 className="border-b border-slate-200 pb-3 text-base font-bold text-slate-950">
        {title}
      </h3>

      {children}
    </section>
  );
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required ? (
          <span className="text-red-600">
            {" "}*
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

function Alert({
  type,
  text,
}) {
  const style =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${style}`}
    >
      {text}
    </div>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="p-8">
      <div
        className={`mx-auto max-w-xl rounded-xl border p-6 text-center ${
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

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(`${value}T00:00:00`),
  );
}