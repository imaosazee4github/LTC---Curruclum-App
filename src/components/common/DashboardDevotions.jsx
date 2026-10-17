import { useEffect, useState } from "react";

import { useDevotions } from "../../hooks/useDevotions";

export default function DashboardDevotions() {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState(getTodayInNigeria);

  useEffect(() => {
    function updateDate() {
      setToday(getTodayInNigeria());
    }

    const timer = window.setInterval(updateDate, 60 * 1000);
    window.addEventListener("focus", updateDate);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateDate);
    };
  }, []);

  const endDate = addDays(today, 7);

  const {
    devotions,
    devotionsLoading,
    devotionsFetching,
    devotionsError,
    refreshDevotions,
  } = useDevotions(today, endDate);

  const scheduledCount = devotions.filter(
    (devotion) => devotion.status === "scheduled",
  ).length;

  return (
    <aside
      aria-label="Devotions"
      className="fixed bottom-4 right-4 z-30 w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-xl border border-blue-200 bg-white shadow-xl"
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="dashboard-devotions-panel"
        className="flex w-full items-center justify-between gap-3 bg-blue-950 px-4 py-3 text-left text-white"
      >
        <span>
          <span className="block text-sm font-bold">
            Devotions
          </span>
          <span className="mt-1 block text-xs text-blue-100">
            {devotionsError
              ? "Schedule unavailable"
              : devotionsLoading
                ? "Loading..."
                : `${scheduledCount} scheduled · Today + next 7 days`}
          </span>
        </span>

        <span className="text-xs font-semibold">
          {open ? "Close" : "View"}
        </span>
      </button>

      {open && (
        <div
          id="dashboard-devotions-panel"
          className="max-h-[65vh] overflow-y-auto p-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              All dates and times are WAT.
            </p>

            <button
              type="button"
              onClick={() => refreshDevotions()}
              disabled={devotionsFetching}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
            >
              {devotionsFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {devotionsError ? (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
            >
              {devotionsError.message ||
                "Devotions could not be loaded."}
            </p>
          ) : devotionsLoading ? (
            <p role="status" className="py-4 text-sm text-slate-500">
              Loading devotions...
            </p>
          ) : devotions.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              No devotions scheduled for these dates.
            </p>
          ) : (
            <div className="space-y-4">
              {devotions.map((devotion) => (
                <article
                  key={devotion.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-sm font-bold text-blue-950">
                      {devotion.title}
                    </h2>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        devotion.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : devotion.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {formatStatus(devotion.status)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {devotion.session_date === today ? "Today · " : ""}
                    {formatDate(devotion.session_date)}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {formatTime(devotion.start_time)} –{" "}
                    {formatTime(devotion.end_time)} WAT
                  </p>

                  {devotion.speaker && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      <strong>Guest speaker(s):</strong>{" "}
                      {devotion.speaker}
                    </p>
                  )}

                  {devotion.location && (
                    <p className="mt-2 text-sm text-slate-700">
                      <strong>Location:</strong> {devotion.location}
                    </p>
                  )}

                  {devotion.description && (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                      {devotion.description}
                    </p>
                  )}

                  {devotion.status === "cancelled" ? (
                    <p className="mt-3 text-xs font-semibold text-red-700">
                      This devotion has been cancelled.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {devotion.status === "scheduled" &&
                        isHttpsUrl(devotion.meeting_url) && (
                          <a
                            href={devotion.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900"
                          >
                            Join Live Meeting
                          </a>
                        )}

                      {isHttpsUrl(devotion.recording_url) && (
                        <a
                          href={devotion.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-900"
                        >
                          Recording / Conference Talk
                        </a>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
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

function addDays(date, days) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00+01:00`);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "Time unavailable";

  const [hourText, minuteText] = String(value).split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    minuteText === undefined ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    return "Time unavailable";
  }

  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${
    hour >= 12 ? "PM" : "AM"
  }`;
}

function formatStatus(value) {
  return value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : "Not available";
}

function isHttpsUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}