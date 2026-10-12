import {
  ClipboardList,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useServiceStudentAssignments,
} from "../../hooks/useServiceStudentAssignments";

import SupervisorLayout from "../../layouts/SupervisorLayout";

const initialForm = {
  scheduleId: "",
  studentProfileId: "",
  teamName: "",
  assignedTask: "",
  responsibilityLevel:
    "guided",
};

export default function ServiceStudentAssignmentsPage() {
  const {
    serviceStudents,
    serviceSchedules,
    serviceAssignments,
    serviceAssignmentsLoading,
    serviceAssignmentsFetching,
    serviceAssignmentsError,
    refreshServiceAssignments,
    assignStudent,
    assigningStudent,
    assignStudentError,
    resetAssignStudent,
  } = useServiceStudentAssignments();

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

  const activeAssignments =
    useMemo(
      () =>
        serviceAssignments.filter(
          (assignment) =>
            assignment.status !==
            "removed",
        ),
      [serviceAssignments],
    );

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setLocalError("");
    setSuccessMessage("");
    resetAssignStudent();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLocalError("");
    setSuccessMessage("");
    resetAssignStudent();

    if (!form.scheduleId) {
      setLocalError(
        "Select a project activity.",
      );
      return;
    }

    if (!form.studentProfileId) {
      setLocalError(
        "Select a student.",
      );
      return;
    }

    try {
      const result =
        await assignStudent(form);

      setForm(initialForm);

      setSuccessMessage(
        result?.message ||
          "The student was assigned successfully.",
      );
    } catch (error) {
      setLocalError(
        error.message ||
          "The student assignment could not be completed.",
      );
    }
  }

  if (serviceAssignmentsLoading) {
    return (
      <SupervisorLayout
        supervisorType="service_coordinator"
      >
        <PageMessage message="Loading students and service schedules..." />
      </SupervisorLayout>
    );
  }

  if (serviceAssignmentsError) {
    return (
      <SupervisorLayout
        supervisorType="service_coordinator"
      >
        <PageMessage
          error
          message={
            serviceAssignmentsError
              .message ||
            "Student assignment data could not be loaded."
          }
        />
      </SupervisorLayout>
    );
  }

  return (
    <SupervisorLayout
      supervisorType="service_coordinator"
    >
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Service Coordination
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Student Assignments
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Assign students to
                scheduled service project
                activities, teams and
                specific responsibilities.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshServiceAssignments()
              }
              disabled={
                serviceAssignmentsFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  serviceAssignmentsFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Available Students"
              value={
                serviceStudents.length
              }
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Scheduled Activities"
              value={
                serviceSchedules.length
              }
              icon={ClipboardList}
              tone="green"
            />

            <SummaryCard
              label="Active Assignments"
              value={
                activeAssignments.length
              }
              icon={UserPlus}
              tone="amber"
            />
          </section>

          {successMessage ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.4fr]">
            <AssignmentForm
              form={form}
              students={
                serviceStudents
              }
              schedules={
                serviceSchedules
              }
              onChange={
                handleChange
              }
              onSubmit={
                handleSubmit
              }
              submitting={
                assigningStudent
              }
              error={
                localError ||
                assignStudentError
                  ?.message
              }
            />

            <AssignmentDirectory
              assignments={
                activeAssignments
              }
            />
          </div>
        </div>
      </main>
    </SupervisorLayout>
  );
}

