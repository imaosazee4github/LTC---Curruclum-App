import {
  BookOpen,
  CalendarDays,
  Clock3,
  ListChecks,
  MapPin,
  Users,
} from "lucide-react";

import {
  useInstructorDashboard,
} from "../../hooks/useInstructorDashboard";

import InstructorLayout from "../../layouts/InstructorLayout";

export default function InstructorDashboardPage() {
  const {
    instructorDashboard,
    instructorDashboardLoading,
    instructorDashboardError,
  } = useInstructorDashboard();

  if (instructorDashboardLoading) {
    return (
      <InstructorLayout>
        <PageMessage message="Loading Instructor Dashboard..." />
      </InstructorLayout>
    );
  }

  if (
    instructorDashboardError ||
    !instructorDashboard
  ) {
    return (
      <InstructorLayout>
        <PageMessage
          error
          message={
            instructorDashboardError
              ?.message ||
            "The Instructor Dashboard could not be loaded."
          }
        />
      </InstructorLayout>
    );
  }

  const {
    instructor,
    summary,
    courses,
    upcomingSessions,
    followUps,
  } = instructorDashboard;

  return (
    <InstructorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Teaching & Learning
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              Welcome,{" "}
              {instructor?.full_name ||
                "Instructor"}
            </h1>

            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Review your assigned courses,
              upcoming sessions, students,
              learning progress and follow-up
              responsibilities.
            </p>

            {instructor?.specialization ? (
              <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                {instructor.specialization}
              </p>
            ) : null}
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Assigned Courses"
              value={
                summary.assignedCourses
              }
              detail="Current teaching assignments"
              icon={BookOpen}
              tone="blue"
            />

            <SummaryCard
              label="Active Classes"
              value={
                summary.activeClasses
              }
              detail="Classes currently running"
              icon={CalendarDays}
              tone="green"
            />

            <SummaryCard
              label="Assigned Students"
              value={
                summary.assignedStudents
              }
              detail="Unique active students"
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Open Follow-Ups"
              value={
                summary.openFollowUps
              }
              detail={`${summary.sessionsToday} session${
                summary.sessionsToday ===
                1
                  ? ""
                  : "s"
              } today`}
              icon={ListChecks}
              tone={
                summary.openFollowUps > 0
                  ? "amber"
                  : "slate"
              }
            />
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="My Courses & Classes"
                description="Courses assigned to you and their active class groups."
              />

              {courses.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {courses.map(
                    (course) => (
                      <CourseCard
                        key={
                          course.course_id
                        }
                        course={course}
                      />
                    ),
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No course assignments"
                  description="Courses assigned by the Super Administrator will appear here."
                />
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Upcoming Schedule"
                description={`${summary.upcomingSessions} upcoming session${
                  summary.upcomingSessions ===
                  1
                    ? ""
                    : "s"
                }`}
              />

              {upcomingSessions.length >
              0 ? (
                <div className="divide-y divide-slate-200">
                  {upcomingSessions
                    .slice(0, 8)
                    .map((session) => (
                      <SessionItem
                        key={
                          session.session_id
                        }
                        session={session}
                      />
                    ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="No upcoming sessions"
                  description="Scheduled class sessions will appear here."
                />
              )}
            </section>
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Follow-Up Needed"
              description="Open student learning concerns and required actions."
            />

            {followUps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">
                        Student
                      </th>

                      <th className="px-5 py-4">
                        Course / Class
                      </th>

                      <th className="px-5 py-4">
                        Concern
                      </th>

                      <th className="px-5 py-4">
                        Required Action
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {followUps.map(
                      (item) => (
                        <FollowUpRow
                          key={
                            item.learning_record_id
                          }
                          item={item}
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={ListChecks}
                title="No open follow-ups"
                description="Student concerns requiring your action will appear here."
              />
            )}
          </section>
        </div>
      </main>
    </InstructorLayout>
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
      "bg-blue-100 text-blue-800",
    green:
      "bg-emerald-100 text-emerald-800",
    purple:
      "bg-violet-100 text-violet-800",
    amber:
      "bg-amber-100 text-amber-800",
    slate:
      "bg-slate-100 text-slate-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            tones[tone] ||
            tones.slate
          }`}
        >
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {detail}
      </p>
    </article>
  );
}

function CourseCard({
  course,
}) {
  const classes =
    Array.isArray(course.classes)
      ? course.classes
      : [];

  return (
    <article className="p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
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

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {formatLabel(
                course.assignment_role,
              )}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-bold text-slate-950">
            {course.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {course.learning_area ||
              "Learning area not specified"}
          </p>
        </div>

        <span className="text-sm font-semibold text-slate-600">
          {classes.length} class
          {classes.length === 1
            ? ""
            : "es"}
        </span>
      </div>

      {classes.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {classes.map(
            (classItem) => (
              <div
                key={
                  classItem.class_id
                }
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {classItem.name}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {classItem.code}
                    </p>
                  </div>

                  <StatusBadge
                    value={
                      classItem.status
                    }
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    {
                      classItem.cohort_name
                    }
                  </p>

                  <p className="flex items-center gap-2">
                    <Users size={15} />
                    {
                      classItem
                        .active_student_count
                    }{" "}
                    student
                    {Number(
                      classItem
                        .active_student_count,
                    ) === 1
                      ? ""
                      : "s"}
                  </p>

                  {classItem.location ? (
                    <p className="flex items-center gap-2">
                      <MapPin size={15} />
                      {
                        classItem.location
                      }
                    </p>
                  ) : null}
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          No classes have been created
          for this course.
        </p>
      )}
    </article>
  );
}

function SessionItem({
  session,
}) {
  return (
    <article className="p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-900">
          <span className="text-[10px] font-bold uppercase">
            {getMonth(
              session.session_date,
            )}
          </span>

          <span className="text-lg font-bold leading-none">
            {getDay(
              session.session_date,
            )}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">
                {session.title}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {session.course_code} ·{" "}
                {session.class_name}
              </p>
            </div>

            <StatusBadge
              value={session.status}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Clock3 size={15} />
              {formatTime(
                session.start_time,
              )}{" "}
              –{" "}
              {formatTime(
                session.end_time,
              )}
            </span>

            {session.location ? (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} />
                {session.location}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function FollowUpRow({
  item,
}) {
  return (
    <tr className="align-top">
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900">
          {item.student_name ||
            "Student"}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {item.student_number ||
            "No student number"}
        </p>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        <p>
          {item.course_title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {item.class_name}
        </p>
      </td>

      <td className="max-w-xs px-5 py-4 text-sm leading-6 text-slate-600">
        {item.concern ||
          "No concern entered"}
      </td>

      <td className="max-w-xs px-5 py-4 text-sm leading-6 text-slate-600">
        {item.follow_up_action}
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          value={
            item.follow_up_status
          }
        />
      </td>
    </tr>
  );
}

function SectionHeader({
  title,
  description,
}) {
  return (
    <header className="border-b border-slate-200 px-5 py-4">
      <h2 className="text-lg font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </header>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({
  value,
}) {
  const tones = {
    active:
      "bg-emerald-100 text-emerald-800",
    scheduled:
      "bg-blue-100 text-blue-800",
    in_progress:
      "bg-amber-100 text-amber-800",
    rescheduled:
      "bg-violet-100 text-violet-800",
    planned:
      "bg-slate-100 text-slate-700",
    completed:
      "bg-emerald-100 text-emerald-800",
    open:
      "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        tones[value] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {formatLabel(value)}
    </span>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
        role={error ? "alert" : "status"}
        className={`mx-auto max-w-3xl rounded-xl border p-6 text-center ${
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
    return "Unknown";
  }

  return String(value)
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function getMonth(value) {
  const months = [
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

  const monthIndex =
    Number(
      String(value || "")
        .slice(5, 7),
    ) - 1;

  return months[monthIndex] || "---";
}

function getDay(value) {
  return (
    String(value || "").slice(8, 10) ||
    "--"
  );
}

function formatTime(value) {
  if (!value) {
    return "--:--";
  }

  return String(value).slice(0, 5);
}