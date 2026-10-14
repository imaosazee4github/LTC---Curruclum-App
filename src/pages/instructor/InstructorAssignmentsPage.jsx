import {
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  Clock3,
  RefreshCw,
  Send,
} from "lucide-react";

import {
  useState,
} from "react";

import InstructorLayout from "../../layouts/InstructorLayout";

import {
  useInstructorAssignments,
} from "../../hooks/useInstructorAssignments";

import {
  useInstructorDashboard,
} from "../../hooks/useInstructorDashboard";

const initialForm = {
  classId: "",
  title: "",
  instructions: "",
  weekNumber: "",
  availableFrom: "",
  dueDate: "",
  assignmentScope:
    "all_students",
  studentProfileIds: [],
  publish: true,
};

export default function InstructorAssignmentsPage() {
  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    pageMessage,
    setPageMessage,
  ] = useState(null);

  const {
    assignmentSummary,
    instructorClasses,
    assignments,
    assignmentsLoading,
    assignmentsFetching,
    assignmentsError,
    refreshAssignments,
    createAssignment,
    creatingAssignment,
  } = useInstructorAssignments();

  const {
    instructorStudents,
    instructorStudentsLoading,
  } = useInstructorDashboard({
    classId:
      form.classId || null,
  });

  function updateField(
    field,
    value,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleClassChange(
    event,
  ) {
    setForm((current) => ({
      ...current,
      classId:
        event.target.value,
      studentProfileIds: [],
    }));
  }

  function toggleStudent(
    studentProfileId,
  ) {
    setForm((current) => {
      const selected =
        current.studentProfileIds.includes(
          studentProfileId,
        );

      return {
        ...current,

        studentProfileIds:
          selected
            ? current.studentProfileIds.filter(
                (id) =>
                  id !==
                  studentProfileId,
              )
            : [
                ...current.studentProfileIds,
                studentProfileId,
              ],
      };
    });
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault();
    setPageMessage(null);

    try {
      const result =
        await createAssignment(
          form,
        );

      setPageMessage({
        type: "success",

        text:
          result?.message ||
          `Assignment ${
            form.publish
              ? "published"
              : "saved as a draft"
          } successfully.`,
      });

      setForm(initialForm);
    } catch (error) {
      setPageMessage({
        type: "error",

        text:
          error.message ||
          "The assignment could not be created.",
      });
    }
  }

  if (assignmentsLoading) {
    return (
      <InstructorLayout>
        <PageMessage message="Loading assignments..." />
      </InstructorLayout>
    );
  }

  if (assignmentsError) {
    return (
      <InstructorLayout>
        <PageMessage
          error
          message={
            assignmentsError.message ||
            "Unable to load assignments."
          }
        />
      </InstructorLayout>
    );
  }

  const summary =
    assignmentSummary || {
      totalAssignments: 0,
      publishedAssignments: 0,
      dueOrOverdueAssignments: 0,
      pendingSubmissions: 0,
      openFollowUps: 0,
    };

  return (
    <InstructorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Teaching & Learning
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Weekly Assignments
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Give weekly assignments to
                a whole class or selected
                students and monitor their
                submission progress.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshAssignments()
              }
              disabled={
                assignmentsFetching
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  assignmentsFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Total"
              value={
                summary.totalAssignments
              }
              icon={ClipboardList}
              tone="blue"
            />

            <SummaryCard
              label="Published"
              value={
                summary
                  .publishedAssignments
              }
              icon={Send}
              tone="green"
            />

            <SummaryCard
              label="Due / Overdue"
              value={
                summary
                  .dueOrOverdueAssignments
              }
              icon={CalendarDays}
              tone="amber"
            />

            <SummaryCard
              label="To Review"
              value={
                summary.pendingSubmissions
              }
              icon={BookOpenCheck}
              tone="purple"
            />

            <SummaryCard
              label="Follow-Ups"
              value={
                summary.openFollowUps
              }
              icon={Clock3}
              tone="red"
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

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Create Assignment"
                description="Set the class, week, instructions and students."
              />

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-5"
              >
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

                    {instructorClasses.map(
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
                          —{" "}
                          {
                            classItem.class_name
                          }{" "}
                          (
                          {
                            classItem
                              .active_student_count
                          }{" "}
                          students)
                        </option>
                      ),
                    )}
                  </select>
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Course Week"
                    required
                  >
                    <input
                      required
                      type="number"
                      min="1"
                      value={
                        form.weekNumber
                      }
                      onChange={(event) =>
                        updateField(
                          "weekNumber",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Available From"
                  >
                    <input
                      type="date"
                      value={
                        form.availableFrom
                      }
                      onChange={(event) =>
                        updateField(
                          "availableFrom",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Due Date"
                  required
                >
                  <input
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateField(
                        "dueDate",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Assignment Title"
                  required
                >
                  <input
                    required
                    value={form.title}
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target.value,
                      )
                    }
                    placeholder="Week 1 reflection"
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Instructions"
                  required
                >
                  <textarea
                    required
                    rows="6"
                    value={
                      form.instructions
                    }
                    onChange={(event) =>
                      updateField(
                        "instructions",
                        event.target.value,
                      )
                    }
                    placeholder="Describe what students should complete and submit."
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Assign To"
                  required
                >
                  <select
                    value={
                      form.assignmentScope
                    }
                    onChange={(event) =>
                      updateField(
                        "assignmentScope",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  >
                    <option value="all_students">
                      All active students
                    </option>

                    <option value="selected_students">
                      Selected students
                    </option>
                  </select>
                </FormField>

                {form.assignmentScope ===
                "selected_students" ? (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Select Students
                    </p>

                    {!form.classId ? (
                      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                        Select a class first.
                      </p>
                    ) : instructorStudentsLoading ? (
                      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                        Loading students...
                      </p>
                    ) : instructorStudents.length >
                      0 ? (
                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                        {instructorStudents.map(
                          (student) => (
                            <label
                              key={
                                student.student_profile_id
                              }
                              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                checked={form.studentProfileIds.includes(
                                  student.student_profile_id,
                                )}
                                onChange={() =>
                                  toggleStudent(
                                    student.student_profile_id,
                                  )
                                }
                              />

                              <span className="text-sm">
                                <span className="block font-semibold text-slate-800">
                                  {student.full_name ||
                                    "Student"}
                                </span>

                                <span className="text-slate-500">
                                  {student.student_number ||
                                    "No student number"}
                                </span>
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                        No active students are
                        enrolled in this class.
                      </p>
                    )}
                  </div>
                ) : null}

                <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={form.publish}
                    onChange={(event) =>
                      updateField(
                        "publish",
                        event.target.checked,
                      )
                    }
                    className="mt-1"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Publish immediately
                    </span>

                    <span className="mt-1 block text-xs text-slate-500">
                      Published assignments will
                      appear on students’
                      dashboards.
                    </span>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={
                    creatingAssignment
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={17} />

                  {creatingAssignment
                    ? "Saving..."
                    : form.publish
                      ? "Publish Assignment"
                      : "Save Draft"}
                </button>
              </form>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Assignment History"
                description="Assignments you have created for your classes."
              />

              {assignments.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {assignments.map(
                    (assignment) => (
                      <AssignmentCard
                        key={
                          assignment.assignment_id
                        }
                        assignment={
                          assignment
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />

                  <h2 className="mt-4 font-bold text-slate-800">
                    No assignments yet
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Your weekly assignments will
                    appear here.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </InstructorLayout>
  );
}

function AssignmentCard({
  assignment,
}) {
  return (
    <article className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
            {assignment.course_code} ·{" "}
            {assignment.class_name}
          </p>

          <h2 className="mt-2 text-lg font-bold text-slate-950">
            Week {assignment.week_number}:{" "}
            {assignment.title}
          </h2>
        </div>

        <StatusBadge
          status={assignment.status}
        />
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
        {assignment.instructions}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <span>
          Available:{" "}
          {formatDate(
            assignment.available_from,
          )}
        </span>

        <span>
          Due:{" "}
          {formatDate(
            assignment.due_date,
          )}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-5">
        <SmallStat
          label="Assigned"
          value={
            assignment.assigned_students
          }
        />

        <SmallStat
          label="Submitted"
          value={
            assignment.submitted_students
          }
        />

        <SmallStat
          label="Reviewed"
          value={
            assignment.reviewed_students
          }
        />

        <SmallStat
          label="Overdue"
          value={
            assignment.overdue_students
          }
        />

        <SmallStat
          label="Follow-Ups"
          value={
            assignment.open_follow_ups
          }
        />
      </div>
    </article>
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
    green:
      "bg-emerald-100 text-emerald-800",
    amber:
      "bg-amber-100 text-amber-800",
    purple:
      "bg-purple-100 text-purple-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`rounded-lg p-3 ${tones[tone]}`}
        >
          <Icon size={20} />
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
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <p className="text-xl font-bold text-slate-950">
        {Number(value) || 0}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {label}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const tones = {
    draft:
      "bg-slate-100 text-slate-700",
    published:
      "bg-emerald-100 text-emerald-800",
    closed:
      "bg-blue-100 text-blue-800",
    cancelled:
      "bg-red-100 text-red-800",
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

function SectionHeader({
  title,
  description,
}) {
  return (
    <div className="border-b border-slate-200 px-5 py-4">
      <h2 className="text-lg font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
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

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(
    new Date(`${value}T00:00:00Z`),
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100";