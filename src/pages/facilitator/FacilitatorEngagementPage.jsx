import {
  AlertCircle,
  ClipboardCheck,
  RefreshCw,
  Save,
} from "lucide-react";

import { useState } from "react";

import {
  useFacilitatorDashboard,
} from "../../hooks/useFacilitatorDashboard";

import {
  useFacilitatorStudents,
} from "../../hooks/useFacilitatorStudents";

import FacilitatorLayout from "../../layouts/FacilitatorLayout";

const initialForm = {
  learningExperienceId: "",
  sessionId: "",
  studentProfileId: "",
  attendanceStatus: "present",
  preparationLevel: "not_observed",
  participationLevel: "not_observed",
  engagementLevel: "not_observed",
  contributionLevel: "not_observed",
  observation: "",
  learningObservation: "",
  concern: "",
  supportProvided: "",
  followUpRequired: false,
  followUpSupportRequired: "",
  followUpAction: "",
  followUpDueDate: "",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function FacilitatorEngagementPage() {
  const [form, setForm] =
    useState(initialForm);

  const [pageMessage, setPageMessage] =
    useState(null);

  const {
    facilitatorDashboard,
    facilitatorDashboardLoading,
    facilitatorDashboardFetching,
    facilitatorDashboardError,
    refreshFacilitatorDashboard,
    recordEngagement,
    recordingEngagement,
  } = useFacilitatorDashboard();

  const {
    facilitatorStudents,
    facilitatorStudentsLoading,
    facilitatorStudentsFetching,
    facilitatorStudentsError,
    refreshFacilitatorStudents,
  } = useFacilitatorStudents({
    learningExperienceId:
      form.learningExperienceId ||
      null,
  });

  const experiences =
    facilitatorDashboard?.experiences ||
    [];

  const upcomingSessions =
    facilitatorDashboard
      ?.upcomingSessions || [];

  const selectedExperience =
    experiences.find(
      (experience) =>
        getExperienceId(experience) ===
        form.learningExperienceId,
    );

  const sessions =
    upcomingSessions.filter(
      (session) =>
        !form.learningExperienceId ||
        getSessionExperienceId(
          session,
        ) ===
          form.learningExperienceId,
    );

  const students =
    facilitatorStudents.filter(
      (student) =>
        !form.learningExperienceId ||
        student.learning_experience_id ===
          form.learningExperienceId,
    );

  function updateField(
    field,
    value,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleExperienceChange(
    event,
  ) {
    setPageMessage(null);

    setForm((current) => ({
      ...current,
      learningExperienceId:
        event.target.value,
      sessionId: "",
      studentProfileId: "",
    }));
  }

  async function handleRefresh() {
    await Promise.all([
      refreshFacilitatorDashboard(),
      refreshFacilitatorStudents(),
    ]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPageMessage(null);

    try {
      await recordEngagement(form);

      setPageMessage({
        type: "success",
        text: "Student engagement recorded successfully.",
      });

      setForm((current) => ({
        ...initialForm,
        learningExperienceId:
          current.learningExperienceId,
        sessionId:
          current.sessionId,
      }));
    } catch (error) {
      setPageMessage({
        type: "error",
        text:
          error.message ||
          "Unable to record student engagement.",
      });
    }
  }

  if (
    facilitatorDashboardLoading
  ) {
    return (
      <FacilitatorLayout>
        <PageState message="Loading engagement information..." />
      </FacilitatorLayout>
    );
  }

  if (
    facilitatorDashboardError
  ) {
    return (
      <FacilitatorLayout>
        <PageState
          error
          message={
            facilitatorDashboardError
              .message ||
            "Unable to load engagement information."
          }
        />
      </FacilitatorLayout>
    );
  }

  return (
    <FacilitatorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Participation & Engagement
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Record Engagement
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Record attendance,
                preparation, participation,
                learning observations,
                support and required
                follow-up for a student.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={
                facilitatorDashboardFetching ||
                facilitatorStudentsFetching
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  facilitatorDashboardFetching ||
                  facilitatorStudentsFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </header>

          {pageMessage ? (
            <Message
              type={pageMessage.type}
              text={pageMessage.text}
            />
          ) : null}

          {experiences.length === 0 ? (
            <EmptyAssignmentState />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              <FormSection
                title="Session and Student"
                description="Select the assigned learning experience, session and student."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Learning Experience"
                    required
                  >
                    <select
                      required
                      value={
                        form.learningExperienceId
                      }
                      onChange={
                        handleExperienceChange
                      }
                      className={inputClass}
                    >
                      <option value="">
                        Select a learning experience
                      </option>

                      {experiences.map(
                        (experience) => {
                          const id =
                            getExperienceId(
                              experience,
                            );

                          return (
                            <option
                              key={id}
                              value={id}
                            >
                              {experience.code
                                ? `${experience.code} — `
                                : ""}
                              {experience.title}
                            </option>
                          );
                        },
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="Session"
                    required
                  >
                    <select
                      required
                      disabled={
                        !form.learningExperienceId
                      }
                      value={
                        form.sessionId
                      }
                      onChange={(event) =>
                        updateField(
                          "sessionId",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    >
                      <option value="">
                        Select a session
                      </option>

                      {sessions.map(
                        (session) => (
                          <option
                            key={
                              session.session_id ||
                              session.id
                            }
                            value={
                              session.session_id ||
                              session.id
                            }
                          >
                            {
                              session.session_title
                            }
                            {session.session_date
                              ? ` — ${formatDate(
                                  session.session_date,
                                )}`
                              : ""}
                          </option>
                        ),
                      )}
                    </select>

                    {form.learningExperienceId &&
                    sessions.length === 0 ? (
                      <FieldHint text="No upcoming session is available for this learning experience." />
                    ) : null}
                  </FormField>

                  <FormField
                    label="Student"
                    required
                  >
                    <select
                      required
                      disabled={
                        !form.learningExperienceId ||
                        facilitatorStudentsLoading
                      }
                      value={
                        form.studentProfileId
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
                        {facilitatorStudentsLoading
                          ? "Loading students..."
                          : "Select a student"}
                      </option>

                      {students.map(
                        (student) => (
                          <option
                            key={
                              student.enrollment_id
                            }
                            value={
                              student.student_profile_id
                            }
                          >
                            {student.full_name ||
                              "Student"}
                            {student.student_number
                              ? ` — ${student.student_number}`
                              : ""}
                          </option>
                        ),
                      )}
                    </select>

                    {form.learningExperienceId &&
                    !facilitatorStudentsLoading &&
                    students.length === 0 ? (
                      <FieldHint text="No students are enrolled in this learning experience." />
                    ) : null}
                  </FormField>

                  <FormField
                    label="Attendance"
                    required
                  >
                    <select
                      required
                      value={
                        form.attendanceStatus
                      }
                      onChange={(event) =>
                        updateField(
                          "attendanceStatus",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    >
                      <option value="present">
                        Present
                      </option>

                      <option value="late">
                        Late
                      </option>

                      <option value="absent">
                        Absent
                      </option>

                      <option value="excused">
                        Excused
                      </option>

                      <option value="remote">
                        Remote
                      </option>
                    </select>
                  </FormField>
                </div>

                {selectedExperience ? (
                  <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <p className="font-semibold text-blue-900">
                      {
                        selectedExperience.title
                      }
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      {students.length} enrolled
                      student
                      {students.length === 1
                        ? ""
                        : "s"}{" "}
                      • {sessions.length} available
                      session
                      {sessions.length === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                ) : null}
              </FormSection>

              <FormSection
                title="Engagement Assessment"
                description="Assess what was observed during the selected session."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <LevelSelect
                    label="Preparation Level"
                    value={
                      form.preparationLevel
                    }
                    options={[
                      "not_observed",
                      "needs_support",
                      "developing",
                      "prepared",
                      "highly_prepared",
                    ]}
                    onChange={(value) =>
                      updateField(
                        "preparationLevel",
                        value,
                      )
                    }
                  />

                  <LevelSelect
                    label="Participation Level"
                    value={
                      form.participationLevel
                    }
                    options={[
                      "not_observed",
                      "needs_support",
                      "developing",
                      "participating",
                      "highly_participative",
                    ]}
                    onChange={(value) =>
                      updateField(
                        "participationLevel",
                        value,
                      )
                    }
                  />

                  <LevelSelect
                    label="Engagement Level"
                    value={
                      form.engagementLevel
                    }
                    options={[
                      "not_observed",
                      "disengaged",
                      "developing",
                      "engaged",
                      "highly_engaged",
                    ]}
                    onChange={(value) =>
                      updateField(
                        "engagementLevel",
                        value,
                      )
                    }
                  />

                  <LevelSelect
                    label="Contribution Level"
                    value={
                      form.contributionLevel
                    }
                    options={[
                      "not_observed",
                      "needs_support",
                      "developing",
                      "contributing",
                      "strong_contribution",
                    ]}
                    onChange={(value) =>
                      updateField(
                        "contributionLevel",
                        value,
                      )
                    }
                  />
                </div>
              </FormSection>

              <FormSection
                title="Observations and Support"
                description="Record useful evidence, observations, concerns and support."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <TextAreaField
                    label="General Observation"
                    value={form.observation}
                    onChange={(value) =>
                      updateField(
                        "observation",
                        value,
                      )
                    }
                    placeholder="Describe the student's participation and behaviour."
                  />

                  <TextAreaField
                    label="Learning Observation"
                    value={
                      form.learningObservation
                    }
                    onChange={(value) =>
                      updateField(
                        "learningObservation",
                        value,
                      )
                    }
                    placeholder="Describe evidence of learning, understanding or progress."
                  />

                  <TextAreaField
                    label="Concern"
                    value={form.concern}
                    onChange={(value) =>
                      updateField(
                        "concern",
                        value,
                      )
                    }
                    placeholder="Record any concern requiring attention."
                  />

                  <TextAreaField
                    label="Support Provided"
                    value={
                      form.supportProvided
                    }
                    onChange={(value) =>
                      updateField(
                        "supportProvided",
                        value,
                      )
                    }
                    placeholder="Describe the support provided during the session."
                  />
                </div>
              </FormSection>

              <FormSection
                title="Follow-Up"
                description="Create a follow-up action when the student needs additional support."
              >
                <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
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
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                  />

                  <span>
                    <span className="block font-semibold text-slate-900">
                      Follow-up required
                    </span>

                    <span className="mt-1 block text-sm text-slate-500">
                      Enable this when an
                      additional support action
                      must be monitored.
                    </span>
                  </span>
                </label>

                {form.followUpRequired ? (
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <TextAreaField
                      label="Support Required"
                      value={
                        form.followUpSupportRequired
                      }
                      onChange={(value) =>
                        updateField(
                          "followUpSupportRequired",
                          value,
                        )
                      }
                      placeholder="Describe the support the student requires."
                    />

                    <TextAreaField
                      label="Required Action"
                      required
                      value={
                        form.followUpAction
                      }
                      onChange={(value) =>
                        updateField(
                          "followUpAction",
                          value,
                        )
                      }
                      placeholder="Describe the action that must be completed."
                    />

                    <FormField label="Due Date">
                      <input
                        type="date"
                        value={
                          form.followUpDueDate
                        }
                        onChange={(event) =>
                          updateField(
                            "followUpDueDate",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                ) : null}
              </FormSection>

              {facilitatorStudentsError ? (
                <Message
                  type="error"
                  text={
                    facilitatorStudentsError
                      .message ||
                    "Unable to load students."
                  }
                />
              ) : null}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    recordingEngagement ||
                    !form.learningExperienceId ||
                    !form.sessionId ||
                    !form.studentProfileId
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {recordingEngagement ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}

                  {recordingEngagement
                    ? "Saving..."
                    : "Save Engagement"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </FacilitatorLayout>
  );
}

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      {required ? (
        <span className="ml-1 text-red-600">
          *
        </span>
      ) : null}

      {children}
    </label>
  );
}

function LevelSelect({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <FormField label={label}>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClass}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </FormField>
  );
}

function TextAreaField({
  label,
  required = false,
  value,
  onChange,
  placeholder,
}) {
  return (
    <FormField
      label={label}
      required={required}
    >
      <textarea
        required={required}
        rows={4}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />
    </FormField>
  );
}

function Message({
  type,
  text,
}) {
  const error = type === "error";

  return (
    <div
      className={`mt-6 flex items-start gap-3 rounded-lg border p-4 text-sm font-medium ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ? (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      <p>{text}</p>
    </div>
  );
}

function EmptyAssignmentState() {
  return (
    <section className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <ClipboardCheck className="mx-auto h-12 w-12 text-slate-300" />

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        No assigned learning experience
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        You must have an active learning
        experience assignment before recording
        student engagement.
      </p>
    </section>
  );
}

function PageState({
  message,
  error = false,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
        className={`mx-auto max-w-3xl rounded-xl border p-6 ${
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

function FieldHint({
  text,
}) {
  return (
    <span className="mt-2 block text-xs font-normal text-amber-700">
      {text}
    </span>
  );
}

function getExperienceId(
  experience,
) {
  return (
    experience.learning_experience_id ||
    experience.experience_id ||
    experience.id ||
    ""
  );
}

function getSessionExperienceId(
  session,
) {
  return (
    session.learning_experience_id ||
    session.experience_id ||
    ""
  );
}

function formatLabel(value) {
  if (!value) {
    return "Not specified";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(value) {
  if (!value) {
    return "Date not specified";
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