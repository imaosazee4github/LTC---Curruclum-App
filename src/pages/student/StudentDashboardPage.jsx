import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import { useStudentDailySchedule } from "../../hooks/useStudentDailySchedule";
import StudentLayout from "../../layouts/StudentLayout";

const ACTIVITY_LABELS = {
  class: "Class",
  learning_experience: "Learning experience",
  service: "Service duty",
};

export default function StudentDashboardPage() {
  const { profile } = useAuth();

  const [now, setNow] = useState(Date.now);
  const today = getTodayInNigeria(now);

  useEffect(() => {
    function updateClock() {
      setNow(Date.now());
    }

    const timer = window.setInterval(updateClock, 60 * 1000);

    window.addEventListener("focus", updateClock);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateClock);
    };
  }, []);

  const {
    studentProfile,
    studentProfileLoading,
    studentProfileError,
    assignedMentor,
    assignedMentorLoading,
    assignedMentorError,
    approvedMentorFeedback = [],
    mentorFeedbackLoading,
    mentorFeedbackError,
  } = useStudentProfile();

  const {
    activities,
    scheduleLoading,
    scheduleFetching,
    scheduleError,
    refreshSchedule,
  } = useStudentDailySchedule(today);

  if (studentProfileLoading) {
    return (
      <StudentLayout>
        <PageMessage message="Preparing your student dashboard..." />
      </StudentLayout>
    );
  }

  if (studentProfileError || !studentProfile) {
    return (
      <StudentLayout>
        <PageMessage
          error
          message={
            studentProfileError?.message ||
            "Your student dashboard could not be loaded."
          }
        />
      </StudentLayout>
    );
  }

  const completion = Math.min(
    100,
    Math.max(
      0,
      Number(studentProfile.profile_completion_percentage) || 0,
    ),
  );

  const displayName =
    studentProfile.preferred_name ||
    profile?.full_name?.trim().split(/\s+/)[0] ||
    "Student";

  const mentor = assignedMentor?.assigned
    ? assignedMentor.mentor
    : null;

  const sortedActivities = [...activities].sort(
    (first, second) =>
      String(first.start_time || "99:99").localeCompare(
        String(second.start_time || "99:99"),
      ),
  );

  const scheduledCount = activities.filter(
    (activity) =>
      activity.status !== "cancelled" &&
      activity.status !== "completed",
  ).length;

  const serviceCount = activities.filter(
    (activity) =>
      activity.activity_type === "service" &&
      activity.status !== "cancelled",
  ).length;

  return (
    <StudentLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Student Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">
                Welcome, {displayName}
              </h1>

              <p className="mt-2 leading-7 text-slate-600">
                View today’s activities, your mentor and approved feedback.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              {formatDashboardDate(today)} · WAT
            </p>
          </header>

          {completion < 100 && (
            <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div>
                <h2 className="font-bold text-amber-900">
                  Complete your student profile
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Your profile is {completion}% complete. Add the remaining
                  personal and emergency contact information.
                </p>
              </div>

              <Link
                to="/student/profile"
                className="rounded-lg bg-amber-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Complete Profile
              </Link>
            </section>
          )}

          <section
            aria-label="Dashboard summary"
            className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            <OverviewCard
              label="Profile Completion"
              value={`${completion}%`}
              detail={
                completion === 100
                  ? "Profile complete"
                  : "Information required"
              }
              tone="green"
            />

            <OverviewCard
              label="Today’s Activities"
              value={
                scheduleError
                  ? "Unavailable"
                  : scheduleLoading
                    ? "Loading..."
                    : scheduledCount
              }
              detail="Excludes completed and cancelled activities."
              tone="blue"
            />

            <OverviewCard
              label="Today’s Service Duties"
              value={
                scheduleError
                  ? "Unavailable"
                  : scheduleLoading
                    ? "Loading..."
                    : serviceCount
              }
              detail="Assigned duties, excluding cancellations."
              tone="amber"
            />

            <OverviewCard
              label="Assigned Mentor"
              value={
                assignedMentorError
                  ? "Unavailable"
                  : assignedMentorLoading
                    ? "Loading..."
                    : mentor?.full_name || "Not assigned"
              }
              detail="Your development support."
              tone="purple"
            />
          </section>

          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[1.3fr_1fr]">
            <DashboardSection
              title="Today’s Schedule"
              description="Classes, learning experiences and service duties. All times are WAT."
              action={
                <Link
                  to="/student/schedule"
                  className="text-sm font-semibold text-blue-900 hover:underline"
                >
                  View Daily Schedule
                </Link>
              }
            >
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => refreshSchedule()}
                  disabled={scheduleFetching}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                >
                  {scheduleFetching ? "Refreshing..." : "Refresh Schedule"}
                </button>
              </div>

              {scheduleError ? (
                <ErrorMessage
                  message={
                    scheduleError.message ||
                    "Your schedule could not be loaded."
                  }
                />
              ) : scheduleLoading ? (
                <p role="status" className="py-8 text-center text-slate-500">
                  Loading today’s schedule...
                </p>
              ) : sortedActivities.length > 0 ? (
                <div className="space-y-4">
                  {sortedActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No activities scheduled today"
                  description="Use Daily Schedule to check another date. Dated sessions and assigned service duties appear when scheduled."
                />
              )}
            </DashboardSection>

            <div className="space-y-8">
              <DashboardSection
                title="My Mentor"
                description="Your assigned development mentor."
              >
                {assignedMentorError ? (
                  <ErrorMessage
                    message={
                      assignedMentorError.message ||
                      "Mentor details could not be loaded."
                    }
                  />
                ) : assignedMentorLoading ? (
                  <p role="status" className="text-sm text-slate-500">
                    Loading mentor details...
                  </p>
                ) : mentor ? (
                  <AssignedMentorCard mentor={mentor} now={now} />
                ) : (
                  <EmptyState
                    title="No mentor assigned yet"
                    description="Your mentor details will appear once an assignment is made."
                  />
                )}
              </DashboardSection>

              <DashboardSection
                title="Approved Mentor Feedback"
                description="Feedback reviewed and approved for your viewing."
              >
                {mentorFeedbackError ? (
                  <ErrorMessage
                    message={
                      mentorFeedbackError.message ||
                      "Approved feedback could not be loaded."
                    }
                  />
                ) : mentorFeedbackLoading ? (
                  <p role="status" className="text-sm text-slate-500">
                    Loading approved feedback...
                  </p>
                ) : approvedMentorFeedback.length > 0 ? (
                  <div className="space-y-4">
                    {approvedMentorFeedback.slice(0, 3).map((feedback) => (
                      <ApprovedMentorFeedbackCard
                        key={feedback.report_id}
                        feedback={feedback}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No approved feedback yet"
                    description="Mentor feedback appears after review and approval by the Mentor Department."
                  />
                )}
              </DashboardSection>
            </div>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}

function ActivityCard({ activity }) {
  const tones = {
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500">
          {ACTIVITY_LABELS[activity.activity_type] || "Activity"}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            tones[activity.status] || "bg-blue-100 text-blue-800"
          }`}
        >
          {formatValue(activity.status)}
        </span>
      </div>

      <h3 className="mt-3 font-bold text-blue-950">
        {activity.title || "Scheduled activity"}
      </h3>

      {activity.parent_title && (
        <p className="mt-1 text-sm text-slate-600">
          {activity.parent_title}
        </p>
      )}

      <p className="mt-3 text-sm font-semibold text-slate-800">
        {formatTime(activity.start_time)} – {formatTime(activity.end_time)}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {activity.location || "Location not provided"}
      </p>
    </article>
  );
}

function AssignedMentorCard({ mentor, now }) {
  const checkIn = mentor.next_check_in_at
    ? new Date(mentor.next_check_in_at)
    : null;

  const checkInIsPast =
    checkIn !== null &&
    !Number.isNaN(checkIn.getTime()) &&
    checkIn.getTime() < now;

  return (
    <div>
      <div className="flex items-center gap-4">
        {mentor.profile_photo_url ? (
          <img
            src={mentor.profile_photo_url}
            alt={`${mentor.full_name || "Mentor"} profile`}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-800"
          >
            {getInitials(mentor.full_name)}
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-blue-950">
            {mentor.full_name || "Assigned mentor"}
          </h3>

          <p className="mt-1 text-sm text-purple-700">
            {mentor.specialization || "Student Development"}
          </p>
        </div>
      </div>

      {mentor.biography && (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {mentor.biography}
        </p>
      )}

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <MentorDetail
          label="Assignment status"
          value={formatValue(mentor.assignment_status)}
        />

        <MentorDetail
          label="Mentoring started"
          value={formatDateValue(mentor.start_date)}
        />

        <MentorDetail
          label="Next check-in"
          value={formatDateValue(mentor.next_check_in_at)}
        />

        <MentorDetail
          label="Feedback"
          value="Visible after department approval"
        />
      </dl>

      {checkInIsPast && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          The listed check-in date has passed. Confirm with your mentor
          whether it took place or needs rescheduling.
        </p>
      )}
    </div>
  );
}

function ApprovedMentorFeedbackCard({ feedback }) {
  return (
    <article className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
      <p className="font-semibold text-blue-950">
        {feedback.mentor?.full_name || "Your mentor"}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {formatValue(feedback.report_type)} · Approved{" "}
        {formatDateValue(feedback.approved_at)}
      </p>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {feedback.student_visible_summary}
      </p>
    </article>
  );
}

function MentorDetail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>

      <dd className="mt-2 text-sm font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function DashboardSection({ title, description, action, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5">
        <div>
          <h2 className="text-lg font-bold text-blue-950">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {action}
      </header>

      <div className="p-5">{children}</div>
    </section>
  );
}

function OverviewCard({ label, value, detail, tone }) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-800",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    purple: "border-purple-200 bg-purple-50 text-purple-800",
  };

  return (
    <article className={`rounded-xl border p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-sm opacity-75">{label}</p>

      <p className="mt-3 break-words text-2xl font-bold">{value}</p>

      <p className="mt-2 text-xs leading-5 opacity-75">{detail}</p>
    </article>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="font-semibold text-slate-700">{title}</p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {message}
    </p>
  );
}

function PageMessage({ message, error = false }) {
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

function getTodayInNigeria(timestamp) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));

  const part = (type) =>
    parts.find((value) => value.type === type)?.value;

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatDashboardDate(value) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(`${value}T12:00:00+01:00`));
}

function formatDateValue(value) {
  if (!value) return "Not scheduled";

  const text = String(value);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);

  const date = new Date(
    dateOnly ? `${text}T12:00:00+01:00` : text,
  );

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(dateOnly ? {} : { hour: "numeric", minute: "2-digit" }),
  }).format(date);
}

function formatTime(value) {
  if (!value) return "Time not provided";

  const [hours, minutes] = String(value).split(":");
  const hour = Number(hours);

  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !minutes) {
    return "Time not provided";
  }

  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatValue(value) {
  if (!value) return "Not available";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "M"
  );
}