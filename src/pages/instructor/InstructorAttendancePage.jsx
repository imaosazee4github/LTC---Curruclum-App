import {
  CalendarCheck,
  Clock3,
  RefreshCw,
  UserCheck,
} from "lucide-react";

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

export default function InstructorAttendancePage() {
  const [form, setForm] =
    useState(initialForm);

  const [classId, setClassId] =
    useState(null);

  const [message, setMessage] =
    useState(null);

  const {
    instructorDashboard,
    instructorStudents,
    instructorDashboardLoading,
    instructorStudentsLoading,
    instructorDashboardError,
    instructorStudentsError,
    saveAttendance,
    savingAttendance,
    attendanceError,
    resetAttendance,
    refreshInstructorDashboard,
  } = useInstructorDashboard({
    classId,
  });

  const sessions =
    instructorDashboard?.upcomingSessions ||
    [];

  function updateField(
    field,
    value,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage(null);
    resetAttendance();
  }

  function handleSessionChange(
    event,
  ) {
    const sessionId =
      event.target.value;

    const selectedSession =
      sessions.find(
        (session) =>
          session.session_id ===
          sessionId,
      );

    setClassId(
      selectedSession?.class_id ||
        null,
    );

    setForm((current) => ({
      ...current,
      sessionId,
      studentProfileId: "",
    }));

    setMessage(null);
    resetAttendance();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    if (
      form.arrivalTime &&
      form.departureTime &&
      form.departureTime <
        form.arrivalTime
    ) {
      setMessage({
        type: "error",
        text: "Departure time cannot be earlier than arrival time.",
      });

      return;
    }

    try {
      await saveAttendance(form);

      setMessage({
        type: "success",
        text: "Student attendance recorded successfully.",
      });

      setForm((current) => ({
        ...initialForm,
        sessionId:
          current.sessionId,
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to record attendance.",
      });
    }
  }

  if (
    instructorDashboardLoading
  ) {
    return (
      <InstructorLayout>
        <PageMessage message="Loading attendance information..." />
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
            "Unable to load attendance information."
          }
        />
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Class Participation
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Record Attendance
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Select a scheduled class
                session and record each
                student’s attendance.
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
                  <CalendarCheck
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Attendance Record
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Attendance is saved
                    against the selected
                    class session.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              {message ? (
                <Alert
                  type={message.type}
                  text={message.text}
                />
              ) : null}

              {attendanceError &&
              !message ? (
                <Alert
                  type="error"
                  text={
                    attendanceError.message
                  }
                />
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Class Session"
                  required
                >
                  <select
                    required
                    value={form.sessionId}
                    onChange={
                      handleSessionChange
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
                            session.session_id
                          }
                          value={
                            session.session_id
                          }
                        >
                          {session.course_code}
                          {" — "}
                          {session.class_name}
                          {" — "}
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
                  label="Student"
                  required
                >
                  <select
                    required
                    value={
                      form.studentProfileId
                    }
                    onChange={(event) =>
                      updateField(
                        "studentProfileId",
                        event.target.value,
                      )
                    }
                    disabled={
                      !form.sessionId ||
                      instructorStudentsLoading
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
                          {student.full_name}
                          {student.student_number
                            ? ` — ${student.student_number}`
                            : ""}
                        </option>
                      ),
                    )}
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

              <div className="grid gap-5 md:grid-cols-3">
                <FormField
                  label="Attendance Status"
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

                    <option value="absent">
                      Absent
                    </option>

                    <option value="late">
                      Late
                    </option>

                    <option value="excused">
                      Excused
                    </option>
                  </select>
                </FormField>

                <FormField label="Arrival Time">
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />

                    <input
                      type="time"
                      value={
                        form.arrivalTime
                      }
                      onChange={(event) =>
                        updateField(
                          "arrivalTime",
                          event.target.value,
                        )
                      }
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FormField>

                <FormField label="Departure Time">
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />

                    <input
                      type="time"
                      value={
                        form.departureTime
                      }
                      onChange={(event) =>
                        updateField(
                          "departureTime",
                          event.target.value,
                        )
                      }
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Attendance Notes">
                <textarea
                  rows="4"
                  value={form.notes}
                  onChange={(event) =>
                    updateField(
                      "notes",
                      event.target.value,
                    )
                  }
                  placeholder="Add attendance remarks or explain an absence..."
                  className={inputClass}
                />
              </FormField>

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
                    Mark this attendance record
                    for additional student
                    support or investigation.
                  </span>
                </span>
              </label>

              <button
                type="submit"
                disabled={
                  savingAttendance ||
                  !form.sessionId ||
                  !form.studentProfileId
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserCheck size={18} />

                {savingAttendance
                  ? "Saving..."
                  : "Save Attendance"}
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