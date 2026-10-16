import { useState } from "react";

import { useFacilitatorDashboard } from "../../hooks/useFacilitatorDashboard";
import FacilitatorLayout from "../../layouts/FacilitatorLayout";

const resourceTypes = [
  "document",
  "presentation",
  "video",
  "audio",
  "link",
  "worksheet",
  "equipment",
  "other",
];

const activityTypes = [
  "individual",
  "pair",
  "group",
  "discussion",
  "presentation",
  "practical",
  "reflection",
  "other",
];

export default function FacilitatorExperiencesPage() {
  const {
    facilitatorDashboard,
    facilitatorDashboardLoading,
    facilitatorDashboardFetching,
    facilitatorDashboardError,
    refreshFacilitatorDashboard,
    createResource,
    createActivity,
  } = useFacilitatorDashboard();

  const experiences = facilitatorDashboard?.experiences || [];

  return (
    <FacilitatorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Facilitator Portal
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                My Courses
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Review your assigned courses and share resources and
                activities with enrolled students.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshFacilitatorDashboard()}
              disabled={facilitatorDashboardFetching}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              {facilitatorDashboardFetching ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {facilitatorDashboardLoading ? (
            <p role="status" className="mt-8 text-slate-600">
              Loading your courses...
            </p>
          ) : facilitatorDashboardError || !facilitatorDashboard ? (
            <Message error>
              {facilitatorDashboardError?.message ||
                "Your courses could not be loaded."}
            </Message>
          ) : experiences.length === 0 ? (
            <Message>
              No courses are assigned to you yet. Courses appear after
              your facilitator assignment is saved in Staff Management.
            </Message>
          ) : (
            <>
              <p className="mt-6 text-sm text-slate-500">
                {experiences.length} course{" "}
                {experiences.length === 1 ? "assignment" : "assignments"}.
                Student counts are shown separately for each course.
              </p>

              <div className="mt-4 grid items-start gap-6 xl:grid-cols-2">
                {experiences.map((experience) => (
                  <CourseCard
                    key={
                      experience.assignment_id ||
                      experience.learning_experience_id ||
                      experience.id
                    }
                    experience={experience}
                    createResource={createResource}
                    createActivity={createActivity}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </FacilitatorLayout>
  );
}

function CourseCard({ experience, createResource, createActivity }) {
  const [mode, setMode] = useState(null);

  const experienceId =
    experience.learning_experience_id || experience.id;

  const canCreate = ["planned", "active"].includes(experience.status);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-blue-950">
            {experience.title || "Course"}
          </h2>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {formatLabel(experience.status)}
          </span>
        </div>

        {experience.description && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {experience.description}
          </p>
        )}
      </header>

      <div className="p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail
            label="Starts"
            value={formatDate(experience.start_date)}
          />
          <Detail
            label="Ends"
            value={formatDate(experience.end_date)}
          />
          <Detail
            label="Location"
            value={experience.location || "Not provided"}
          />
          <Detail
            label="Delivery"
            value={formatLabel(experience.delivery_mode)}
          />
        </dl>

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
          <Detail
            label="Enrolled Students"
            value={Number(experience.student_count) || 0}
          />
          <Detail
            label="Sessions"
            value={Number(experience.session_count) || 0}
          />
          <Detail
            label="Resources"
            value={Number(experience.resource_count) || 0}
          />
          <Detail
            label="Activities"
            value={Number(experience.activity_count) || 0}
          />
        </dl>

        {canCreate && experienceId ? (
          <>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMode("resource")}
                aria-expanded={mode === "resource"}
                className="rounded-lg bg-blue-950 px-4 py-3 text-sm font-semibold text-white"
              >
                Add Resource
              </button>

              <button
                type="button"
                onClick={() => setMode("activity")}
                aria-expanded={mode === "activity"}
                className="rounded-lg border border-blue-950 px-4 py-3 text-sm font-semibold text-blue-950"
              >
                Add Activity
              </button>
            </div>

            {mode && (
              <ContentForm
                key={mode}
                mode={mode}
                experienceId={experienceId}
                createResource={createResource}
                createActivity={createActivity}
                onClose={() => setMode(null)}
              />
            )}
          </>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            {!experienceId
              ? "The course identifier was not returned. Content creation is unavailable."
              : "New content can be added to planned or active courses."}
          </p>
        )}
      </div>
    </article>
  );
}

function ContentForm({
  mode,
  experienceId,
  createResource,
  createActivity,
  onClose,
}) {
  const isResource = mode === "resource";

  const [form, setForm] = useState({
    title: "",
    type: isResource ? "document" : "individual",
    description: "",
    resourceUrl: "",
    instructions: "",
    expectedOutcome: "",
    status: "active",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Enter a title.");
      return;
    }

    if (isResource && form.resourceUrl.trim()) {
      try {
        const url = new URL(form.resourceUrl.trim());

        if (!["https:", "http:"].includes(url.protocol)) {
          throw new Error();
        }
      } catch {
        setError("Enter a valid http:// or https:// resource link.");
        return;
      }
    }

    setSaving(true);

    try {
      const common = {
        learningExperienceId: experienceId,
        title: form.title.trim(),
        description: form.description,
        status: form.status,
      };

      const result = isResource
        ? await createResource({
            ...common,
            resourceType: form.type,
            resourceUrl: form.resourceUrl.trim(),
          })
        : await createActivity({
            ...common,
            activityType: form.type,
            instructions: form.instructions,
            expectedOutcome: form.expectedOutcome,
          });

      if (!result?.success) {
        throw new Error("The content could not be saved.");
      }

      setForm((current) => ({
        ...current,
        title: "",
        description: "",
        resourceUrl: "",
        instructions: "",
        expectedOutcome: "",
      }));

      setSuccess(
        form.status === "active"
          ? "Saved. Enrolled students can view this in My Learning."
          : "Saved without publishing to students.",
      );
    } catch (saveError) {
      setError(saveError.message || "The content could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={saving}
      className="mt-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4"
    >
      <h3 className="font-bold text-blue-950">
        {isResource ? "Add Course Resource" : "Add Course Activity"}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        This content applies to the whole course. Choose Active to
        make it visible to enrolled students.
      </p>

      <fieldset disabled={saving} className="mt-4 min-w-0 space-y-4">
        <Field label="Title *">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </Field>

        <Field label={isResource ? "Resource Type" : "Activity Type"}>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={inputClass}
          >
            {(isResource ? resourceTypes : activityTypes).map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className={inputClass}
          />
        </Field>

        {isResource ? (
          <Field label="Resource Link (optional)">
            <input
              name="resourceUrl"
              type="url"
              value={form.resourceUrl}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>
        ) : (
          <>
            <Field label="Instructions">
              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </Field>

            <Field label="Expected Outcome">
              <textarea
                name="expectedOutcome"
                value={form.expectedOutcome}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </Field>
          </>
        )}

        <Field label="Visibility">
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="active">Active — visible to students</option>
            <option value={isResource ? "inactive" : "planned"}>
              {isResource
                ? "Inactive — hidden from students"
                : "Planned — hidden from students"}
            </option>
          </select>
        </Field>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-4 text-sm text-green-800">
          {success}
        </p>
      )}
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function Message({ error = false, children }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mt-8 rounded-xl border p-6 text-sm leading-7 ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {children}
    </div>
  );
}

function formatLabel(value) {
  return String(value || "Not provided")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:opacity-60";