import { useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useAdvisoryConcerns } from "../../hooks/useAdvisoryConcerns";
import MentoringLayout from "../../layouts/MentoringLayout";

const inputClasses =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

export default function StudentConcernsPage() {
  const { role } = useAuth();
  const department = role === "mentor_department";

  const {
    concerns,
    concernsLoading,
    concernsFetching,
    concernsError,
    refreshConcerns,
    updateConcern,
    updatingConcern,
    updateConcernError,
    resetUpdateConcern,
  } = useAdvisoryConcerns();

  const [filter, setFilter] = useState("unresolved");
  const [search, setSearch] = useState("");
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [message, setMessage] = useState("");

  const searchText = search.trim().toLowerCase();

  const visibleConcerns = concerns.filter((concern) => {
    const matchesStatus =
      filter === "all" ||
      (filter === "unresolved"
        ? concern.status !== "addressed"
        : filter === "unassigned"
          ? !concern.has_active_advisory_assignment
          : concern.status === filter);

    const searchable = [
      concern.student_name,
      concern.facilitator_name,
      concern.learning_experience_title,
      concern.couple_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      matchesStatus &&
      (!searchText || searchable.includes(searchText))
    );
  });

  function openResponse(concern) {
    resetUpdateConcern();
    setMessage("");
    setSelectedConcern(concern);
  }

  function closeResponse() {
    if (updatingConcern) return;
    setSelectedConcern(null);
    resetUpdateConcern();
  }

  async function saveResponse(values) {
    const result = await updateConcern(values);
    setSelectedConcern(null);
    setMessage(result.message || "The concern was updated.");
  }

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Coordinated Student Support
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                Student Concerns
              </h1>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                {department
                  ? "Monitor facilitator concerns, advisory responses and students needing an advisor assignment."
                  : "Review concerns recorded by facilitators, follow up with your assigned students and share a relevant progress update."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshConcerns()}
              disabled={concernsFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={concernsFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {message && <Message success>{message}</Message>}

          <section className="grid gap-4 sm:grid-cols-3">
            <Summary
              label="New"
              value={concerns.filter((item) => item.status === "new").length}
            />
            <Summary
              label="Follow-Up Underway"
              value={
                concerns.filter((item) =>
                  ["acknowledged", "in_progress"].includes(item.status),
                ).length
              }
            />
            <Summary
              label="Addressed"
              value={
                concerns.filter((item) => item.status === "addressed").length
              }
            />
          </section>

          <p className="text-sm leading-6 text-slate-500">
            Totals cover all loaded concerns. Advisory responses do not
            close the facilitator’s separate follow-up action.
          </p>

          <section
            aria-label="Concern filters"
            className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2"
          >
            <Field label="Status">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className={inputClasses}
              >
                <option value="unresolved">Unresolved concerns</option>
                <option value="new">New</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">Follow-up underway</option>
                <option value="addressed">Addressed</option>
                {department && (
                  <option value="unassigned">
                    No active advisory assignment
                  </option>
                )}
                <option value="all">All concerns</option>
              </select>
            </Field>

            <Field label="Search student, facilitator or learning experience">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={inputClasses}
                placeholder="Enter a name"
              />
            </Field>
          </section>

          {concernsError && (
            <Message error>{concernsError.message}</Message>
          )}

          {concernsLoading ? (
            <Message>Loading student concerns...</Message>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                {visibleConcerns.length}{" "}
                {visibleConcerns.length === 1 ? "concern" : "concerns"} found
              </p>

              <section aria-label="Student concerns" className="space-y-5">
                {visibleConcerns.map((concern) => (
                  <ConcernCard
                    key={concern.engagement_record_id}
                    concern={concern}
                    canRespond={
                      !department &&
                      concern.status !== "addressed" &&
                      concern.has_active_advisory_assignment
                    }
                    onRespond={() => openResponse(concern)}
                  />
                ))}
              </section>

              {!visibleConcerns.length && !concernsError && (
                <Message>No concerns match the selected filters.</Message>
              )}
            </>
          )}
        </div>
      </main>

      {selectedConcern && (
        <ResponseModal
          key={selectedConcern.engagement_record_id}
          concern={selectedConcern}
          saving={updatingConcern}
          error={updateConcernError}
          onClose={closeResponse}
          onSave={saveResponse}
        />
      )}
    </MentoringLayout>
  );
}

function ConcernCard({ concern, canRespond, onRespond }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-blue-950">
            {concern.student_name || "Student"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {concern.learning_experience_title}
            {concern.session_title ? ` · ${concern.session_title}` : ""}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            concern.status === "addressed"
              ? "bg-green-100 text-green-800"
              : concern.status === "new"
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
          }`}
        >
          {formatStatus(concern.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Detail label="Recorded by" value={concern.facilitator_name} />
        <Detail label="Recorded" value={formatDate(concern.recorded_at)} />
        {concern.couple_name && (
          <Detail label="Advisory couple" value={concern.couple_name} />
        )}
      </div>

      <Text title="Facilitator Concern" value={concern.concern} />
      <Text title="Support Already Provided" value={concern.support_provided} />

      {concern.follow_up_required === false && (
        <Message>
          The facilitator no longer marks this record as requiring
          follow-up. The existing advisory response remains visible.
        </Message>
      )}

      {!concern.has_active_advisory_assignment && (
        <Message>
          No active advisory assignment is available. The Advisory
          Department needs to arrange responsibility for follow-up.
        </Message>
      )}

      <section className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="font-bold text-blue-950">Advisory Response</h3>

        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
          {concern.shared_update || "No shared update recorded yet."}
        </p>

        {concern.acknowledged_at && (
          <p className="mt-3 text-xs leading-6 text-slate-600">
            Acknowledged by {concern.acknowledged_by_name || "Advisor"} ·{" "}
            {formatDate(concern.acknowledged_at)}
          </p>
        )}

        {concern.addressed_at && (
          <p className="mt-2 text-xs leading-6 text-slate-600">
            Addressed by {concern.addressed_by_name || "Advisor"} ·{" "}
            {formatDate(concern.addressed_at)}
          </p>
        )}
      </section>

      {canRespond && (
        <button
          type="button"
          onClick={onRespond}
          className="mt-5 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white"
        >
          {concern.status === "new"
            ? "Acknowledge / Respond"
            : "Update Response"}
        </button>
      )}
    </article>
  );
}

function ResponseModal({ concern, saving, error, onClose, onSave }) {
  const dialogRef = useRef(null);

  const [status, setStatus] = useState(
    concern.status === "new" ? "acknowledged" : concern.status,
  );
  const [sharedUpdate, setSharedUpdate] = useState(
    concern.shared_update || "",
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;

    try {
      await onSave({
        engagementRecordId: concern.engagement_record_id,
        status,
        sharedUpdate,
      });
    } catch {
      // The hook exposes the error below.
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="concern-response-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
        <div>
          <h2
            id="concern-response-title"
            className="text-xl font-bold text-blue-950"
          >
            Update Advisory Response
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {concern.student_name}
          </p>
        </div>

        <button
          type="button"
          autoFocus
          disabled={saving}
          onClick={onClose}
          aria-label="Close response form"
          className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-60"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </header>

      <form onSubmit={submit} className="p-6">
        <fieldset disabled={saving} className="space-y-5">
          <Text title="Concern" value={concern.concern} />

          <Field label="Advisory status">
            <select
              required
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={inputClasses}
            >
              {concern.status !== "in_progress" && (
                <option value="acknowledged">Acknowledged</option>
              )}
              <option value="in_progress">Follow-up underway</option>
              <option value="addressed">Addressed</option>
            </select>
          </Field>

          <Field
            label={
              status === "acknowledged"
                ? "Shared update — optional"
                : "Shared update — required"
            }
          >
            <textarea
              required={status !== "acknowledged"}
              value={sharedUpdate}
              onChange={(event) => setSharedUpdate(event.target.value)}
              maxLength={3000}
              rows={5}
              className={inputClasses}
              placeholder="For example: We spoke with the student and agreed on practical next steps. We will check progress next week."
            />
          </Field>

          <p className="text-sm leading-6 text-slate-600">
            This update is shared with the originating facilitator and
            the Advisory Department. Include only relevant follow-up
            information. Record private conversation details in the
            advisory check-in report.
          </p>

          {status === "addressed" && (
            <p className="text-sm leading-6 text-slate-600">
              Marking this addressed closes the advisory response.
              It does not close the facilitator’s own action.
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white"
            >
              {saving ? "Saving..." : "Save Response"}
            </button>
          </div>
        </fieldset>

        {error && <Message error>{error.message}</Message>}
      </form>
    </dialog>
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm text-slate-700">
        {value || "Not available"}
      </p>
    </div>
  );
}

function Text({ title, value }) {
  if (!value) return null;

  return (
    <section className="mt-5">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
        {value}
      </p>
    </section>
  );
}

function Message({ children, error = false, success = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : success
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-blue-200 bg-blue-50 text-blue-800"
      }`}
    >
      {children}
    </div>
  );
}

function formatStatus(value) {
  const labels = {
    new: "New",
    acknowledged: "Acknowledged",
    in_progress: "Follow-up underway",
    addressed: "Addressed",
  };

  return labels[value] || "Not available";
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