import {
  CalendarClock,
  CheckCircle2,
  RefreshCw,
  UserRoundCheck,
  Users,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useMentorDepartment,
} from "../../hooks/useMentorDepartment";

import MentoringLayout from "../../layouts/MentoringLayout";

const initialForm = {
  studentProfileId: "",
  mentorProfileId: "",
  assignmentReason: "",
  nextCheckInAt: "",
};

export default function MentorAssignmentsPage() {
  const {
    assignmentOptions,
    assignmentOptionsLoading,
    assignmentOptionsFetching,
    assignmentOptionsError,
    refreshAssignmentOptions,
    assignMentor,
    assigningMentor,
    assignMentorError,
    resetAssignMentor,
  } = useMentorDepartment();

  const [form, setForm] =
    useState(initialForm);

  const [successMessage, setSuccessMessage] =
    useState("");

  const mentors =
    assignmentOptions?.mentors || [];

  const students =
    assignmentOptions
      ?.studentsAwaitingAssignment || [];

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    resetAssignMentor();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    resetAssignMentor();

    try {
      const result =
        await assignMentor({
          studentProfileId:
            form.studentProfileId,

          mentorProfileId:
            form.mentorProfileId,

          assignmentReason:
            form.assignmentReason,

          nextCheckInAt:
            form.nextCheckInAt
              ? new Date(
                  form.nextCheckInAt,
                ).toISOString()
              : null,
        });

      setSuccessMessage(
        result?.message ||
          "The student was assigned to the mentor successfully.",
      );

      setForm(initialForm);
    } catch {
      /*
       * The mutation exposes the error through
       * assignMentorError.
       */
    }
  }

  if (assignmentOptionsLoading) {
    return (
      <MentoringLayout>
        <PageMessage message="Loading assignment options..." />
      </MentoringLayout>
    );
  }

  if (
    assignmentOptionsError ||
    !assignmentOptions
  ) {
    return (
      <MentoringLayout>
        <PageMessage
          error
          message={
            assignmentOptionsError?.message ||
            "Mentoring assignment options could not be loaded."
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
                Mentoring Operations
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Mentor Assignments
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Assign students to available
                mentors and schedule their
                first developmental check-in.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshAssignmentOptions()
              }
              disabled={
                assignmentOptionsFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  assignmentOptionsFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2">
            <SummaryCard
              label="Available Mentors"
              value={
                assignmentOptions
                  .totalAvailableMentors
              }
              detail="Mentors currently accepting mentees"
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Awaiting Assignment"
              value={
                assignmentOptions
                  .totalStudentsAwaitingAssignment
              }
              detail="Students who currently need mentors"
              icon={UserRoundCheck}
              tone="amber"
            />
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-bold text-slate-950">
                  Create Assignment
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Select a student and an
                  available mentor.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >
                <FormField
                  label="Student"
                  htmlFor="studentProfileId"
                  required
                >
                  <select
                    id="studentProfileId"
                    name="studentProfileId"
                    value={
                      form.studentProfileId
                    }
                    onChange={handleChange}
                    required
                    disabled={
                      students.length === 0 ||
                      assigningMentor
                    }
                    className={inputClasses}
                  >
                    <option value="">
                      Select a student
                    </option>

                    {students.map(
                      (student) => (
                        <option
                          key={getStudentId(
                            student,
                          )}
                          value={getStudentId(
                            student,
                          )}
                        >
                          {getStudentLabel(
                            student,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </FormField>

                <FormField
                  label="Mentor"
                  htmlFor="mentorProfileId"
                  required
                >
                  <select
                    id="mentorProfileId"
                    name="mentorProfileId"
                    value={
                      form.mentorProfileId
                    }
                    onChange={handleChange}
                    required
                    disabled={
                      mentors.length === 0 ||
                      assigningMentor
                    }
                    className={inputClasses}
                  >
                    <option value="">
                      Select a mentor
                    </option>

                    {mentors.map(
                      (mentor) => (
                        <option
                          key={getMentorId(
                            mentor,
                          )}
                          value={getMentorId(
                            mentor,
                          )}
                        >
                          {getMentorLabel(
                            mentor,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </FormField>

                <FormField
                  label="Next check-in"
                  htmlFor="nextCheckInAt"
                >
                  <div className="relative">
                    <CalendarClock
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="nextCheckInAt"
                      name="nextCheckInAt"
                      type="datetime-local"
                      value={
                        form.nextCheckInAt
                      }
                      onChange={handleChange}
                      disabled={
                        assigningMentor
                      }
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Assignment reason"
                  htmlFor="assignmentReason"
                >
                  <textarea
                    id="assignmentReason"
                    name="assignmentReason"
                    value={
                      form.assignmentReason
                    }
                    onChange={handleChange}
                    rows={4}
                    maxLength={1000}
                    disabled={
                      assigningMentor
                    }
                    placeholder="Explain the student's mentoring needs or assignment context."
                    className={`${inputClasses} resize-y`}
                  />
                </FormField>

                {successMessage ? (
                  <FeedbackMessage success>
                    <CheckCircle2
                      size={19}
                      className="shrink-0"
                    />

                    <span>
                      {successMessage}
                    </span>
                  </FeedbackMessage>
                ) : null}

                {assignMentorError ? (
                  <FeedbackMessage>
                    {assignMentorError.message ||
                      "The assignment could not be completed."}
                  </FeedbackMessage>
                ) : null}

                <button
                  type="submit"
                  disabled={
                    assigningMentor ||
                    !form.studentProfileId ||
                    !form.mentorProfileId
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserRoundCheck
                    size={19}
                  />

                  {assigningMentor
                    ? "Assigning Student..."
                    : "Assign Student"}
                </button>
              </form>
            </section>

            <div className="space-y-8">
              <OptionsSection
                hasItems={students.length > 0}
                title="Students Awaiting Assignment"
                description="Active students who do not currently have a mentor."
                emptyTitle="No students awaiting assignment"
                emptyDescription="All eligible students currently have mentors."
              >
                <div className="divide-y divide-slate-200">
                  {students.map(
                    (student) => (
                      <StudentRow
                        key={getStudentId(
                          student,
                        )}
                        student={student}
                      />
                    ),
                  )}
                </div>
              </OptionsSection>

              <OptionsSection
                hasItems={mentors.length > 0}
                title="Available Mentors"
                description="Mentors with capacity for additional students."
                emptyTitle="No mentors currently available"
                emptyDescription="Add mentors or update mentor capacity before assigning students."
              >
                <div className="divide-y divide-slate-200">
                  {mentors.map(
                    (mentor) => (
                      <MentorRow
                        key={getMentorId(
                          mentor,
                        )}
                        mentor={mentor}
                      />
                    ),
                  )}
                </div>
              </OptionsSection>
            </div>
          </div>
        </div>
      </main>
    </MentoringLayout>
  );
}

function StudentRow({
  student,
}) {
  const name =
    student.full_name ||
    student.student_name ||
    student.preferred_name ||
    "Student";

  const studentNumber =
    student.student_number ||
    "Number pending";

  const cohort =
    student.cohort_name ||
    student.cohort ||
    "Cohort not assigned";

  return (
    <article className="flex items-center gap-4 px-5 py-4">
      <Avatar name={name} />

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">
          {name}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {studentNumber} · {cohort}
        </p>
      </div>

      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Awaiting
      </span>
    </article>
  );
}

function MentorRow({
  mentor,
}) {
  const name =
    mentor.full_name ||
    mentor.mentor_name ||
    "Mentor";

  const activeAssignments =
    Number(
      mentor.active_assignments ??
        mentor.active_mentees ??
        0,
    );

  const maximum =
    Number(
      mentor.max_active_mentees ??
        mentor.maximum_mentees ??
        0,
    );

  const remaining =
    mentor.remaining_capacity ??
    Math.max(
      maximum - activeAssignments,
      0,
    );

  return (
    <article className="flex items-center gap-4 px-5 py-4">
      <Avatar name={name} />

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">
          {name}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {mentor.specialization ||
            "General student development"}
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold text-emerald-700">
          {remaining} available
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {activeAssignments}/{maximum} assigned
        </p>
      </div>
    </article>
  );
}

// function OptionsSection({
//   title,
//   description,
//   emptyTitle,
//   emptyDescription,
//   children,
// }) {
//   const hasContent =
//     Array.isArray(children?.props?.children) &&
//     children.props.children.length > 0;

//   return (
//     <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//       <div className="border-b border-slate-200 px-5 py-5">
//         <h2 className="text-xl font-bold text-slate-950">
//           {title}
//         </h2>

//         <p className="mt-1 text-sm leading-6 text-slate-600">
//           {description}
//         </p>
//       </div>

//       {hasContent ? (
//         children
//       ) : (
//         <div className="px-5 py-10 text-center">
//           <p className="font-semibold text-slate-800">
//             {emptyTitle}
//           </p>

//           <p className="mt-2 text-sm text-slate-500">
//             {emptyDescription}
//           </p>
//         </div>
//       )}
//     </section>
//   );
// }

function OptionsSection({
  hasItems,
  title,
  description,
  emptyTitle,
  emptyDescription,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="text-xl font-bold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      {hasItems ? (
        children
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="font-semibold text-slate-800">
            {emptyTitle}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}) {
  const toneClasses = {
    blue:
      "border-blue-200 bg-blue-50 text-blue-800",
    amber:
      "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <article
      className={`rounded-xl border p-6 shadow-sm ${toneClasses[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium opacity-75">
            {label}
          </p>

          <p className="mt-4 text-4xl font-bold">
            {value}
          </p>

          <p className="mt-2 text-sm opacity-75">
            {detail}
          </p>
        </div>

        <Icon size={28} />
      </div>
    </article>
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

function FeedbackMessage({
  success = false,
  children,
}) {
  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-lg border p-4 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {children}
    </div>
  );
}

function Avatar({
  name,
}) {
  const initials = String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900">
      {initials || "?"}
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

function getStudentId(student) {
  return (
    student.student_profile_id ||
    student.id ||
    ""
  );
}

function getMentorId(mentor) {
  return (
    mentor.mentor_profile_id ||
    mentor.id ||
    ""
  );
}

function getStudentLabel(student) {
  const name =
    student.full_name ||
    student.student_name ||
    student.preferred_name ||
    "Student";

  const number =
    student.student_number;

  return number
    ? `${name} (${number})`
    : name;
}

function getMentorLabel(mentor) {
  const name =
    mentor.full_name ||
    mentor.mentor_name ||
    "Mentor";

  const remaining =
    mentor.remaining_capacity;

  return remaining === undefined ||
    remaining === null
    ? name
    : `${name} (${remaining} spaces)`;
}

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";