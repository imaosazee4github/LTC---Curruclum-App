import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";

import { useSiteSupervisorWork } from "../../hooks/useSiteSupervisorWork";
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
    (assignment) => Boolean(assignment.attendance),
  ).length;

  function clearMessages() {
    setLocalError("");
    setSuccessMessage("");
    resetAttendance();
  }

  function changeFilters(nextDate, nextProjectId) {
    if (savingAttendance) return;

    setDate(nextDate);
    setProjectId(nextProjectId);
    setForm(initialForm);
    clearMessages();
  }

  function selectAssignment(assignmentId) {
    if (savingAttendance) return;

    const assignment = assignments.find(
      (item) => item.assignment_id === assignmentId,
    );

    const attendance = assignment?.attendance;

    setForm({
      studentAssignmentId: assignment?.assignment_id || "",
      attendanceStatus: attendance?.attendance_status || "present",
      arrivalTime: normalizeTime(attendance?.arrival_time),
      departureTime: normalizeTime(attendance?.departure_time),
      serviceHours: attendance?.service_hours ?? "",
      attendanceRemarks: attendance?.attendance_remarks || "",
    });

    clearMessages();
  }

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "studentAssignmentId") {
      selectAssignment(value);
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    clearMessages();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (savingAttendance) return;

    clearMessages();

    if (!form.studentAssignmentId) {
      setLocalError("Select a student assignment.");
      return;
    }

    if (
      !assignments.some(
        (assignment) =>
          assignment.assignment_id === form.studentAssignmentId,
      )
    ) {
      setLocalError(
        "This assignment is no longer in the selected view. Select a student again.",
      );
      return;
    }

    if (
      form.arrivalTime &&
      form.departureTime &&
      form.departureTime <= form.arrivalTime
    ) {
      setLocalError("Departure time must be later than arrival time.");
      return;
    }

    try {
      const result = await saveAttendance(form);

      setSuccessMessage(
        result?.message || "Attendance was recorded successfully.",
      );
    } catch (error) {
      setLocalError(
        error.message || "Attendance could not be recorded.",
      );
    }
  }

  if (siteWorkLoading) {
    return (
      <SupervisorLayout supervisorType="site_supervisor">
        <PageMessage message="Loading service attendance..." />
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
            "Service attendance data could not be loaded."
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
                Service Attendance
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Record student attendance, arrival and departure times,
                actual service hours and attendance remarks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshSiteWork()}
              disabled={siteWorkFetching || savingAttendance}
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
            aria-label="Attendance filters"
            className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="grid items-end gap-4 md:grid-cols-[1fr_2fr_auto]">
              <Field
                label="Reporting date (Nigeria)"
                type="date"
                value={date}
                disabled={savingAttendance}
                required
                onChange={(event) => {
                  if (event.target.value) {
                    changeFilters(event.target.value, "");
                  }
                }}
              />

              <SelectField
                label="Project"
                value={projectId}
                disabled={savingAttendance}
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
                disabled={savingAttendance}
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
              Attendance is recorded separately for each student activity.
            </p>
          </section>

          <section
            aria-label="Selected attendance summary"
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <SummaryCard
              label="Students in Selected View"
              value={studentCount}
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Attendance Pending"
              value={assignments.length - recordedCount}
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Attendance Recorded"
              value={recordedCount}
              icon={CheckCircle2}
              tone="green"
            />

            <SummaryCard
              label="Activity Assignments"
              value={assignments.length}
              icon={UserCheck}
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

          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[0.9fr_1.4fr]">
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <fieldset
                disabled={savingAttendance}
                className="min-w-0 border-0 p-0"
              >
                <h2 className="text-xl font-bold text-slate-950">
                  Record Attendance
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Select a student activity from the current view.
                </p>

                <div className="mt-6 space-y-4">
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

                  <SelectField
                    label="Attendance Status"
                    name="attendanceStatus"
                    value={form.attendanceStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="excused">Excused</option>
                  </SelectField>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Arrival Time"
                      type="time"
                      name="arrivalTime"
                      value={form.arrivalTime}
                      onChange={handleChange}
                    />

                    <Field
                      label="Departure Time"
                      type="time"
                      name="departureTime"
                      value={form.departureTime}
                      onChange={handleChange}
                    />
                  </div>

                  <Field
                    label="Actual Service Hours"
                    type="number"
                    name="serviceHours"
                    value={form.serviceHours}
                    onChange={handleChange}
                    min="0"
                    step="0.25"
                    placeholder="Example: 4.5"
                  />

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Attendance Remarks
                    </span>

                    <textarea
                      name="attendanceRemarks"
                      value={form.attendanceRemarks}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Add attendance notes or reasons for absence."
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                </div>

                {(localError || attendanceError?.message) && (
                  <div
                    role="alert"
                    className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    {localError || attendanceError?.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    savingAttendance ||
                    !form.studentAssignmentId ||
                    assignments.length === 0
                  }
                  className="mt-6 w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingAttendance
                    ? "Saving Attendance..."
                    : "Save Attendance"}
                </button>
              </fieldset>
            </form>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-200 p-5">
                <h2 className="text-xl font-bold text-slate-950">
                  Student Attendance
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
                        <AttendanceCard
                          key={assignment.assignment_id}
                          assignment={assignment}
                          onSelect={selectAssignment}
                          disabled={savingAttendance}
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

function AttendanceCard({ assignment, onSelect, disabled }) {
  const student = assignment.student || {};
  const schedule = assignment.schedule || {};
  const attendance = assignment.attendance;

  const tones = {
    present: "bg-emerald-100 text-emerald-700",
    late: "bg-amber-100 text-amber-700",
    absent: "bg-red-100 text-red-700",
    excused: "bg-blue-100 text-blue-700",
  };

  const status = attendance?.attendance_status;

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
            tones[status] || "bg-amber-100 text-amber-700"
          }`}
        >
          {status ? formatLabel(status) : "Pending"}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Detail
          label="Arrival"
          value={normalizeTime(attendance?.arrival_time) || "Not recorded"}
        />

        <Detail
          label="Departure"
          value={
            normalizeTime(attendance?.departure_time) || "Not recorded"
          }
        />

        <Detail
          label="Actual Service Hours"
          value={attendance?.service_hours ?? "Not recorded"}
        />

        <Detail
          label="Remarks"
          value={attendance?.attendance_remarks || "No remarks"}
        />
      </dl>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(assignment.assignment_id)}
        className="mt-4 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50 disabled:opacity-60"
      >
        {attendance ? "Edit Attendance" : "Record Attendance"}
      </button>
    </article>
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

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        {...props}
        className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
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

function normalizeTime(value) {
  return value ? String(value).slice(0, 5) : "";
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
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}