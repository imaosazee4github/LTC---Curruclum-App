import { useState } from "react";

import { useDevotions } from "../../hooks/useDevotions";
import MentoringLayout from "../../layouts/MentoringLayout";

const inputClass =
  "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900";

export default function DevotionsPage() {
  const [today] = useState(getTodayInNigeria);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() => addDays(today, 30));
  const [form, setForm] = useState(() => emptyForm(today));
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  const {
    devotions,
    devotionsLoading,
    devotionsFetching,
    devotionsError,
    refreshDevotions,
    canManageDevotions,
    saveDevotion,
    savingDevotion,
  } = useDevotions(startDate, endDate);

  const invalidRange =
    !startDate || !endDate || endDate < startDate;

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setFormError("");
  }

  function resetForm() {
    setForm(emptyForm(getTodayInNigeria()));
    setFormError("");
    setMessage("");
  }

  function editDevotion(devotion) {
    setForm({
      id: devotion.id,
      title: devotion.title || "",
      date: devotion.session_date || "",
      startTime: devotion.start_time || "",
      endTime: devotion.end_time || "",
      location: devotion.location || "",
      meetingUrl: devotion.meeting_url || "",
      recordingUrl: devotion.recording_url || "",
      speaker: devotion.speaker || "",
      description: devotion.description || "",
      status: devotion.status || "scheduled",
    });

    setMessage("");
    setFormError("");

    document.getElementById("devotion-title")?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Enter a devotion title.");
      return;
    }

    if (!form.date || !form.startTime || !form.endTime) {
      setFormError("Enter the date, start time and end time.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setFormError("The end time must be after the start time.");
      return;
    }

    if (
      !form.location.trim() &&
      !form.meetingUrl.trim() &&
      !form.recordingUrl.trim()
    ) {
      setFormError(
        "Enter a location, live meeting link, or recording / conference talk link.",
      );
      return;
    }

    for (const link of [form.meetingUrl, form.recordingUrl]) {
      if (link.trim() && !isHttpsUrl(link)) {
        setFormError("Links must be valid HTTPS URLs.");
        return;
      }
    }

    try {
      const result = await saveDevotion(form);

      // Include the saved date in the list so the result stays visible.
      setStartDate((current) =>
        !current || form.date < current ? form.date : current,
      );
      setEndDate((current) =>
        !current || form.date > current ? form.date : current,
      );

      setForm(emptyForm(getTodayInNigeria()));
      setMessage(result.message || "The devotion was saved.");
    } catch (error) {
      setFormError(error.message || "The devotion could not be saved.");
    }
  }

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Advisory Department
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Devotions
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Schedule devotions for all portal users, including students,
              staff and Super Admin. Dates and times are Nigeria time (WAT).
            </p>
          </header>

          {message && (
            <p
              role="status"
              className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
              {message}
            </p>
          )}

          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                {form.id ? "Edit Devotion" : "Schedule Devotion"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Provide a location or a link. You can add a recording after
                the devotion and update its status.
              </p>

              {!canManageDevotions ? (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  Only the Advisory Department can manage devotions.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5">
                  {formError && (
                    <p
                      role="alert"
                      className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800"
                    >
                      {formError}
                    </p>
                  )}

                  <fieldset disabled={savingDevotion} className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-700">
                      Title *
                      <input
                        id="devotion-title"
                        name="title"
                        value={form.title}
                        onChange={updateField}
                        required
                        className={inputClass}
                        placeholder="Morning devotion"
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Date *
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={updateField}
                        required
                        className={inputClass}
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Start Time (WAT) *
                        <input
                          type="time"
                          name="startTime"
                          step="1"
                          value={form.startTime}
                          onChange={updateField}
                          required
                          className={inputClass}
                        />
                      </label>

                      <label className="block text-sm font-semibold text-slate-700">
                        End Time (WAT) *
                        <input
                          type="time"
                          name="endTime"
                          step="1"
                          value={form.endTime}
                          onChange={updateField}
                          required
                          className={inputClass}
                        />
                      </label>
                    </div>

                    <label className="block text-sm font-semibold text-slate-700">
                      Guest Speaker Name(s)
                      <input
                        name="speaker"
                        value={form.speaker}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="Enter one or more names"
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Location
                      <input
                        name="location"
                        value={form.location}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="LTC assembly hall"
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Live Meeting Link
                      <input
                        type="url"
                        name="meetingUrl"
                        value={form.meetingUrl}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="https://..."
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Recording / Conference Talk Link
                      <input
                        type="url"
                        name="recordingUrl"
                        value={form.recordingUrl}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="https://..."
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Description / Instructions
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={updateField}
                        rows={4}
                        className={inputClass}
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Status
                      <select
                        name="status"
                        value={form.status}
                        onChange={updateField}
                        className={inputClass}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </label>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {savingDevotion
                          ? "Saving..."
                          : form.id
                            ? "Save Changes"
                            : "Schedule Devotion"}
                      </button>

                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        {form.id ? "Cancel Editing" : "Clear Form"}
                      </button>
                    </div>
                  </fieldset>
                </form>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-950">
                  Devotion Schedule
                </h2>

                <button
                  type="button"
                  onClick={() => refreshDevotions()}
                  disabled={invalidRange || devotionsFetching}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                >
                  {devotionsFetching ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  From
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  To
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>

              {invalidRange ? (
                <p role="alert" className="mt-5 text-sm text-red-700">
                  Select a valid date range. The end date must be on or
                  after the start date.
                </p>
              ) : devotionsError ? (
                <p
                  role="alert"
                  className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800"
                >
                  {devotionsError.message}
                </p>
              ) : devotionsLoading ? (
                <p role="status" className="py-8 text-center text-slate-500">
                  Loading devotions...
                </p>
              ) : devotions.length === 0 ? (
                <p className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  No devotions scheduled within these dates.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {devotions.map((devotion) => (
                    <article
                      key={devotion.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="font-bold text-slate-950">
                          {devotion.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            devotion.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : devotion.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {devotion.status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        {formatDate(devotion.session_date)}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
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
                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                          {devotion.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        {isHttpsUrl(devotion.meeting_url) && (
                          <a
                            href={devotion.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-900"
                          >
                            Live Meeting
                          </a>
                        )}

                        {isHttpsUrl(devotion.recording_url) && (
                          <a
                            href={devotion.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-purple-200 px-3 py-2 text-sm font-semibold text-purple-900"
                          >
                            Recording / Conference Talk
                          </a>
                        )}

                        {canManageDevotions && (
                          <button
                            type="button"
                            onClick={() => editDevotion(devotion)}
                            disabled={savingDevotion}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </MentoringLayout>
  );
}

function emptyForm(date) {
  return {
    id: null,
    title: "",
    date,
    startTime: "",
    endTime: "",
    location: "",
    meetingUrl: "",
    recordingUrl: "",
    speaker: "",
    description: "",
    status: "scheduled",
  };
}

function getTodayInNigeria() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type) =>
    parts.find((part) => part.type === type)?.value;

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

function addDays(date, days) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function isHttpsUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
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