function AssignmentForm({
  form,
  students,
  schedules,
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
          <UserPlus className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Assign Student
          </h2>

          <p className="text-sm text-slate-500">
            Connect a student to a
            scheduled activity.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SelectField
          label="Project Activity"
          name="scheduleId"
          value={form.scheduleId}
          onChange={onChange}
          required
        >
          <option value="">
            Select an activity
          </option>

          {schedules.map(
            (schedule) => (
              <option
                key={
                  getScheduleId(
                    schedule,
                  )
                }
                value={
                  getScheduleId(
                    schedule,
                  )
                }
              >
                {getScheduleLabel(
                  schedule,
                )}
              </option>
            ),
          )}
        </SelectField>

        <SelectField
          label="Student"
          name="studentProfileId"
          value={
            form.studentProfileId
          }
          onChange={onChange}
          required
        >
          <option value="">
            Select a student
          </option>

          {students.map(
            (student) => (
              <option
                key={
                  getStudentId(
                    student,
                  )
                }
                value={
                  getStudentId(
                    student,
                  )
                }
              >
                {getStudentLabel(
                  student,
                )}
              </option>
            ),
          )}
        </SelectField>

        <Field
          label="Team Name"
          name="teamName"
          value={form.teamName}
          onChange={onChange}
          placeholder="Example: Construction Team A"
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Assigned Task
          </label>

          <textarea
            name="assignedTask"
            value={
              form.assignedTask
            }
            onChange={onChange}
            rows={4}
            placeholder="Describe the student's assigned work."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <SelectField
          label="Responsibility Level"
          name="responsibilityLevel"
          value={
            form.responsibilityLevel
          }
          onChange={onChange}
          required
        >
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
          students.length === 0 ||
          schedules.length === 0
        }
        className="mt-6 w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Assigning Student..."
          : "Assign Student"}
      </button>
    </form>
  );
}

function AssignmentDirectory({
  assignments,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="text-xl font-bold text-slate-950">
          Current Assignments
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Students currently assigned
          to service project activities.
        </p>
      </div>

      {assignments.length > 0 ? (
        <div className="divide-y divide-slate-200">
          {assignments.map(
            (assignment) => (
              <AssignmentCard
                key={
                  assignment.assignment_id ||
                  assignment.id
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
          <Users className="mx-auto h-10 w-10 text-slate-300" />

          <h3 className="mt-4 font-bold text-slate-900">
            No students assigned
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Use the assignment form to
            add the first student.
          </p>
        </div>
      )}
    </section>
  );
}

function AssignmentCard({
  assignment,
}) {
  const student =
    assignment.student || {};

  const schedule =
    assignment.schedule || {};

  const project =
    assignment.project ||
    schedule.project ||
    {};

  const studentName =
    student.full_name ||
    assignment.student_name ||
    assignment.full_name ||
    student.email ||
    "Student";

  const projectTitle =
    project.title ||
    assignment.project_title ||
    schedule.project_title ||
    "Service Project";

  const activityTitle =
    schedule.task_title ||
    assignment.task_title ||
    assignment.schedule_title ||
    "Scheduled Activity";

  return (
    <article className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-950">
            {studentName}
          </h3>

          <p className="mt-1 text-sm font-semibold text-blue-700">
            {projectTitle}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {activityTitle}
          </p>
        </div>

        <StatusBadge
          status={
            assignment.status ||
            "assigned"
          }
        />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Detail
          label="Team"
          value={
            assignment.team_name ||
            "Not specified"
          }
        />

        <Detail
          label="Responsibility"
          value={formatLabel(
            assignment
              .responsibility_level ||
              "guided",
          )}
        />

        <Detail
          label="Date"
          value={formatDate(
            schedule.schedule_date ||
              assignment
                .schedule_date,
          )}
        />

        <Detail
          label="Task"
          value={
            assignment.assigned_task ||
            "No specific task entered"
          }
        />
      </dl>
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
    blue:
      "bg-blue-100 text-blue-700",
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

function Field({
  label,
  ...props
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        {...props}
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

function StatusBadge({
  status,
}) {
  const tone =
    status === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "excused"
        ? "bg-amber-100 text-amber-700"
        : status === "removed"
          ? "bg-red-100 text-red-700"
          : "bg-blue-100 text-blue-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${tone}`}
    >
      {formatLabel(status)}
    </span>
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

function getScheduleId(
  schedule,
) {
  return (
    schedule.schedule_id ||
    schedule.id ||
    ""
  );
}

function getStudentId(
  student,
) {
  return (
    student.student_profile_id ||
    student.id ||
    ""
  );
}

function getScheduleLabel(
  schedule,
) {
  const projectTitle =
    schedule.project_title ||
    schedule.project?.title ||
    "Service Project";

  const taskTitle =
    schedule.task_title ||
    schedule.title ||
    "Scheduled Activity";

  const scheduleDate =
    formatDate(
      schedule.schedule_date,
    );

  return `${projectTitle} — ${taskTitle} — ${scheduleDate}`;
}

function getStudentLabel(
  student,
) {
  const name =
    student.full_name ||
    student.email ||
    "Student";

  const number =
    student.student_number;

  return number
    ? `${name} — ${number}`
    : name;
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

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}