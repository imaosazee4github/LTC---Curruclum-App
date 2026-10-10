import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  Target,
  UserRound,
} from "lucide-react";

import { useState } from "react";

import { useCoachDashboard } from "../../hooks/useCoachDashboard";
import CoachLayout from "../../layouts/CoachLayout";

export default function CoachFollowUpsPage() {
  const {
    coachDashboard,
    coachDashboardLoading,
    coachDashboardFetching,
    coachDashboardError,
    refreshCoachDashboard,
    updateFollowUp,
    updatingFollowUp,
    updateFollowUpError,
    resetUpdateFollowUp,
  } = useCoachDashboard();

  const [selectedFollowUpId, setSelectedFollowUpId] =
    useState(null);

  const [form, setForm] = useState({
    status: "in_progress",
    outcome: "",
  });

  const [successMessage, setSuccessMessage] =
    useState("");

  const followUps =
    coachDashboard?.followUps || [];

  function openUpdateForm(followUp) {
    resetUpdateFollowUp();
    setSuccessMessage("");

    setSelectedFollowUpId(
      followUp.follow_up_id,
    );

    setForm({
      status:
        followUp.status === "open"
          ? "in_progress"
          : followUp.status ||
            "in_progress",

      outcome: "",
    });
  }

  function closeUpdateForm() {
    setSelectedFollowUpId(null);
    setSuccessMessage("");
    resetUpdateFollowUp();

    setForm({
      status: "in_progress",
      outcome: "",
    });
  }

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFollowUpId) {
      return;
    }

    setSuccessMessage("");
    resetUpdateFollowUp();

    try {
      await updateFollowUp({
        followUpId:
          selectedFollowUpId,

        status:
          form.status,

        outcome:
          form.outcome,
      });

      setSuccessMessage(
        "The coaching follow-up was updated successfully.",
      );

      setSelectedFollowUpId(null);

      setForm({
        status: "in_progress",
        outcome: "",
      });
    } catch (error) {
      console.error(
        "Unable to update follow-up:",
        error,
      );
    }
  }

  if (coachDashboardLoading) {
    return (
      <CoachLayout>
        <PageMessage message="Loading coaching follow-ups..." />
      </CoachLayout>
    );
  }

  if (coachDashboardError) {
    return (
      <CoachLayout>
        <PageMessage
          error
          message={
            coachDashboardError.message ||
            "Unable to load coaching follow-ups."
          }
          onRetry={
            refreshCoachDashboard
          }
        />
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Coaching Support
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Follow-Up Needed
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review student improvement
                areas, required actions,
                next goals and outstanding
                coaching support.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshCoachDashboard()
              }
              disabled={
                coachDashboardFetching
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  coachDashboardFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              {coachDashboardFetching
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              label="Open Follow-Ups"
              value={followUps.length}
              description="Actions currently requiring attention."
              icon={ClipboardCheck}
              tone="amber"
            />

            <SummaryCard
              label="In Progress"
              value={
                followUps.filter(
                  (followUp) =>
                    followUp.status ===
                    "in_progress",
                ).length
              }
              description="Follow-ups currently being handled."
              icon={RefreshCw}
              tone="blue"
            />

            <SummaryCard
              label="Students Requiring Support"
              value={
                new Set(
                  followUps.map(
                    (followUp) =>
                      followUp.student_name,
                  ),
                ).size
              }
              description="Students with outstanding coaching actions."
              icon={UserRound}
              tone="purple"
            />
          </section>

          {successMessage ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

              <p className="font-medium">
                {successMessage}
              </p>
            </div>
          ) : null}

          {updateFollowUpError ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {updateFollowUpError.message ||
                "Unable to update the follow-up."}
            </div>
          ) : null}

          <section className="mt-8">
            {followUps.length > 0 ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {followUps.map(
                  (followUp) => (
                    <FollowUpCard
                      key={
                        followUp.follow_up_id
                      }
                      followUp={
                        followUp
                      }
                      selected={
                        selectedFollowUpId ===
                        followUp.follow_up_id
                      }
                      form={form}
                      updating={
                        updatingFollowUp
                      }
                      onOpen={() =>
                        openUpdateForm(
                          followUp,
                        )
                      }
                      onClose={
                        closeUpdateForm
                      }
                      onChange={
                        handleChange
                      }
                      onSubmit={
                        handleSubmit
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </main>
    </CoachLayout>
  );
}

function FollowUpCard({
  followUp,
  selected,
  form,
  updating,
  onOpen,
  onClose,
  onChange,
  onSubmit,
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                {followUp.student_name ||
                  "Student"}
              </h2>

              <p className="mt-1 text-sm font-semibold text-amber-700">
                {followUp.improvement_area ||
                  "Improvement area not specified"}
              </p>
            </div>
          </div>

          <StatusBadge
            status={followUp.status}
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <Detail
          icon={ClipboardCheck}
          label="Required Action"
          value={
            followUp.action_required
          }
        />

        <Detail
          icon={Target}
          label="Next Goal"
          value={followUp.next_goal}
        />

        <Detail
          icon={CalendarDays}
          label="Due Date"
          value={formatDate(
            followUp.due_date,
          )}
        />

        {!selected ? (
          <button
            type="button"
            onClick={onOpen}
            className="mt-2 w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white transition hover:bg-blue-900"
          >
            Update Follow-Up
          </button>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-5 space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-4"
          >
            <div>
              <label
                htmlFor={`status-${followUp.follow_up_id}`}
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Follow-Up Status
              </label>

              <select
                id={`status-${followUp.follow_up_id}`}
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor={`outcome-${followUp.follow_up_id}`}
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Outcome or Update
              </label>

              <textarea
                id={`outcome-${followUp.follow_up_id}`}
                name="outcome"
                value={form.outcome}
                onChange={onChange}
                rows={4}
                placeholder="Describe the support provided, progress observed or final outcome."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating
                  ? "Saving..."
                  : "Save Update"}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={updating}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}) {
  const tones = {
    amber:
      "bg-amber-100 text-amber-700",
    blue:
      "bg-blue-100 text-blue-700",
    purple:
      "bg-purple-100 text-purple-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${tones[tone]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    open:
      "bg-amber-100 text-amber-800",
    in_progress:
      "bg-blue-100 text-blue-800",
    completed:
      "bg-emerald-100 text-emerald-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
        styles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {String(status || "open").replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-950">
        No follow-up needed
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-slate-600">
        There are currently no open
        coaching follow-ups requiring your
        attention.
      </p>
    </div>
  );
}

function PageMessage({
  message,
  error = false,
  onRetry,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
        className={`mx-auto max-w-3xl rounded-xl border p-6 ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        <p className="font-semibold">
          {message}
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={() => onRetry()}
            className="mt-4 rounded-lg bg-blue-950 px-4 py-2 font-semibold text-white"
          >
            Try Again
          </button>
        ) : null}
      </div>
    </main>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(
    new Date(`${value}T00:00:00Z`),
  );
}