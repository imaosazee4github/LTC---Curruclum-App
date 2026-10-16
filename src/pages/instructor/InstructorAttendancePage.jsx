import { CalendarCheck, RefreshCw, UserCheck } from "lucide-react";
import { useState } from "react";

import { useInstructorDashboard } from "../../hooks/useInstructorDashboard";
import InstructorLayout from "../../layouts/InstructorLayout";

const initialForm = {
  sessionId: "",
  studentProfileId: "",
  attendanceStatus: "present",
  arrivalTime: "",
  departureTime: "",
  notes: "",
  followUpRequired: false,
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

export default function InstructorAttendancePage() {
  const [form, setForm] = useState(initialForm);
  const [classId, setClassId] = useState(null);
  const [message, setMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    instructorDashboard,
    instructorStudents,
    instructorDashboardLoading,
    instructorStudentsLoading,
    instructorStudentsFetching,
    instructorDashboardError,
    instructorStudentsError,
    saveAttendance,
    savingAttendance,
    resetAttendance,
    refreshInstructorDashboard,
    refreshInstructorStudents,
  } = useInstructorDashboard({ classId });

  const sessions = Array.isArray(instructorDashboard?.sessions)
    ? instructorDashboard.sessions
    : [];

  const selectedSession = sessions.find(
    (session) => session.session_id === form.sessionId,
  );

  const students = (instructorStudents || []).filter(
    (student) =>
      selectedSession &&
      student.class_id === selectedSession.class_id,
  );

  const selectedStudent = students.find(
    (student) => student.student_profile_id === form.studentProfileId,
  );

  const studentsBusy =
    instructorStudentsLoading || instructorStudentsFetching;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
    resetAttendance();
  }

  function handleSessionChange(event) {
    const sessionId = event.target.value;
    const session = sessions.find(
      (item) => item.session_id === sessionId,
    );

    setClassId(session?.class_id || null);
    setForm({ ...initialForm, sessionId });
    setMessage(null);
    resetAttendance();
  }

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await Promise.all([
        refreshInstructorDashboard(),
        refreshInstructorStudents(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    if (
      !selectedSession ||
      !selectedStudent ||
      studentsBusy ||
      instructorStudentsError
    ) {
      setMessage({
        type: "error",
        text: "Select a session and a student enrolled in that class.",
      });
      return;
    }

    if (
      form.arrivalTime &&
      form.departureTime &&
      form.departureTime < form.arrivalTime
    ) {
      setMessage({
        type: "error",
        text: "Departure time cannot be earlier than arrival time.",
      });
      return;
    }

    try {
      const result = await saveAttendance(form);

      if (!result?.success) {
        throw new Error(
          result?.message || "Attendance could not be saved.",
        );
      }

      setMessage({
        type: "success",
        text: `Attendance saved for ${selectedStudent.full_name}.`,
      });

      setForm({
        ...initialForm,
        sessionId: selectedSession.session_id,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Unable to record attendance.",
      });
    }
  }

  return (
    <InstructorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Class Participation
              </p>
              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                Record Attendance
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Select a class session and record attendance for its
                enrolled students. All times are Nigeria time (WAT).
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || savingAttendance}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                aria-hidden="true"
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {instructorDashboardLoading ? (
            <p role="status" className="mt-8 text-slate-600">
              Loading attendance information...
            </p>
          ) : instructorDashboardError ? (
            <div className="mt-8">
              <Alert
                type="error"
                text={
                  instructorDashboardError.message ||
                  "Unable to load attendance information."
                }
              />
            </div>
          ) : sessions.length === 0 ? (
            <section className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h2 className="font-bold text-blue-950">
                No class sessions available
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Sessions for your assigned classes will appear here
                when scheduled.
              </p>
            </section>
          ) : (
            <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-6">
                <CalendarCheck
                  size={24}
                  aria-hidden="true"
                  className="shrink-0 text-blue-800"
                />
                <div>
                  <h2 className="text-lg font-bold text-blue-950">
                    Attendance Record
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Saving again for the same student and session
                    updates their existing attendance.
                  </p>
                </div>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {message && (
                  <Alert type={message.type} text={message.text} />
                )}

                <fieldset
                  disabled={savingAttendance || refreshing}
                  className="min-w-0 space-y-6"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Class Session" required>
                      <select
                        required
                        value={form.sessionId}
                        onChange={handleSessionChange}
                        className={inputClass}
                      >
                        <option value="">Select a session</option>
                        {sessions.map((session) => (
                          <option
                            key={session.session_id}
                            value={session.session_id}
                          >
                            {session.course_title || session.class_name}
                            {" — "}
                            {formatDate(session.session_date)}
                            {" — "}
                            {session.title}
                            {" — "}
                            {session.start_time?.slice(0, 5) || "Time not set"}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Student" required>
                      <select
                        required
                        value={form.studentProfileId}
                        onChange={(event) =>
                          updateField("studentProfileId", event.target.value)
                        }
                        disabled={
                          !selectedSession ||
                          studentsBusy ||
                          Boolean(instructorStudentsError)
                        }
                        className={inputClass}
                      >
                        <option value="">
                          {studentsBusy
                            ? "Loading students..."
                            : "Select a student"}
                        </option>
                        {students.map((student) => (
                          <option
                            key={student.class_enrollment_id}
                            value={student.student_profile_id}
                          >
                            {student.full_name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  {instructorStudentsError && (
                    <Alert
                      type="error"
                      text={
                        instructorStudentsError.message ||
                        "Unable to load students."
                      }
                    />
                  )}

                  {selectedSession &&
                    !studentsBusy &&
                    !instructorStudentsError &&
                    students.length === 0 && (
                      <p role="status" className="text-sm text-amber-700">
                        No active student enrolments were found for this class.
                      </p>
                    )}

                  <div className="grid gap-5 md:grid-cols-3">
                    <FormField label="Attendance Status" required>
                      <select
                        required
                        value={form.attendanceStatus}
                        onChange={(event) =>
                          updateField("attendanceStatus", event.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </FormField>

                    <FormField label="Arrival Time">
                      <input
                        type="time"
                        value={form.arrivalTime}
                        onChange={(event) =>
                          updateField("arrivalTime", event.target.value)
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Departure Time">
                      <input
                        type="time"
                        value={form.departureTime}
                        onChange={(event) =>
                          updateField("departureTime", event.target.value)
                        }
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  <FormField label="Attendance Notes">
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(event) =>
                        updateField("notes", event.target.value)
                      }
                      placeholder="Add attendance remarks or explain an absence..."
                      className={inputClass}
                    />
                  </FormField>

                  <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <input
                      type="checkbox"
                      checked={form.followUpRequired}
                      onChange={(event) =>
                        updateField("followUpRequired", event.target.checked)
                      }
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <span className="block font-semibold text-slate-900">
                        Follow-up required
                      </span>
                      <span className="mt-1 block text-sm text-slate-600">
                        Flag this attendance record for additional support.
                      </span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={
                      savingAttendance ||
                      !selectedSession ||
                      !selectedStudent ||
                      studentsBusy ||
                      Boolean(instructorStudentsError)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UserCheck size={18} aria-hidden="true" />
                    {savingAttendance ? "Saving..." : "Save Attendance"}
                  </button>
                </fieldset>
              </form>
            </section>
          )}
        </div>
      </main>
    </InstructorLayout>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Alert({ type, text }) {
  const success = type === "success";

  return (
    <div
      role={success ? "status" : "alert"}
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {text}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Date not set";

  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}