import { useState } from "react";
import { Link } from "react-router-dom";

import StudentLayout from "../../layouts/StudentLayout";
import { useStudentLearning } from "../../hooks/useStudentLearning";

const educatorRoles = [
  { role: "instructor", label: "Instructors" },
  { role: "facilitator", label: "Facilitators" },
  { role: "coach", label: "Coaches" },
];

export default function StudentLearningPage() {
  const { classes, loading, fetching, error, refresh } = useStudentLearning();

  const [search, setSearch] = useState("");

  const courseClasses = asArray(classes);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredClasses = courseClasses.filter((courseClass) =>
    [
      courseClass.course_title,
      courseClass.class_name,
      ...asArray(courseClass.educators).map((educator) => educator.full_name),
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(normalizedSearch),
    ),
  );

  return (
    <StudentLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Student Portal
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                My Learning
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                View your courses, educators, learning progress, classroom
                access, shared resources and activities.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/student/schedule"
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Daily Schedule
              </Link>

              <button
                type="button"
                onClick={() => refresh()}
                disabled={fetching}
                className="rounded-lg bg-blue-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
              >
                {fetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </header>

          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
            <label
              htmlFor="learning-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Search courses and educators
            </label>

            <input
              id="learning-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Enter a course or educator name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </section>

          {loading ? (
            <p role="status" className="mt-8 text-slate-600">
              Loading your courses...
            </p>
          ) : error ? (
            <div
              role="alert"
              className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
            >
              <p>{error.message || "Your courses could not be loaded."}</p>

              <button
                type="button"
                onClick={() => refresh()}
                disabled={fetching}
                className="mt-3 text-sm font-semibold underline disabled:opacity-60"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <p aria-live="polite" className="mt-6 text-sm text-slate-500">
                Showing {filteredClasses.length} of {courseClasses.length}{" "}
                enrolled course classes.
              </p>

              {filteredClasses.length > 0 ? (
                <div className="mt-4 grid items-start gap-5 lg:grid-cols-2">
                  {filteredClasses.map((courseClass) => (
                    <CourseCard
                      key={courseClass.class_id}
                      courseClass={courseClass}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <h2 className="font-bold text-blue-950">
                    {normalizedSearch
                      ? "No matching courses"
                      : "No enrolled courses available"}
                  </h2>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {normalizedSearch
                      ? "Try another course or educator name."
                      : "Your courses will appear here when your enrolments are available."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </StudentLayout>
  );
}

function CourseCard({ courseClass }) {
  const educators = asArray(courseClass.educators);
  const resources = asArray(courseClass.resources);
  const activities = asArray(courseClass.activities);
  const records = asArray(courseClass.learning_records);

  const classroomUrl = getClassroomUrl(courseClass.google_classroom_url);

  const className = String(courseClass.class_name || "").trim();
  const courseTitle = String(courseClass.course_title || "").trim();

  const showClassName =
    className && className.toLowerCase() !== courseTitle.toLowerCase();

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 p-5">
        <h2 className="text-xl font-bold text-blue-950">
          {courseTitle || "Course"}
        </h2>

        {showClassName && (
          <p className="mt-1 text-sm text-slate-500">{className}</p>
        )}

        {courseClass.description && (
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
            {courseClass.description}
          </p>
        )}
      </header>

      <div className="p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail
            label="Delivery Mode"
            value={formatLabel(courseClass.delivery_mode)}
          />

          <Detail
            label="Location"
            value={courseClass.location || "Not provided"}
          />

          <Detail label="Starts" value={formatDate(courseClass.start_date)} />

          <Detail label="Ends" value={formatDate(courseClass.end_date)} />
        </dl>

        <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
          {educatorRoles.map(({ role, label }) => {
            const assignedEducators = educators.filter(
              (educator) => educator.role === role,
            );

            return (
              <section key={role}>
                <h3 className="text-sm font-bold text-slate-800">{label}</h3>

                {assignedEducators.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {assignedEducators.map((educator) => (
                      <li
                        key={`${educator.staff_profile_id}:${role}`}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900"
                      >
                        {educator.full_name || "Educator"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No {label.toLowerCase()} assigned.
                  </p>
                )}
              </section>
            );
          })}
        </div>

        <section className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-800">Google Classroom</h3>

          {classroomUrl || courseClass.google_classroom_code ? (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {classroomUrl && (
                <a
                  href={classroomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
                >
                  Open Google Classroom
                </a>
              )}

              {courseClass.google_classroom_code && (
                <p className="text-sm text-slate-600">
                  Class code:{" "}
                  <span className="break-all font-mono font-bold text-slate-900">
                    {courseClass.google_classroom_code}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Classroom access has not been provided yet.
            </p>
          )}
        </section>

        <CourseAttendance attendance={asArray(courseClass.attendance)} />

        <CourseLearningProgress records={records} />
        <CourseResources resources={resources} />
        <CourseActivities activities={activities} />
      </div>
    </article>
  );
}

function CourseAttendance({ attendance }) {
  const statusStyles = {
    present: "bg-emerald-100 text-emerald-800",
    late: "bg-amber-100 text-amber-800",
    absent: "bg-red-100 text-red-800",
    excused: "bg-slate-100 text-slate-700",
  };

  return (
    <section className="mt-6 border-t border-slate-100 pt-5">
      <h3 className="font-bold text-blue-950">
        My Attendance ({attendance.length})
      </h3>

      {attendance.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No attendance has been recorded for you in this course yet.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {attendance.map((record) => (
            <article
              key={record.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="break-words font-semibold text-slate-900">
                    {record.session_title || "Class session"}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(record.session_date)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[record.attendance_status] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {formatLabel(record.attendance_status)}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Session: {formatAttendanceTime(record.start_time)}
                {" – "}
                {formatAttendanceTime(record.end_time)}
                {" · WAT"}
              </p>

              {(record.arrival_time || record.departure_time) && (
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Detail
                    label="Arrival"
                    value={formatAttendanceTime(record.arrival_time)}
                  />

                  <Detail
                    label="Departure"
                    value={formatAttendanceTime(record.departure_time)}
                  />
                </dl>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatAttendanceTime(value) {
  if (!value) return "Not recorded";

  const [hours, minutes] = String(value).split(":");
  const hour = Number(hours);

  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !/^[0-5]\d$/.test(minutes || "")
  ) {
    return "Not recorded";
  }

  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

function CourseLearningProgress({ records }) {
  return (
    <section className="mt-6 border-t border-slate-100 pt-5">
      <h3 className="font-bold text-blue-950">
        My Learning Progress ({records.length})
      </h3>

      {records.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No learning progress has been recorded for you in this course yet.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {records.map((record) => (
            <details
              key={record.id}
              className="rounded-xl border border-blue-100 bg-blue-50/40 p-4"
            >
              <summary className="cursor-pointer break-words font-semibold text-blue-950">
                {record.activity_title ||
                  `${formatLabel(record.record_type)} record`}
              </summary>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {formatLabel(record.record_type)}
                </span>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
                  {formatLabel(record.learning_status)}
                </span>
              </div>

              <p className="mt-3 text-xs leading-6 text-slate-500">
                Recorded by {record.educator_name || "Your instructor"}
                {" · "}
                {formatRecordedDate(record.recorded_at)}
              </p>

              {record.session_title && (
                <p className="mt-2 text-sm text-slate-600">
                  Session: {record.session_title}
                  {record.session_date
                    ? ` · ${formatDate(record.session_date)}`
                    : ""}
                </p>
              )}

              <ActivityText
                label="Instructor Feedback"
                value={record.feedback}
              />

              <ActivityText label="Your Strengths" value={record.strengths} />

              <ActivityText
                label="Areas to Develop"
                value={record.development_area}
              />
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

function CourseResources({ resources }) {
  return (
    <section className="mt-6 border-t border-slate-100 pt-5">
      <h3 className="font-bold text-blue-950">
        Course Resources ({resources.length})
      </h3>

      {resources.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No resources have been shared yet.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {resources.map((resource) => {
            const resourceUrl = getResourceUrl(resource.resource_url);

            return (
              <article
                key={resource.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold text-slate-500">
                  {formatLabel(resource.resource_type)}
                </p>

                <h4 className="mt-1 break-words font-semibold text-slate-900">
                  {resource.title || "Course resource"}
                </h4>

                {resource.description && (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {resource.description}
                  </p>
                )}

                {resourceUrl && (
                  <a
                    href={resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-blue-900 underline"
                  >
                    Open Resource
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CourseActivities({ activities }) {
  return (
    <section className="mt-6 border-t border-slate-100 pt-5">
      <h3 className="font-bold text-blue-950">
        Course Activities ({activities.length})
      </h3>

      {activities.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No activities have been shared yet.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {activities.map((activity) => (
            <details
              key={activity.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <summary className="cursor-pointer break-words font-semibold text-slate-900">
                {activity.title || "Learning activity"}
              </summary>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {formatLabel(activity.activity_type)}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    activity.status === "completed"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {activity.status === "completed"
                    ? "Activity closed"
                    : "Active activity"}
                </span>
              </div>

              <ActivityText label="Description" value={activity.description} />

              <ActivityText
                label="Instructions"
                value={activity.instructions}
              />

              <ActivityText
                label="Expected Outcome"
                value={activity.expected_outcome}
              />
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityText({ label, value }) {
  if (!value) return null;

  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold text-slate-800">{label}</h4>

      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>

      <dd className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getClassroomUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === "https:" && url.hostname === "classroom.google.com"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function getResourceUrl(value) {
  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function formatLabel(value) {
  return String(value || "Not provided")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatRecordedDate(value) {
  if (!value) return "Date not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
    timeZoneName: "short",
  }).format(date);
}
