import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { useFacilitatorAdvisoryUpdates } from "../../hooks/useAdvisoryConcerns";
import FacilitatorLayout from "../../layouts/FacilitatorLayout";

const statusLabels = {
  new: "Awaiting acknowledgement",
  acknowledged: "Acknowledged",
  in_progress: "Follow-up underway",
  addressed: "Addressed",
};

export default function FacilitatorAdvisoryUpdatesPage() {
  const {
    updates,
    updatesLoading,
    updatesFetching,
    updatesError,
    refreshUpdates,
  } = useFacilitatorAdvisoryUpdates();

  const [filter, setFilter] = useState("all");

  const visibleUpdates = updates.filter(
    (update) =>
      filter === "all" ||
      (filter === "unresolved"
        ? update.advisory_status !== "addressed"
        : update.advisory_status === filter),
  );

  return (
    <FacilitatorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Coordinated Student Support
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                Advisory Updates
              </h1>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                See advisory responses to concerns you recorded.
                These updates help you know whether follow-up has
                occurred without exposing private advisory conversations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshUpdates()}
              disabled={updatesFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={updatesFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          <section className="grid gap-4 sm:grid-cols-3">
            <Summary
              label="Awaiting Acknowledgement"
              value={
                updates.filter(
                  (item) => item.advisory_status === "new",
                ).length
              }
            />

            <Summary
              label="Follow-Up Underway"
              value={
                updates.filter((item) =>
                  ["acknowledged", "in_progress"].includes(
                    item.advisory_status,
                  ),
                ).length
              }
            />

            <Summary
              label="Addressed"
              value={
                updates.filter(
                  (item) => item.advisory_status === "addressed",
                ).length
              }
            />
          </section>

          <label className="block rounded-xl border border-slate-200 bg-white p-5">
            <span className="text-sm font-semibold text-slate-700">
              Show concerns
            </span>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All concerns</option>
              <option value="unresolved">Unresolved concerns</option>
              <option value="new">Awaiting acknowledgement</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">Follow-up underway</option>
              <option value="addressed">Addressed</option>
            </select>
          </label>

          <p className="text-sm leading-6 text-slate-500">
            Advisory responses do not automatically close your own
            follow-up actions. Continue updating those from Follow-Up Needed.
          </p>

          {updatesError && (
            <Message error>{updatesError.message}</Message>
          )}

          {updatesLoading ? (
            <Message>Loading advisory updates...</Message>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                {visibleUpdates.length}{" "}
                {visibleUpdates.length === 1 ? "concern" : "concerns"} found
              </p>

              <section
                aria-label="Advisory responses"
                className="space-y-5"
              >
                {visibleUpdates.map((update) => (
                  <UpdateCard
                    key={update.engagement_record_id}
                    update={update}
                  />
                ))}
              </section>

              {!visibleUpdates.length && !updatesError && (
                <Message>
                  No concerns match this filter. Concerns you mark as
                  requiring follow-up will appear here.
                </Message>
              )}
            </>
          )}
        </div>
      </main>
    </FacilitatorLayout>
  );
}

function UpdateCard({ update }) {
  const addressed = update.advisory_status === "addressed";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-blue-950">
            {update.student_name || "Student"}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {update.learning_experience_title}
            {update.session_title ? ` · ${update.session_title}` : ""}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Recorded {formatDate(update.recorded_at)}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            addressed
              ? "bg-green-100 text-green-800"
              : update.advisory_status === "new"
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
          }`}
        >
          {statusLabels[update.advisory_status] || "Not available"}
        </span>
      </div>

      <section className="mt-5">
        <h3 className="font-semibold text-slate-900">
          Your Recorded Concern
        </h3>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
          {update.concern || "The concern text is no longer recorded."}
        </p>
      </section>

      {!update.has_active_advisory_assignment && !addressed && (
        <Message>
          No active advisory assignment is available for this student.
          Contact the Advisory Department to coordinate follow-up.
        </Message>
      )}

      {update.follow_up_required === false && (
        <p className="mt-4 text-sm text-slate-500">
          You no longer mark this engagement record as requiring
          follow-up. Its existing advisory response remains visible.
        </p>
      )}

      <section className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="font-bold text-blue-950">
          Shared Advisory Update
        </h3>

        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
          {update.shared_update ||
            (update.advisory_status === "new"
              ? "No advisory response recorded yet."
              : "Acknowledged. No additional shared update recorded yet.")}
        </p>

        {update.acknowledged_at && (
          <p className="mt-4 text-xs leading-6 text-slate-600">
            Acknowledged by{" "}
            {update.acknowledged_by_name || "Advisor"} ·{" "}
            {formatDate(update.acknowledged_at)}
          </p>
        )}

        {update.addressed_at && (
          <p className="mt-2 text-xs leading-6 text-slate-600">
            Addressed by {update.addressed_by_name || "Advisor"} ·{" "}
            {formatDate(update.addressed_at)}
          </p>
        )}

        {update.response_updated_at && (
          <p className="mt-2 text-xs text-slate-500">
            Last updated {formatDate(update.response_updated_at)}
          </p>
        )}
      </section>
    </article>
  );
}

function Summary({ label, value }) {
  return (
    <article className="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <p className="font-semibold text-blue-800">{label}</p>
      <p className="mt-3 text-3xl font-bold text-blue-950">{value}</p>
    </article>
  );
}

function Message({ children, error = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-blue-200 bg-blue-50 text-blue-800"
      }`}
    >
      {children}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}