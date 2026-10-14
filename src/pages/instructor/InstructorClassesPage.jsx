import {
  BookOpen,
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";

import { useInstructorDashboard } from "../../hooks/useInstructorDashboard";
import InstructorLayout from "../../layouts/InstructorLayout";

export default function InstructorClassesPage() {
  const {
    instructorDashboard,
    instructorDashboardLoading,
    instructorDashboardFetching,
    instructorDashboardError,
    refreshInstructorDashboard,
  } = useInstructorDashboard();

  if (instructorDashboardLoading) {
    return (
      <InstructorLayout>
        <PageMessage message="Loading your classes..." />
      </InstructorLayout>
    );
  }

  if (instructorDashboardError) {
    return (
      <InstructorLayout>
        <PageMessage
          error
          message={
            instructorDashboardError.message ||
            "Unable to load your classes."
          }
        />
      </InstructorLayout>
    );
  }

  const courses =
    instructorDashboard?.courses || [];

  const sessions =
    instructorDashboard?.upcomingSessions ||
    [];

  return (
    <InstructorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Teaching Assignments
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                My Classes
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review your assigned learning
                areas, classes, students and
                upcoming teaching schedule.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshInstructorDashboard()
              }
              disabled={
                instructorDashboardFetching
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  instructorDashboardFetching
                    ? "animate-spin"
                    : ""
                }
              />

              {instructorDashboardFetching
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </header>

          {courses.length > 0 ? (
            <section className="mt-8 space-y-6">
              {courses.map((course) => (
                <CourseSection
                  key={course.course_id}
                  course={course}
                  sessions={sessions}
                />
              ))}
            </section>
          ) : (
            <section className="mt-8 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <BookOpen className="mx-auto h-10 w-10 text-slate-400" />

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No classes assigned
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Classes assigned by the Super
                Administrator will appear here.
              </p>
            </section>
          )}
        </div>
      </main>
    </InstructorLayout>
  );
}

function CourseSection({
  course,
  sessions,
}) {
  const classes =
    Array.isArray(course.classes)
      ? course.classes
      : [];

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-950 px-2.5 py-1 text-xs font-bold text-white">
                {course.code}
              </span>

              <StatusBadge
                value={
                  course.course_status
                }
              />

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {formatLabel(
                  course.assignment_role,
                )}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-bold text-slate-950">
              {course.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {course.learning_area ||
                "Learning area not specified"}
            </p>
          </div>

          <p className="text-sm font-semibold text-slate-600">
            {classes.length} class
            {classes.length === 1
              ? ""
              : "es"}
          </p>
        </div>
      </div>

      {classes.length > 0 ? (
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          {classes.map((classItem) => {
            const classSessions =
              sessions.filter(
                (session) =>
                  session.class_id ===
                  classItem.class_id,
              );

            return (
              <ClassCard
                key={classItem.class_id}
                classItem={classItem}
                sessions={classSessions}
              />
            );
          })}
        </div>
      ) : (
        <p className="p-6 text-sm text-slate-500">
          No classes have been created for
          this course.
        </p>
      )}
    </article>
  );
}

function ClassCard({
  classItem,
  sessions,
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950">
            {classItem.name}
          </h3>

          <p className="mt-1 text-sm font-semibold text-blue-700">
            {classItem.code}
          </p>
        </div>

        <StatusBadge
          value={classItem.status}
        />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <Detail
          icon={Users}
          value={`${Number(
            classItem.active_student_count,
          ) || 0} students`}
        />

        <Detail
          icon={CalendarDays}
          value={
            classItem.cohort_name ||
            "No cohort"
          }
        />

        <Detail
          icon={MapPin}
          value={
            classItem.location ||
            "Location not specified"
          }
        />

        <Detail
          icon={BookOpen}
          value={formatLabel(
            classItem.delivery_mode,
          )}
        />
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <h4 className="text-sm font-bold text-slate-900">
          Upcoming Schedule
        </h4>

        {sessions.length > 0 ? (
          <div className="mt-3 space-y-3">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className="rounded-lg bg-slate-50 p-3"
              >
                <p className="font-semibold text-slate-900">
                  {session.title}
                </p>

                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={14} />

                  {formatDate(
                    session.session_date,
                  )}

                  <Clock3 size={14} />

                  {formatTime(
                    session.start_time,
                  )}
                  {" – "}
                  {formatTime(
                    session.end_time,
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No upcoming sessions.
          </p>
        )}
      </div>
    </section>
  );
}

function Detail({
  icon: Icon,
  value,
}) {
  return (
    <p className="flex items-center gap-2">
      <Icon
        size={16}
        className="shrink-0 text-slate-400"
      />

      <span>{value}</span>
    </p>
  );
}

function StatusBadge({
  value,
}) {
  const status = value || "unknown";

  const style =
    status === "active" ||
    status === "ongoing"
      ? "bg-emerald-100 text-emerald-700"
      : status === "scheduled" ||
          status === "planned"
        ? "bg-blue-100 text-blue-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}
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
    return "Not specified";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
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

function formatTime(value) {
  if (!value) {
    return "Time not specified";
  }

  const [hour, minute] =
    value.split(":");

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(
      2000,
      0,
      1,
      Number(hour),
      Number(minute),
    ),
  );
}