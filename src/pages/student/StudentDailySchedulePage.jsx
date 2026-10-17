import { useState } from "react";

import StudentLayout from "../../layouts/StudentLayout";
import { useStudentDailySchedule } from "../../hooks/useStudentDailySchedule";
import { useDevotions } from "../../hooks/useDevotions";

const ACTIVITY_LABELS = {
  class: "Class",
  learning_experience: "Learning experience",
  service: "Service duty",
  devotion: "Devotion",
};

export default function StudentDailySchedulePage() {
  const [date, setDate] = useState(getTodayInNigeria);

  const {
    activities,
    scheduleLoading,
    scheduleFetching,
    scheduleError,
    refreshSchedule,
  } = useStudentDailySchedule(date);

  const {
    devotions,
    devotionsLoading,
    devotionsFetching,
    devotionsError,
    refreshDevotions,
  } = useDevotions(date, date);

  const loading = scheduleLoading || devotionsLoading;
  const fetching = scheduleFetching || devotionsFetching;
  const hasError = Boolean(scheduleError || devotionsError);

  const combinedActivities = [
    ...activities.map((activity) => ({
      ...activity,
      listKey: `activity:${activity.id}`,
    })),
    ...devotions.map((devotion) => ({
      ...devotion,
      listKey: `devotion:${devotion.id}`,
      parent_title: "Advisory Department",
      delivery_mode: devotion.location ? "in_person" : "online",
    })),
  ].sort(
    (a, b) =>
      String(a.start_time || "99:99").localeCompare(
        String(b.start_time || "99:99"),
      ) ||
      String(a.title || "").localeCompare(String(b.title || "")) ||
      a.listKey.localeCompare(b.listKey),
  );

  const scheduledCount = combinedActivities.filter(
    (activity) =>
      activity.status !== "cancelled" &&
      activity.status !== "completed",
  ).length;

  function refreshAll() {
    void Promise.allSettled([
      refreshSchedule(),
      refreshDevotions(),
    ]);
  }

  return (
    <StudentLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-5xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Student Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">
              My Daily Schedule
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              View your classes, learning experiences, assigned service
              duties and devotions. All times are Nigeria time (WAT).
            </p>
          </header>

          <section
            aria-label="Schedule controls"
            className="mt-8 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Schedule date
              <input
                type="date"
                required
                value={date}
                onChange={(event) => {
                  if (event.target.value) {
                    setDate(event.target.value);
                  }
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>

            <button
              type="button"
              onClick={() => setDate(getTodayInNigeria())}
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>

            <button
              type="button"
              onClick={refreshAll}
              disabled={fetching}
              className="rounded-lg bg-blue-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {fetching ? "Refreshing..." : "Refresh"}
            </button>
          </section>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {formatDate(date)}
            </h2>

            {!loading && !hasError && (
              <p className="text-sm text-slate-500">
                {scheduledCount} scheduled{" "}
                {scheduledCount === 1 ? "activity" : "activities"}
              </p>
            )}
          </div>

          {scheduleError && (
            <ErrorMessage
              title="Classes, learning experiences and service duties could not be refreshed."
              message={scheduleError.message}
            />
          )}

          {devotionsError && (
            <ErrorMessage
              title="Devotions could not be refreshed."
              message={devotionsError.message}
            />
          )}

          {hasError && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your schedule may be incomplete or contain previously loaded
              information. Use Refresh to try again.
            </p>
          )}

          {loading && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-slate-200 bg-white p-5 text-center text-slate-500"
            >
              Loading your schedule...
            </p>
          )}

          {combinedActivities.length > 0 ? (
            <div className="mt-5 space-y-4">
              {combinedActivities.map((activity) => (
                <ScheduleCard
                  key={activity.listKey}
                  activity={activity}
                />
              ))}
            </div>
          ) : !loading && !hasError ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="font-semibold text-slate-800">
                No scheduled activities for this day
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dated classes, learning experiences, assigned service
                duties and devotions will appear here when scheduled.
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </StudentLayout>
  );
}

function ScheduleCard({ activity }) {
  const cancelled = activity.status === "cancelled";
  const completed = activity.status === "completed";
  const isService = activity.activity_type === "service";
  const isDevotion = activity.activity_type === "devotion";

  const classroomUrl = getClassroomUrl(
    activity.google_classroom_url,
  );

  const meetingUrl = getHttpsUrl(activity.meeting_url);
  const recordingUrl = getHttpsUrl(activity.recording_url);

  const statusTone = cancelled
    ? "bg-red-100 text-red-700"
    : completed
      ? "bg-green-100 text-green-700"
      : "bg-blue-100 text-blue-700";

  const activityTone = isDevotion
    ? "bg-purple-100 text-purple-800"
    : isService
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-600";

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-5 p-5 md:grid-cols-[170px_1fr] md:p-6">
        <div>
          <p className="text-lg font-bold text-blue-950">
            {formatTime(activity.start_time)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            to {formatTime(activity.end_time)}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-400">
            WAT · Nigeria
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${activityTone}`}
            >
              {ACTIVITY_LABELS[activity.activity_type] || "Activity"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone}`}
            >
              {formatLabel(activity.status)}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-bold text-slate-950">
            {activity.title || "Scheduled activity"}
          </h3>

          {activity.parent_title && (
            <p className="mt-1 text-sm font-medium text-slate-600">
              {activity.parent_title}
            </p>
          )}

          {activity.topic && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              <span className="font-semibold">
                {isService ? "Your assigned task: " : "Topic: "}
              </span>
              {activity.topic}
            </p>
          )}

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail
              label="Location"
              value={
                activity.location ||
                (isDevotion && (meetingUrl || recordingUrl)
                  ? "Online / linked content"
                  : null)
              }
            />

            {isDevotion ? (
              <Detail
                label="Guest Speaker(s)"
                value={activity.speaker}
              />
            ) : (
              <Detail
                label="Delivery mode"
                value={formatLabel(activity.delivery_mode)}
                capitalize
              />
            )}
          </dl>

          {isService && <ServiceDetails activity={activity} />}

          {isDevotion && activity.description && (
            <div className="mt-5 rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h4 className="text-sm font-semibold text-purple-900">
                Description / Instructions
              </h4>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                {activity.description}
              </p>
            </div>
          )}

          {cancelled ? (
            <p className="mt-4 text-sm font-medium text-red-700">
              This activity has been cancelled.
            </p>
          ) : isDevotion ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {!completed && meetingUrl && (
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Join Live Meeting
                </a>
              )}

              {recordingUrl && (
                <a
                  href={recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-900"
                >
                  Recording / Conference Talk
                </a>
              )}
            </div>
          ) : (
            !isService &&
            (classroomUrl || activity.google_classroom_code) && (
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
                {classroomUrl && (
                  <a
                    href={classroomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Open Google Classroom
                  </a>
                )}

                {activity.google_classroom_code && (
                  <p className="text-sm text-slate-600">
                    Class code:{" "}
                    <span className="font-mono font-bold text-slate-900">
                      {activity.google_classroom_code}
                    </span>
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </article>
  );
}

function ServiceDetails({ activity }) {
  return (
    <div className="mt-5 space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <dl className="grid gap-4 sm:grid-cols-2">
        <Detail
          label="Scheduled hours"
          value={activity.scheduled_hours}
        />
        <Detail
          label="Team"
          value={activity.team_name || "Not assigned"}
        />
        <Detail
          label="Responsibility level"
          value={formatLabel(activity.responsibility_level)}
          capitalize
        />
      </dl>

      <ServiceInstruction
        title="Task instructions"
        value={activity.task_description}
      />
      <ServiceInstruction
        title="Expected outcome"
        value={activity.expected_outcome}
      />
      <ServiceInstruction
        title="Safety instructions"
        value={activity.safety_requirements}
      />

      <p className="text-xs leading-5 text-amber-900">
        Scheduled hours describe the planned duty. Actual service hours
        are recorded separately by your supervisor.
      </p>
    </div>
  );
}

function Detail({ label, value, capitalize = false }) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "Not provided"
      : value;

  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd
        className={`mt-1 whitespace-pre-wrap break-words text-sm font-medium text-slate-800 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {displayValue}
      </dd>
    </div>
  );
}

function ServiceInstruction({ title, value }) {
  if (!value) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-amber-900">
        {title}
      </h4>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function ErrorMessage({ title, message }) {
  return (
    <div
      role="alert"
      className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
    >
      <p className="font-semibold">{title}</p>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}

function getTodayInNigeria() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const value = (type) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

function formatTime(value) {
  if (!value) return "Time not provided";

  const [hours, minutes] = String(value).split(":");
  const hour = Number(hours);
  const minute = Number(minutes);

  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    minutes === undefined ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    return "Time not provided";
  }

  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${
    hour >= 12 ? "PM" : "AM"
  }`;
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00+01:00`);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function formatLabel(value) {
  return String(value || "Not provided").replaceAll("_", " ");
}

function getHttpsUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function getClassroomUrl(value) {
  const safeUrl = getHttpsUrl(value);

  if (!safeUrl) return null;

  const url = new URL(safeUrl);

  return url.hostname === "classroom.google.com"
    ? url.href
    : null;
}