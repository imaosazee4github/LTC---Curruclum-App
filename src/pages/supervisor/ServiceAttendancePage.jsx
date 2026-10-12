import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  UserCheck,
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
  attendanceStatus: "present",
  arrivalTime: "",
  departureTime: "",
  serviceHours: "",
  attendanceRemarks: "",
};

export default function ServiceAttendancePage() {
  const {
    siteWorkSummary,
    siteWorkAssignments,
    siteWorkLoading,
    siteWorkFetching,
    siteWorkError,
    refreshSiteWork,
    saveAttendance,
    savingAttendance,
    attendanceError,
    resetAttendance,
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

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    if (
      name ===
      "studentAssignmentId"
    ) {
      const selectedAssignment =
        assignments.find(
          (assignment) =>
            assignment
              .assignment_id ===
            value,
        );

      const attendance =
        selectedAssignment
          ?.attendance;

      setForm({
        studentAssignmentId:
          value,

        attendanceStatus:
          attendance
            ?.attendance_status ||
          "present",

        arrivalTime:
          normalizeTime(
            attendance
              ?.arrival_time,
          ),

        departureTime:
          normalizeTime(
            attendance
              ?.departure_time,
          ),

        serviceHours:
          attendance
            ?.service_hours ??
          "",

        attendanceRemarks:
          attendance
            ?.attendance_remarks ||
          "",
      });
    } else {
      setForm((current) => ({
        ...current,
        [name]: value,
      }));
    }

    setLocalError("");
    setSuccessMessage("");
    resetAttendance();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLocalError("");
    setSuccessMessage("");
    resetAttendance();

    if (
      !form.studentAssignmentId
    ) {
      setLocalError(
        "Select a student assignment.",
      );
      return;
    }

    if (
      form.arrivalTime &&
      form.departureTime &&
      form.departureTime <=
        form.arrivalTime
    ) {
      setLocalError(
        "Departure time must be later than arrival time.",
      );
      return;
    }

    try {
      const result =
        await saveAttendance(
          form,
        );

      setSuccessMessage(
        result?.message ||
          "Attendance was recorded successfully.",
      );
    } catch (error) {
      setLocalError(
        error.message ||
          "Attendance could not be recorded.",
      );
    }
  }

  if (siteWorkLoading) {
    return (
      <SupervisorLayout
        supervisorType="site_supervisor"
      >
        <PageMessage message="Loading service attendance..." />
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
            "Service attendance data could not be loaded."
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
                Service Attendance
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Record each student’s
                attendance, arrival and
                departure times, service
                hours and attendance
                remarks.
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
              label="Attendance Pending"
              value={
                siteWorkSummary
                  .attendancePending
              }
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Attendance Recorded"
              value={
                siteWorkSummary
                  .attendanceRecorded
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
              icon={UserCheck}
              tone="purple"
            />
          </section>

          {successMessage ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.4fr]">
            <AttendanceForm
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
                savingAttendance
              }
              error={
                localError ||
                attendanceError
                  ?.message
              }
            />

            <AttendanceDirectory
              assignments={
                assignments
              }
              onSelect={(
                assignmentId,
              ) => {
                handleChange({
                  target: {
                    name:
                      "studentAssignmentId",
                    value:
                      assignmentId,
                  },
                });
              }}
            />
          </div>
        </div>
      </main>
    </SupervisorLayout>
  );
}

function AttendanceForm({
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
          <UserCheck className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Record Attendance
          </h2>

          <p className="text-sm text-slate-500">
            Select a student and enter
            attendance details.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
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

        <SelectField
          label="Attendance Status"
          name="attendanceStatus"
          value={
            form.attendanceStatus
          }
          onChange={onChange}
          required
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
        </SelectField>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Arrival Time"
            type="time"
            name="arrivalTime"
            value={
              form.arrivalTime
            }
            onChange={onChange}
          />

          <Field
            label="Departure Time"
            type="time"
            name="departureTime"
            value={
              form.departureTime
            }
            onChange={onChange}
          />
        </div>

        <Field
          label="Service Hours"
          type="number"
          name="serviceHours"
          value={
            form.serviceHours
          }
          onChange={onChange}
          min="0"
          step="0.25"
          placeholder="Example: 4.5"
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Attendance Remarks
          </label>

          <textarea
            name="attendanceRemarks"
            value={
              form.attendanceRemarks
            }
            onChange={onChange}
            rows={4}
            placeholder="Add attendance notes or reasons for absence."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
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
          ? "Saving Attendance..."
          : "Save Attendance"}
      </button>
    </form>
  );
}

function AttendanceDirectory({
  assignments,
  onSelect,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="text-xl font-bold text-slate-950">
          Student Attendance
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          View recorded and pending
          attendance for service
          activities.
        </p>
      </div>

      {assignments.length > 0 ? (
        <div className="divide-y divide-slate-200">
          {assignments.map(
            (assignment) => (
              <AttendanceCard
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
            The Service Coordinator
            must assign students before
            attendance can be recorded.
          </p>
        </div>
      )}
    </section>
  );
}

function AttendanceCard({
  assignment,
  onSelect,
}) {
  const student =
    assignment.student || {};

  const project =
    assignment.project || {};

  const schedule =
    assignment.schedule || {};

  const attendance =
    assignment.attendance;

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
            {" • "}
            {formatDate(
              schedule.schedule_date,
            )}
          </p>
        </div>

        <AttendanceBadge
          status={
            attendance
              ?.attendance_status
          }
        />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Detail
          label="Arrival"
          value={
            formatTime(
              attendance
                ?.arrival_time,
            )
          }
        />

        <Detail
          label="Departure"
          value={
            formatTime(
              attendance
                ?.departure_time,
            )
          }
        />

        <Detail
          label="Service Hours"
          value={
            attendance
              ?.service_hours ??
            "Not recorded"
          }
        />

        <Detail
          label="Remarks"
          value={
            attendance
              ?.attendance_remarks ||
            "No remarks"
          }
        />
      </dl>

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
        {attendance
          ? "Edit Attendance"
          : "Record Attendance"}
      </button>
    </article>
  );
}

function AttendanceBadge({
  status,
}) {
  if (!status) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-700">
        Pending
      </span>
    );
  }

  const tones = {
    present:
      "bg-emerald-100 text-emerald-700",
    late:
      "bg-amber-100 text-amber-700",
    absent:
      "bg-red-100 text-red-700",
    excused:
      "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        tones[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {formatLabel(status)}
    </span>
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

function normalizeTime(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(
    0,
    5,
  );
}

function formatTime(value) {
  if (!value) {
    return "Not recorded";
  }

  return normalizeTime(value);
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