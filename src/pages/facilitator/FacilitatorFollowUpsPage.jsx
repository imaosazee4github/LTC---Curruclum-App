import {
  AlertCircle,
  CheckCircle2,
  ListChecks,
  RefreshCw,
  Save,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useFacilitatorDashboard,
} from "../../hooks/useFacilitatorDashboard";

import FacilitatorLayout from "../../layouts/FacilitatorLayout";

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function FacilitatorFollowUpsPage() {
  const {
    facilitatorDashboard,
    facilitatorDashboardLoading,
    facilitatorDashboardFetching,
    facilitatorDashboardError,
    refreshFacilitatorDashboard,
    updateFollowUp,
    updatingFollowUp,
  } = useFacilitatorDashboard();

  const [filter, setFilter] =
    useState("active");

  const [pageMessage, setPageMessage] =
    useState(null);

  if (facilitatorDashboardLoading) {
    return (
      <FacilitatorLayout>
        <PageState message="Loading follow-up records..." />
      </FacilitatorLayout>
    );
  }

  if (facilitatorDashboardError) {
    return (
      <FacilitatorLayout>
        <PageState
          error
          message={
            facilitatorDashboardError
              .message ||
            "Unable to load follow-up records."
          }
        />
      </FacilitatorLayout>
    );
  }

  const followUps =
    facilitatorDashboard?.followUps ||
    [];

  const visibleFollowUps =
    followUps.filter((followUp) => {
      if (filter === "all") {
        return true;
      }

      if (filter === "active") {
        return [
          "open",
          "in_progress",
        ].includes(followUp.status);
      }

      return followUp.status === filter;
    });

  const openCount =
    followUps.filter(
      (followUp) =>
        followUp.status === "open",
    ).length;

  const inProgressCount =
    followUps.filter(
      (followUp) =>
        followUp.status ===
        "in_progress",
    ).length;

  const completedCount =
    followUps.filter(
      (followUp) =>
        followUp.status ===
        "completed",
    ).length;

  async function handleUpdate(
    values,
  ) {
    setPageMessage(null);

    try {
      await updateFollowUp(values);

      setPageMessage({
        type: "success",
        text: "Follow-up record updated successfully.",
      });
    } catch (error) {
      setPageMessage({
        type: "error",
        text:
          error.message ||
          "Unable to update the follow-up record.",
      });

      throw error;
    }
  }

  return (
    <FacilitatorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Student Support
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Follow-Up Needed
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review student concerns,
                record support actions and
                track each follow-up through
                completion.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshFacilitatorDashboard()
              }
              disabled={
                facilitatorDashboardFetching
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  facilitatorDashboardFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              {facilitatorDashboardFetching
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Follow-Ups"
              value={followUps.length}
              tone="blue"
            />

            <SummaryCard
              label="Open"
              value={openCount}
              tone="amber"
            />

            <SummaryCard
              label="In Progress"
              value={inProgressCount}
              tone="purple"
            />

            <SummaryCard
              label="Completed"
              value={completedCount}
              tone="green"
            />
          </section>

          {pageMessage ? (
            <Message
              type={pageMessage.type}
              text={pageMessage.text}
            />
          ) : null}

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Student Follow-Ups
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    visibleFollowUps.length
                  }{" "}
                  record
                  {visibleFollowUps.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  displayed
                </p>
              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value,
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="active">
                  Active
                </option>

                <option value="all">
                  All Follow-Ups
                </option>

                <option value="open">
                  Open
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            {visibleFollowUps.length >
            0 ? (
              <div className="grid gap-5 p-5 xl:grid-cols-2">
                {visibleFollowUps.map(
                  (followUp) => (
                    <FollowUpEditor
                      key={
                        followUp.follow_up_id ||
                        followUp.id
                      }
                      followUp={followUp}
                      onUpdate={handleUpdate}
                      updating={
                        updatingFollowUp
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                hasRecords={
                  followUps.length > 0
                }
              />
            )}
          </section>
        </div>
      </main>
    </FacilitatorLayout>
  );
}

function FollowUpEditor({
  followUp,
  onUpdate,
  updating,
}) {
  const [form, setForm] =
    useState({
      status:
        followUp.status || "open",

      supportRequired:
        followUp.support_required ||
        "",

      actionRequired:
        followUp.action_required ||
        "",

      dueDate:
        followUp.due_date || "",

      outcome:
        followUp.outcome || "",
    });

  const [localError, setLocalError] =
    useState(null);

  const followUpId =
    followUp.follow_up_id ||
    followUp.id;

  function updateField(
    field,
    value,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError(null);

    if (
      form.status === "completed" &&
      !form.outcome.trim()
    ) {
      setLocalError(
        "Enter the follow-up outcome before marking it completed.",
      );

      return;
    }

    try {
      await onUpdate({
        followUpId,
        ...form,
      });
    } catch {
      setLocalError(
        "The follow-up could not be updated.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950">
            {followUp.student_name ||
              "Student"}
          </h3>

          <p className="mt-1 text-sm font-semibold text-blue-700">
            {followUp.experience_title ||
              "Learning experience"}
          </p>

          {followUp.session_title ? (
            <p className="mt-1 text-sm text-slate-500">
              {followUp.session_title}
            </p>
          ) : null}
        </div>

        <StatusBadge
          status={form.status}
        />
      </div>

      <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Concern
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {followUp.concern ||
            "No concern was recorded."}
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FormField
          label="Status"
          required
        >
          <select
            required
            value={form.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="open">
              Open
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </FormField>

        <FormField label="Due Date">
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) =>
              updateField(
                "dueDate",
                event.target.value,
              )
            }
            className={inputClass}
          />
        </FormField>

        <TextAreaField
          label="Support Required"
          value={
            form.supportRequired
          }
          onChange={(value) =>
            updateField(
              "supportRequired",
              value,
            )
          }
          placeholder="Describe the support the student needs."
        />

        <TextAreaField
          label="Required Action"
          value={
            form.actionRequired
          }
          onChange={(value) =>
            updateField(
              "actionRequired",
              value,
            )
          }
          placeholder="Describe the action that should be completed."
        />

        <div className="md:col-span-2">
          <TextAreaField
            label="Outcome"
            required={
              form.status ===
              "completed"
            }
            value={form.outcome}
            onChange={(value) =>
              updateField(
                "outcome",
                value,
              )
            }
            placeholder="Record the result of the follow-up."
          />
        </div>
      </div>

      {localError ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          {localError}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={updating}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {updating
            ? "Saving..."
            : "Update Follow-Up"}
        </button>
      </div>
    </form>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}) {
  const tones = {
    blue:
      "bg-blue-100 text-blue-700",
    amber:
      "bg-amber-100 text-amber-700",
    purple:
      "bg-purple-100 text-purple-700",
    green:
      "bg-emerald-100 text-emerald-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${tones[tone]}`}
        >
          <ListChecks className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}) {
  const styles = {
    open:
      "bg-amber-100 text-amber-700",

    in_progress:
      "bg-blue-100 text-blue-700",

    completed:
      "bg-emerald-100 text-emerald-700",

    cancelled:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] ||
        styles.open
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      {required ? (
        <span className="ml-1 text-red-600">
          *
        </span>
      ) : null}

      {children}
    </label>
  );
}

function TextAreaField({
  label,
  required = false,
  value,
  onChange,
  placeholder,
}) {
  return (
    <FormField
      label={label}
      required={required}
    >
      <textarea
        required={required}
        rows={3}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />
    </FormField>
  );
}

function Message({
  type,
  text,
}) {
  const error = type === "error";

  return (
    <div
      className={`mt-6 flex items-start gap-3 rounded-lg border p-4 text-sm font-medium ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ? (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      {text}
    </div>
  );
}

function EmptyState({
  hasRecords,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <ListChecks className="mx-auto h-12 w-12 text-slate-300" />

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {hasRecords
          ? "No matching follow-ups"
          : "No follow-up needed"}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {hasRecords
          ? "There are no follow-up records matching the selected status."
          : "Student concerns marked for follow-up will appear here after engagement is recorded."}
      </p>
    </div>
  );
}

function PageState({
  message,
  error = false,
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
        {message}
      </div>
    </main>
  );
}

function formatLabel(value) {
  if (!value) {
    return "Not specified";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}