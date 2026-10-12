import {
  BookOpen,
  CalendarDays,
  CalendarPlus,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";

import {
  useState,
} from "react";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";

import {
  useLearningExperienceManagement,
} from "../../hooks/useLearningExperienceManagement";

const initialExperienceForm = {
  code: "",
  title: "",
  description: "",
  learningObjectives: "",
  cohortId: "",
  deliveryMode: "in_person",
  location: "",
  startDate: "",
  endDate: "",
  status: "planned",
  enrollCohortStudents: true,
};

const initialAssignmentForm = {
  learningExperienceId: "",
  facilitatorStaffProfileId: "",
  assignmentRole: "facilitator",
  notes: "",
};

const initialSessionForm = {
  learningExperienceId: "",
  title: "",
  sessionDate: "",
  startTime: "",
  endTime: "",
  sessionNumber: "",
  topic: "",
  learningObjectives: "",
  deliveryMode: "in_person",
  location: "",
  status: "scheduled",
  notes: "",
};

export default function LearningExperienceManagementPage() {
  const {
    learningExperienceSummary,
    learningExperiences,
    eligibleFacilitators,
    programmeCohorts,
    learningExperiencesLoading,
    learningExperiencesFetching,
    learningExperiencesError,
    refreshLearningExperiences,
    createExperience,
    creatingExperience,
    assignFacilitator,
    assigningFacilitator,
    closeFacilitatorAssignment,
    closingFacilitatorAssignment,
    createSession,
    creatingSession,
  } = useLearningExperienceManagement();

  const [
    experienceForm,
    setExperienceForm,
  ] = useState(
    initialExperienceForm,
  );

  const [
    assignmentForm,
    setAssignmentForm,
  ] = useState(
    initialAssignmentForm,
  );

  const [
    sessionForm,
    setSessionForm,
  ] = useState(
    initialSessionForm,
  );

  const [
    pageMessage,
    setPageMessage,
  ] = useState(null);

  async function handleCreateExperience(
    event,
  ) {
    event.preventDefault();
    setPageMessage(null);

    try {
      const result =
        await createExperience(
          experienceForm,
        );

      setPageMessage({
        type: "success",
        text:
          result?.enrolledStudents > 0
            ? `Learning experience created and ${result.enrolledStudents} students enrolled.`
            : "Learning experience created successfully.",
      });

      setExperienceForm(
        initialExperienceForm,
      );
    } catch (error) {
      setPageMessage({
        type: "error",
        text:
          error.message ||
          "Unable to create the learning experience.",
      });
    }
  }

  async function handleAssignFacilitator(
    event,
  ) {
    event.preventDefault();
    setPageMessage(null);

    try {
      await assignFacilitator(
        assignmentForm,
      );

      setPageMessage({
        type: "success",
        text: "Facilitator assigned successfully.",
      });

      setAssignmentForm(
        initialAssignmentForm,
      );
    } catch (error) {
      setPageMessage({
        type: "error",
        text:
          error.message ||
          "Unable to assign the facilitator.",
      });
    }
  }

  async function handleCreateSession(
    event,
  ) {
    event.preventDefault();
    setPageMessage(null);

    try {
      await createSession(
        sessionForm,
      );

      setPageMessage({
        type: "success",
        text: "Learning-experience session created successfully.",
      });

      setSessionForm(
        initialSessionForm,
      );
    } catch (error) {
      setPageMessage({
        type: "error",
        text:
          error.message ||
          "Unable to create the session.",
      });
    }
  }

  async function handleCloseAssignment(
    assignment,
  ) {
    const facilitatorName =
      assignment.full_name ||
      assignment.email ||
      "this facilitator";

    const confirmed =
      globalThis.confirm(
        `End the active assignment for ${facilitatorName}?`,
      );

    if (!confirmed) {
      return;
    }

    setPageMessage(null);

    try {
      await closeFacilitatorAssignment({
        assignmentId:
          assignment.assignment_id,
        closingStatus:
          "completed",
        closingNotes:
          "Assignment closed by the Super Administrator.",
      });

      setPageMessage({
        type: "success",
        text: "Facilitator assignment closed successfully.",
      });
    } catch (error) {
      setPageMessage({
        type: "error",
        text:
          error.message ||
          "Unable to close the facilitator assignment.",
      });
    }
  }

  if (learningExperiencesLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading learning-experience management..." />
      </SuperAdminLayout>
    );
  }

  if (learningExperiencesError) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            learningExperiencesError
              .message ||
            "Unable to load learning-experience management."
          }
        />
      </SuperAdminLayout>
    );
  }

  const summary =
    learningExperienceSummary || {
      totalExperiences: 0,
      plannedExperiences: 0,
      activeExperiences: 0,
      completedExperiences: 0,
      totalActiveAssignments: 0,
      totalEnrolledStudents: 0,
      totalSessions: 0,
      activeFacilitators: 0,
    };

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Facilitation Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Learning Experiences
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Create learning experiences,
                enroll cohort students,
                assign facilitators and
                schedule sessions.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshLearningExperiences()
              }
              disabled={
                learningExperiencesFetching
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  learningExperiencesFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              {learningExperiencesFetching
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </header>

          {pageMessage ? (
            <div
              className={`mt-6 rounded-lg border px-4 py-3 text-sm font-semibold ${
                pageMessage.type ===
                "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {pageMessage.text}
            </div>
          ) : null}

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Learning Experiences"
              value={
                summary.totalExperiences
              }
              detail={`${summary.activeExperiences} active`}
              icon={BookOpen}
              tone="blue"
            />

            <SummaryCard
              label="Facilitators"
              value={
                summary.activeFacilitators
              }
              detail={`${summary.totalActiveAssignments} active assignments`}
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Enrolled Students"
              value={
                summary.totalEnrolledStudents
              }
              detail="Active experience enrollments"
              icon={UserPlus}
              tone="green"
            />

            <SummaryCard
              label="Sessions"
              value={
                summary.totalSessions
              }
              detail="Non-cancelled sessions"
              icon={CalendarDays}
              tone="amber"
            />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-3">
            <ManagementForm
              title="Create Experience"
              description="Create an experience and enroll students from a programme cohort."
              icon={BookOpen}
            >
              <form
                onSubmit={
                  handleCreateExperience
                }
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Experience Code"
                    required
                  >
                    <input
                      type="text"
                      required
                      value={
                        experienceForm.code
                      }
                      onChange={(event) =>
                        setExperienceForm(
                          (current) => ({
                            ...current,
                            code:
                              event.target
                                .value,
                          }),
                        )
                      }
                      placeholder="LE101"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Status"
                    required
                  >
                    <select
                      required
                      value={
                        experienceForm.status
                      }
                      onChange={(event) =>
                        setExperienceForm(
                          (current) => ({
                            ...current,
                            status:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    >
                      <option value="planned">
                        Planned
                      </option>

                      <option value="active">
                        Active
                      </option>
                    </select>
                  </FormField>
                </div>

                <FormField
                  label="Title"
                  required
                >
                  <input
                    type="text"
                    required
                    value={
                      experienceForm.title
                    }
                    onChange={(event) =>
                      setExperienceForm(
                        (current) => ({
                          ...current,
                          title:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="Leadership Development Workshop"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Programme Cohort">
                  <select
                    value={
                      experienceForm.cohortId
                    }
                    onChange={(event) =>
                      setExperienceForm(
                        (current) => ({
                          ...current,
                          cohortId:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      No cohort selected
                    </option>

                    {programmeCohorts.map(
                      (cohort) => (
                        <option
                          key={cohort.id}
                          value={cohort.id}
                        >
                          {cohort.name} (
                          {cohort.code}) —{" "}
                          {cohort.student_count}{" "}
                          students
                        </option>
                      ),
                    )}
                  </select>
                </FormField>

                <FormField label="Description">
                  <textarea
                    rows="3"
                    value={
                      experienceForm.description
                    }
                    onChange={(event) =>
                      setExperienceForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Learning Objectives">
                  <textarea
                    rows="3"
                    value={
                      experienceForm
                        .learningObjectives
                    }
                    onChange={(event) =>
                      setExperienceForm(
                        (current) => ({
                          ...current,
                          learningObjectives:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Delivery Mode"
                    required
                  >
                    <select
                      value={
                        experienceForm
                          .deliveryMode
                      }
                      onChange={(event) =>
                        setExperienceForm(
                          (current) => ({
                            ...current,
                            deliveryMode:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    >
                      <option value="in_person">
                        In Person
                      </option>

                      <option value="online">
                        Online
                      </option>

                      <option value="hybrid">
                        Hybrid
                      </option>
                    </select>
                  </FormField>

                  <FormField label="Location">
                    <input
                      type="text"
                      value={
                        experienceForm.location
                      }
                      onChange={(event) =>
                        setExperienceForm(
                          (current) => ({
                            ...current,
                            location:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Start Date">
                    <input
                      type="date"
                      value={
                        experienceForm.startDate
                      }
                      onChange={(event) =>
                        setExperienceForm(
                          (current) => ({
                            ...current,
                            startDate:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="End Date">
                    <input
                      type="date"
                      value={
                        experienceForm.endDate
                      }
                      onChange={(event) =>
                        setExperienceForm(
                          (current) => ({
                            ...current,
                            endDate:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    checked={
                      experienceForm
                        .enrollCohortStudents
                    }
                    disabled={
                      !experienceForm.cohortId
                    }
                    onChange={(event) =>
                      setExperienceForm(
                        (current) => ({
                          ...current,
                          enrollCohortStudents:
                            event.target
                              .checked,
                        }),
                      )
                    }
                    className="mt-1 h-4 w-4"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Enroll cohort students
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Automatically enroll
                      active students from the
                      selected cohort.
                    </span>
                  </span>
                </label>

                <SubmitButton
                  loading={
                    creatingExperience
                  }
                  loadingText="Creating..."
                >
                  Create Learning Experience
                </SubmitButton>
              </form>
            </ManagementForm>

            <ManagementForm
              title="Assign Facilitator"
              description="Assign an eligible facilitator to an existing learning experience."
              icon={UserPlus}
            >
              <form
                onSubmit={
                  handleAssignFacilitator
                }
                className="space-y-4"
              >
                <FormField
                  label="Learning Experience"
                  required
                >
                  <select
                    required
                    value={
                      assignmentForm
                        .learningExperienceId
                    }
                    onChange={(event) =>
                      setAssignmentForm(
                        (current) => ({
                          ...current,
                          learningExperienceId:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select an experience
                    </option>

                    {learningExperiences
                      .filter(
                        (experience) =>
                          experience.status ===
                            "planned" ||
                          experience.status ===
                            "active",
                      )
                      .map(
                        (experience) => (
                          <option
                            key={
                              experience.id
                            }
                            value={
                              experience.id
                            }
                          >
                            {experience.code} —{" "}
                            {experience.title}
                          </option>
                        ),
                      )}
                  </select>
                </FormField>

                <FormField
                  label="Facilitator"
                  required
                >
                  <select
                    required
                    value={
                      assignmentForm
                        .facilitatorStaffProfileId
                    }
                    onChange={(event) =>
                      setAssignmentForm(
                        (current) => ({
                          ...current,
                          facilitatorStaffProfileId:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select a facilitator
                    </option>

                    {eligibleFacilitators.map(
                      (facilitator) => (
                        <option
                          key={
                            facilitator
                              .staff_profile_id
                          }
                          value={
                            facilitator
                              .staff_profile_id
                          }
                        >
                          {facilitator.full_name ||
                            facilitator.email}
                          {" — "}
                          {
                            facilitator
                              .active_assignment_count
                          }{" "}
                          active
                        </option>
                      ),
                    )}
                  </select>
                </FormField>

                <FormField
                  label="Assignment Role"
                  required
                >
                  <select
                    value={
                      assignmentForm
                        .assignmentRole
                    }
                    onChange={(event) =>
                      setAssignmentForm(
                        (current) => ({
                          ...current,
                          assignmentRole:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  >
                    <option value="lead_facilitator">
                      Lead Facilitator
                    </option>

                    <option value="facilitator">
                      Facilitator
                    </option>

                    <option value="assistant_facilitator">
                      Assistant Facilitator
                    </option>
                  </select>
                </FormField>

                <FormField label="Assignment Notes">
                  <textarea
                    rows="4"
                    value={
                      assignmentForm.notes
                    }
                    onChange={(event) =>
                      setAssignmentForm(
                        (current) => ({
                          ...current,
                          notes:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <SubmitButton
                  loading={
                    assigningFacilitator
                  }
                  loadingText="Assigning..."
                >
                  Assign Facilitator
                </SubmitButton>
              </form>
            </ManagementForm>

            <ManagementForm
              title="Schedule Session"
              description="Create a scheduled session for a learning experience."
              icon={CalendarPlus}
            >
              <form
                onSubmit={
                  handleCreateSession
                }
                className="space-y-4"
              >
                <FormField
                  label="Learning Experience"
                  required
                >
                  <select
                    required
                    value={
                      sessionForm
                        .learningExperienceId
                    }
                    onChange={(event) =>
                      setSessionForm(
                        (current) => ({
                          ...current,
                          learningExperienceId:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select an experience
                    </option>

                    {learningExperiences
                      .filter(
                        (experience) =>
                          experience.status ===
                            "planned" ||
                          experience.status ===
                            "active",
                      )
                      .map(
                        (experience) => (
                          <option
                            key={
                              experience.id
                            }
                            value={
                              experience.id
                            }
                          >
                            {experience.code} —{" "}
                            {experience.title}
                          </option>
                        ),
                      )}
                  </select>
                </FormField>

                <FormField
                  label="Session Title"
                  required
                >
                  <input
                    type="text"
                    required
                    value={
                      sessionForm.title
                    }
                    onChange={(event) =>
                      setSessionForm(
                        (current) => ({
                          ...current,
                          title:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Session Number"
                  >
                    <input
                      type="number"
                      min="1"
                      value={
                        sessionForm
                          .sessionNumber
                      }
                      onChange={(event) =>
                        setSessionForm(
                          (current) => ({
                            ...current,
                            sessionNumber:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Session Date"
                    required
                  >
                    <input
                      type="date"
                      required
                      value={
                        sessionForm
                          .sessionDate
                      }
                      onChange={(event) =>
                        setSessionForm(
                          (current) => ({
                            ...current,
                            sessionDate:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Start Time"
                    required
                  >
                    <input
                      type="time"
                      required
                      value={
                        sessionForm.startTime
                      }
                      onChange={(event) =>
                        setSessionForm(
                          (current) => ({
                            ...current,
                            startTime:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="End Time"
                    required
                  >
                    <input
                      type="time"
                      required
                      value={
                        sessionForm.endTime
                      }
                      onChange={(event) =>
                        setSessionForm(
                          (current) => ({
                            ...current,
                            endTime:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <FormField label="Topic">
                  <input
                    type="text"
                    value={
                      sessionForm.topic
                    }
                    onChange={(event) =>
                      setSessionForm(
                        (current) => ({
                          ...current,
                          topic:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Learning Objectives">
                  <textarea
                    rows="3"
                    value={
                      sessionForm
                        .learningObjectives
                    }
                    onChange={(event) =>
                      setSessionForm(
                        (current) => ({
                          ...current,
                          learningObjectives:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Delivery Mode">
                    <select
                      value={
                        sessionForm
                          .deliveryMode
                      }
                      onChange={(event) =>
                        setSessionForm(
                          (current) => ({
                            ...current,
                            deliveryMode:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    >
                      <option value="in_person">
                        In Person
                      </option>

                      <option value="online">
                        Online
                      </option>

                      <option value="hybrid">
                        Hybrid
                      </option>
                    </select>
                  </FormField>

                  <FormField label="Location">
                    <input
                      type="text"
                      value={
                        sessionForm.location
                      }
                      onChange={(event) =>
                        setSessionForm(
                          (current) => ({
                            ...current,
                            location:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <FormField label="Notes">
                  <textarea
                    rows="3"
                    value={
                      sessionForm.notes
                    }
                    onChange={(event) =>
                      setSessionForm(
                        (current) => ({
                          ...current,
                          notes:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <SubmitButton
                  loading={
                    creatingSession
                  }
                  loadingText="Scheduling..."
                >
                  Schedule Session
                </SubmitButton>
              </form>
            </ManagementForm>
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">
                Learning Experiences
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review cohort enrollment,
                sessions and facilitator
                assignments.
              </p>
            </div>

            {learningExperiences.length >
            0 ? (
              <div className="grid gap-5 p-5 xl:grid-cols-2">
                {learningExperiences.map(
                  (experience) => (
                    <ExperienceCard
                      key={experience.id}
                      experience={
                        experience
                      }
                      onCloseAssignment={
                        handleCloseAssignment
                      }
                      closingAssignment={
                        closingFacilitatorAssignment
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <BookOpen className="mx-auto h-9 w-9 text-slate-400" />

                <h3 className="mt-4 font-bold text-slate-900">
                  No learning experiences
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Create the first learning
                  experience using the form
                  above.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function ExperienceCard({
  experience,
  onCloseAssignment,
  closingAssignment,
}) {
  const activeFacilitators =
    (experience.facilitators || [])
      .filter(
        (facilitator) =>
          facilitator.assignment_status ===
          "active",
      );

  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
            {experience.code}
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-950">
            {experience.title}
          </h3>
        </div>

        <StatusBadge
          status={experience.status}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {experience.description ||
          "No description provided."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SmallStat
          label="Facilitators"
          value={
            experience
              .active_facilitator_count
          }
        />

        <SmallStat
          label="Students"
          value={
            experience
              .active_student_count
          }
        />

        <SmallStat
          label="Sessions"
          value={
            experience.session_count
          }
        />

        <SmallStat
          label="Resources"
          value={
            experience.resource_count
          }
        />

        <SmallStat
          label="Activities"
          value={
            experience.activity_count
          }
        />
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Active Facilitators
        </p>

        {activeFacilitators.length > 0 ? (
          <div className="mt-3 space-y-3">
            {activeFacilitators.map(
              (facilitator) => (
                <div
                  key={
                    facilitator.assignment_id
                  }
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {facilitator.full_name ||
                        facilitator.email}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatLabel(
                        facilitator
                          .assignment_role,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      closingAssignment
                    }
                    onClick={() =>
                      onCloseAssignment(
                        facilitator,
                      )
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    End Assignment
                  </button>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No active facilitator assigned.
          </p>
        )}
      </div>
    </article>
  );
}

function ManagementForm({
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
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
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}

        {required ? (
          <span className="ml-1 text-red-600">
            *
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

function SubmitButton({
  loading,
  loadingText,
  children,
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex w-full items-center justify-center rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading
        ? loadingText
        : children}
    </button>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}) {
  const tones = {
    blue:
      "bg-blue-100 text-blue-700",
    purple:
      "bg-purple-100 text-purple-700",
    green:
      "bg-emerald-100 text-emerald-700",
    amber:
      "bg-amber-100 text-amber-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {Number(value) || 0}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {detail}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            tones[tone]
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

function SmallStat({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-950">
        {Number(value) || 0}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const classes = {
    planned:
      "bg-slate-100 text-slate-700",
    active:
      "bg-emerald-100 text-emerald-700",
    completed:
      "bg-purple-100 text-purple-700",
    cancelled:
      "bg-red-100 text-red-700",
    inactive:
      "bg-slate-200 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        classes[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <div
        className={`max-w-lg rounded-xl border px-6 py-5 text-center shadow-sm ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-blue-200 bg-blue-50 text-blue-700"
        }`}
      >
        <p className="font-semibold">
          {message}
        </p>
      </div>
    </main>
  );
}

function formatLabel(value) {
  if (!value) {
    return "Not specified";
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

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";