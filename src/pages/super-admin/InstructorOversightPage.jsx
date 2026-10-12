import {
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  RefreshCw,
  Search,
  TriangleAlert,
  UserRoundCheck,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useInstructorOversight,
} from "../../hooks/useInstructorOversight";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";

export default function InstructorOversightPage() {
  const {
    instructorSummary,
    instructors,
    classes,
    attendance,
    instructorOversightLoading,
    instructorOversightFetching,
    instructorOversightError,
    refreshInstructorOversight,
  } = useInstructorOversight();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState("all");

  const filteredAttendance =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return attendance.filter(
        (record) => {
          const matchesClass =
            selectedClassId ===
              "all" ||
            record.class?.class_id ===
              selectedClassId;

          if (!matchesClass) {
            return false;
          }

          if (!search) {
            return true;
          }

          const searchableText = [
            record.student
              ?.full_name,
            record.student?.email,
            record.student
              ?.student_number,
            record.class?.code,
            record.class?.name,
            record.session?.title,
            record
              .attendance_status,
            record.recorded_by
              ?.full_name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            search,
          );
        },
      );
    }, [
      attendance,
      searchTerm,
      selectedClassId,
    ]);

  if (instructorOversightLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading instructor oversight..." />
      </SuperAdminLayout>
    );
  }

  if (
    instructorOversightError ||
    !instructorSummary
  ) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            instructorOversightError
              ?.message ||
            "Instructor oversight data could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Programme Oversight
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Instructor Activity and
                Attendance
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Inspect instructor
                allocations, classes,
                sessions, enrolled
                students, attendance and
                required follow-ups.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshInstructorOversight()
              }
              disabled={
                instructorOversightFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  instructorOversightFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Instructors"
              value={
                instructorSummary
                  .totalInstructors
              }
              detail="Course or class appointments"
              icon={GraduationCap}
              tone="blue"
            />

            <SummaryCard
              label="Active Classes"
              value={
                instructorSummary
                  .activeClasses
              }
              detail={`${instructorSummary.totalStudents} active students`}
              icon={BookOpen}
              tone="green"
            />

            <SummaryCard
              label="Scheduled Sessions"
              value={
                instructorSummary
                  .scheduledSessions
              }
              detail={`${instructorSummary.completedSessions} completed`}
              icon={CalendarDays}
              tone="purple"
            />

            <SummaryCard
              label="Attendance Pending"
              value={
                instructorSummary
                  .attendancePending
              }
              detail={`${instructorSummary.attendanceRecorded} recorded`}
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Follow-Ups Required"
              value={
                instructorSummary
                  .followUpsRequired
              }
              detail="Attendance concerns"
              icon={TriangleAlert}
              tone="red"
            />
          </section>

          <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Instructor Directory
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Staff appointed to courses
                or classes as instructors.
              </p>
            </div>

            {instructors.length > 0 ? (
              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                {instructors.map(
                  (instructor) => (
                    <InstructorCard
                      key={
                        instructor
                          .staff_profile_id
                      }
                      instructor={
                        instructor
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                icon={GraduationCap}
                title="No instructors found"
                message="No course or class instructor appointments are available."
              />
            )}
          </section>

          <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Class and Session
                Oversight
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Review each class,
                instructor allocation,
                enrollment and scheduled
                session.
              </p>
            </div>

            {classes.length > 0 ? (
              <div className="space-y-5 p-5">
                {classes.map(
                  (classRecord) => (
                    <ClassCard
                      key={
                        classRecord
                          .class_id
                      }
                      classRecord={
                        classRecord
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No classes found"
                message="No programme classes have been created."
              />
            )}
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Student Attendance
                Records
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Inspect attendance entered
                by instructors and identify
                students requiring
                follow-up.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_18rem]">
                <label className="relative block">
                  <span className="sr-only">
                    Search attendance
                  </span>

                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value,
                      )
                    }
                    placeholder="Search student, class, session or recorder"
                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label>
                  <span className="sr-only">
                    Filter by class
                  </span>

                  <select
                    value={
                      selectedClassId
                    }
                    onChange={(event) =>
                      setSelectedClassId(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">
                      All classes
                    </option>

                    {classes.map(
                      (classRecord) => (
                        <option
                          key={
                            classRecord
                              .class_id
                          }
                          value={
                            classRecord
                              .class_id
                          }
                        >
                          {
                            classRecord.code
                          }
                          {" — "}
                          {
                            classRecord.name
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
            </div>

            {filteredAttendance.length >
            0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <TableHeading label="Student" />
                      <TableHeading label="Class & Session" />
                      <TableHeading label="Attendance" />
                      <TableHeading label="Time" />
                      <TableHeading label="Recorded By" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredAttendance.map(
                      (record) => (
                        <AttendanceRow
                          key={
                            record
                              .attendance_id
                          }
                          record={record}
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={UserRoundCheck}
                title="No attendance records found"
                message={
                  attendance.length > 0
                    ? "No attendance records match the selected filters."
                    : "No student attendance has been recorded."
                }
              />
            )}
          </section>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function InstructorCard({
  instructor,
}) {
  const displayName =
    instructor.full_name ||
    instructor.email ||
    "Instructor";

  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-3">
        <ProfilePhoto
          profile={instructor}
          displayName={displayName}
        />

        <div className="min-w-0">
          <h3 className="truncate font-bold text-slate-950">
            {displayName}
          </h3>

          <p className="truncate text-sm text-slate-500">
            {instructor.email}
          </p>

          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
            {instructor.staff_number ||
              "No staff number"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric
          label="Courses"
          value={
            instructor
              .active_course_count
          }
        />

        <Metric
          label="Active Classes"
          value={
            instructor
              .active_class_count
          }
        />

        <Metric
          label="Completed"
          value={
            instructor
              .completed_class_count
          }
        />

        <Metric
          label="Attendance Entries"
          value={
            instructor
              .attendance_records_count
          }
        />
      </div>
    </article>
  );
}

function ClassCard({
  classRecord,
}) {
  const instructors =
    Array.isArray(
      classRecord.instructors,
    )
      ? classRecord.instructors
      : [];

  const schedules =
    Array.isArray(
      classRecord.schedules,
    )
      ? classRecord.schedules
      : [];

  const students =
    Array.isArray(
      classRecord.students,
    )
      ? classRecord.students
      : [];

  const sessions =
    Array.isArray(
      classRecord.sessions,
    )
      ? classRecord.sessions
      : [];

  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
            {classRecord.code}
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-950">
            {classRecord.name}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {classRecord.course?.code}
            {" — "}
            {classRecord.course?.title}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {classRecord.cohort?.name}
          </p>
        </div>

        <StatusBadge
          status={classRecord.status}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Students"
          value={students.length}
        />

        <Metric
          label="Sessions"
          value={sessions.length}
        />

        <Metric
          label="Schedules"
          value={schedules.length}
        />

        <Metric
          label="Delivery"
          value={formatLabel(
            classRecord.delivery_mode,
          )}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="cursor-pointer font-semibold text-slate-900">
            Instructors (
            {instructors.length})
          </summary>

          {instructors.length > 0 ? (
            <div className="mt-4 space-y-3">
              {instructors.map(
                (instructor) => (
                  <div
                    key={
                      instructor
                        .assignment_id
                    }
                    className="rounded-lg bg-slate-50 p-3"
                  >
                    <p className="font-semibold text-slate-900">
                      {instructor.full_name ||
                        instructor.email}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatLabel(
                        instructor
                          .assignment_status,
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No instructor allocated.
            </p>
          )}
        </details>

        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="cursor-pointer font-semibold text-slate-900">
            Weekly Schedules (
            {schedules.length})
          </summary>

          {schedules.length > 0 ? (
            <div className="mt-4 space-y-3">
              {schedules.map(
                (schedule) => (
                  <div
                    key={
                      schedule
                        .schedule_id
                    }
                    className="rounded-lg bg-slate-50 p-3"
                  >
                    <p className="font-semibold text-slate-900">
                      {formatLabel(
                        schedule
                          .day_of_week,
                      )}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {formatTime(
                        schedule.start_time,
                      )}
                      {" – "}
                      {formatTime(
                        schedule.end_time,
                      )}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {schedule.location ||
                        "Location not specified"}
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No weekly schedule.
            </p>
          )}
        </details>

        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="cursor-pointer font-semibold text-slate-900">
            Enrolled Students (
            {students.length})
          </summary>

          {students.length > 0 ? (
            <div className="mt-4 space-y-3">
              {students.map(
                (student) => (
                  <div
                    key={
                      student
                        .enrollment_id
                    }
                    className="rounded-lg bg-slate-50 p-3"
                  >
                    <p className="font-semibold text-slate-900">
                      {student.full_name ||
                        student.email}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {student.student_number ||
                        "No student number"}
                      {" • "}
                      {formatLabel(
                        student
                          .enrollment_status,
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No enrolled students.
            </p>
          )}
        </details>

        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="cursor-pointer font-semibold text-slate-900">
            Class Sessions (
            {sessions.length})
          </summary>

          {sessions.length > 0 ? (
            <div className="mt-4 space-y-3">
              {sessions.map(
                (session) => (
                  <div
                    key={
                      session.session_id
                    }
                    className="rounded-lg bg-slate-50 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {session.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(
                            session
                              .session_date,
                          )}
                          {" • "}
                          {formatTime(
                            session
                              .start_time,
                          )}
                        </p>
                      </div>

                      <StatusBadge
                        status={
                          session.status
                        }
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                        {
                          session
                            .attendance_recorded
                        }{" "}
                        recorded
                      </span>

                      <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                        {
                          session
                            .attendance_pending
                        }{" "}
                        pending
                      </span>

                      {Number(
                        session
                          .follow_ups_required,
                      ) > 0 ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">
                          {
                            session
                              .follow_ups_required
                          }{" "}
                          follow-up
                        </span>
                      ) : null}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No class sessions created.
            </p>
          )}
        </details>
      </div>
    </article>
  );
}

function AttendanceRow({
  record,
}) {
  return (
    <tr className="align-top">
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900">
          {record.student?.full_name ||
            record.student?.email}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {record.student
            ?.student_number ||
            "No student number"}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900">
          {record.class?.code}
          {" — "}
          {record.class?.name}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {record.session?.title}
          {" • "}
          {formatDate(
            record.session
              ?.session_date,
          )}
        </p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={
            record.attendance_status
          }
        />

        {record.follow_up_required ? (
          <p className="mt-2 text-xs font-semibold text-red-700">
            Follow-up required
          </p>
        ) : null}

        {record.notes ? (
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            {record.notes}
          </p>
        ) : null}
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
        <p>
          Arrival:{" "}
          {formatTime(
            record.arrival_time,
          )}
        </p>

        <p className="mt-1">
          Departure:{" "}
          {formatTime(
            record.departure_time,
          )}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900">
          {record.recorded_by
            ?.full_name ||
            record.recorded_by
              ?.email}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {record.recorded_by?.email}
        </p>
      </td>
    </tr>
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
    green:
      "bg-emerald-100 text-emerald-700",
    purple:
      "bg-purple-100 text-purple-700",
    amber:
      "bg-amber-100 text-amber-700",
    red:
      "bg-red-100 text-red-700",
  };

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {detail}
          </p>
        </div>

        <div
          className={`shrink-0 rounded-lg p-3 ${
            tones[tone] ||
            tones.blue
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-900">
        {value ?? 0}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const normalizedStatus =
    status || "unknown";

  const tones = {
    active:
      "bg-emerald-100 text-emerald-800",
    completed:
      "bg-blue-100 text-blue-800",
    present:
      "bg-emerald-100 text-emerald-800",
    scheduled:
      "bg-purple-100 text-purple-800",
    rescheduled:
      "bg-amber-100 text-amber-800",
    in_progress:
      "bg-blue-100 text-blue-800",
    late:
      "bg-amber-100 text-amber-800",
    absent:
      "bg-red-100 text-red-800",
    excused:
      "bg-slate-200 text-slate-700",
    cancelled:
      "bg-red-100 text-red-800",
    inactive:
      "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        tones[normalizedStatus] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {formatLabel(
        normalizedStatus,
      )}
    </span>
  );
}

function ProfilePhoto({
  profile,
  displayName,
}) {
  if (profile.profile_photo_url) {
    return (
      <img
        src={profile.profile_photo_url}
        alt={`${displayName} profile`}
        className="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
      {getInitials(displayName)}
    </div>
  );
}

function TableHeading({
  label,
}) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
    >
      {label}
    </th>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
}) {
  return (
    <div className="p-10 text-center">
      <Icon className="mx-auto h-10 w-10 text-slate-300" />

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {message}
      </p>
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
        className={`mx-auto max-w-4xl rounded-xl border px-5 py-6 ${
          error
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        {message}
      </div>
    </main>
  );
}

function formatLabel(value) {
  return String(value || "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(value) {
  if (!value) {
    return "Date not available";
  }

  const [
    year,
    month,
    day,
  ] = String(value)
    .slice(0, 10)
    .split("-");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthName =
    monthNames[
      Number(month) - 1
    ] || month;

  return `${Number(day)} ${monthName} ${year}`;
}

function formatTime(value) {
  if (!value) {
    return "Not recorded";
  }

  return String(value).slice(0, 5);
}

function getInitials(name) {
  return String(name || "IN")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .toUpperCase();
}