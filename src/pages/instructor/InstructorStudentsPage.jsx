import {
  AlertTriangle,
  BookOpen,
  RefreshCw,
  Search,
  UserCheck,
  Users,
} from "lucide-react";

import { useState } from "react";

import { useInstructorDashboard } from "../../hooks/useInstructorDashboard";
import InstructorLayout from "../../layouts/InstructorLayout";

export default function InstructorStudentsPage() {
  const [classId, setClassId] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const {
    instructorDashboard,
    instructorStudents,
    instructorStudentsLoading,
    instructorStudentsFetching,
    instructorStudentsError,
    refreshInstructorStudents,
  } = useInstructorDashboard({
    classId: classId || null,
  });

  const courses =
    instructorDashboard?.courses || [];

  const classes = courses.flatMap(
    (course) =>
      (course.classes || []).map(
        (classItem) => ({
          ...classItem,
          course_code: course.code,
          course_title: course.title,
        }),
      ),
  );

  const normalizedSearch =
    searchTerm.trim().toLowerCase();

  const visibleStudents =
    instructorStudents.filter(
      (student) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          student.full_name,
          student.preferred_name,
          student.student_number,
          student.course_title,
          student.class_name,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch),
        );
      },
    );

  if (instructorStudentsLoading) {
    return (
      <InstructorLayout>
        <PageMessage message="Loading your students..." />
      </InstructorLayout>
    );
  }

  if (instructorStudentsError) {
    return (
      <InstructorLayout>
        <PageMessage
          error
          message={
            instructorStudentsError.message ||
            "Unable to load your students."
          }
        />
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Student Learning
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                My Students
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review attendance, learning
                status and follow-up needs for
                students in your assigned
                classes.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshInstructorStudents()
              }
              disabled={
                instructorStudentsFetching
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  instructorStudentsFetching
                    ? "animate-spin"
                    : ""
                }
              />

              {instructorStudentsFetching
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </header>

          <section className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_1.4fr_auto]">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Filter by class
              </span>

              <select
                value={classId}
                onChange={(event) =>
                  setClassId(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  All assigned classes
                </option>

                {classes.map(
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
                      — {classItem.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Search students
              </span>

              <span className="flex items-center rounded-lg border border-slate-300 bg-white px-3 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                <Search
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  placeholder="Name or student number"
                  className="w-full border-0 bg-transparent px-3 py-2.5 outline-none"
                />
              </span>
            </label>

            <div className="flex items-end">
              <div className="w-full rounded-lg bg-blue-50 px-5 py-2.5 text-center">
                <p className="text-2xl font-bold text-blue-950">
                  {visibleStudents.length}
                </p>

                <p className="text-xs font-semibold text-blue-700">
                  Students shown
                </p>
              </div>
            </div>
          </section>

          {visibleStudents.length > 0 ? (
            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleStudents.map(
                (student) => (
                  <StudentCard
                    key={
                      student
                        .class_enrollment_id
                    }
                    student={student}
                  />
                ),
              )}
            </section>
          ) : (
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Users className="mx-auto h-10 w-10 text-slate-400" />

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No students found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Students enrolled in your
                assigned classes will appear
                here.
              </p>
            </section>
          )}
        </div>
      </main>
    </InstructorLayout>
  );
}

function StudentCard({
  student,
}) {
  const displayName =
    student.preferred_name ||
    student.full_name ||
    "Student";

  const attendance =
    Number(
      student.attendance_percentage,
    ) || 0;

  const followUps =
    Number(student.open_follow_ups) ||
    0;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ProfilePhoto
            student={student}
            displayName={displayName}
          />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-slate-950">
              {displayName}
            </h2>

            <p className="mt-1 text-sm font-semibold text-blue-700">
              {student.student_number ||
                "No student number"}
            </p>

            <StatusBadge
              value={
                student.enrollment_status
              }
            />
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Course and class
          </p>

          <p className="mt-2 font-bold text-slate-900">
            {student.course_code} —{" "}
            {student.course_title}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {student.class_code} —{" "}
            {student.class_name}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SmallStat
            label="Attendance"
            value={`${attendance}%`}
            warning={attendance < 75}
          />

          <SmallStat
            label="Sessions"
            value={
              student.sessions_recorded ||
              0
            }
          />

          <SmallStat
            label="Present"
            value={
              student.sessions_present ||
              0
            }
          />

          <SmallStat
            label="Absent"
            value={
              student.sessions_absent ||
              0
            }
            warning={
              Number(
                student.sessions_absent,
              ) > 0
            }
          />
        </div>

        <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
          <Detail
            icon={BookOpen}
            label="Learning Status"
            value={formatLabel(
              student.latest_learning_status,
            )}
          />

          <Detail
            icon={
              followUps > 0
                ? AlertTriangle
                : UserCheck
            }
            label="Open Follow-Ups"
            value={followUps}
            warning={followUps > 0}
          />
        </div>
      </div>
    </article>
  );
}

function ProfilePhoto({
  student,
  displayName,
}) {
  if (student.profile_photo_url) {
    return (
      <img
        src={student.profile_photo_url}
        alt={displayName}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
      {getInitials(displayName)}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  warning = false,
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon size={16} />
        {label}
      </span>

      <span
        className={
          warning
            ? "font-bold text-amber-700"
            : "font-semibold text-slate-800"
        }
      >
        {value}
      </span>
    </div>
  );
}

function SmallStat({
  label,
  value,
  warning = false,
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p
        className={`text-xl font-bold ${
          warning
            ? "text-amber-700"
            : "text-slate-950"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {label}
      </p>
    </div>
  );
}

function StatusBadge({
  value,
}) {
  return (
    <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      {formatLabel(value)}
    </span>
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

function formatLabel(value) {
  if (!value) {
    return "Not recorded";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getInitials(value) {
  return String(value)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}