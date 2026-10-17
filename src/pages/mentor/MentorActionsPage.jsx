import { useEffect, useRef, useState } from "react";
import { Plus, RefreshCw, X } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useAdvisoryFollowUps } from "../../hooks/useAdvisoryFollowUps";
import { useMentorDashboard } from "../../hooks/useMentorDashboard";
import MentoringLayout from "../../layouts/MentoringLayout";

const inputClasses =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

const activeStatuses = ["open", "in_progress", "waiting"];

export default function MentorActionsPage() {
  const { profile } = useAuth();
  const dashboard = useMentorDashboard();
  const followUps = useAdvisoryFollowUps();

  const [filter, setFilter] = useState("active");
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState("");

  const students = dashboard.mentorDashboard?.mentees || [];
  const couple = dashboard.mentorDashboard?.advisoryCouple;
  const actions = followUps.actions;

  const visibleActions = actions.filter((action) => {
    if (filter === "all") return true;
    if (filter === "active") return activeStatuses.includes(action.status);
    if (filter === "overdue") return action.is_overdue;
    return action.status === filter;
  });

  function openCreate() {
    followUps.resetCreateAction();
    setMessage("");
    setModal({ type: "create" });
  }

  function openUpdate(action) {
    followUps.resetUpdateAction();
    setMessage("");
    setModal({ type: "update", action });
  }

  const saving =
    followUps.creatingAction || followUps.updatingAction;

  function closeModal() {
    if (!saving) setModal(null);
  }

  async function saveCreate(values) {
    const result = await followUps.createAction(values);
    setModal(null);
    setMessage(result.message || "The action was created.");
  }

  async function saveUpdate(values) {
    const result = await followUps.updateAction(values);
    setModal(null);
    setMessage(result.message || "The action was updated.");
  }

  async function refresh() {
    await Promise.allSettled([
      followUps.refreshActions(),
      dashboard.refreshMentorDashboard(),
    ]);
  }

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Advisory Follow-Up
              </p>
              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                My Actions
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Agree on practical next steps, assign an advisor and
                follow each action through to completion. Both spouses
                can update shared actions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refresh}
                disabled={
                  followUps.actionsFetching ||
                  dashboard.mentorDashboardFetching
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold disabled:opacity-60"
              >
                <RefreshCw
                  size={18}
                  aria-hidden="true"
                  className={
                    followUps.actionsFetching ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>
              <button
                type="button"
                onClick={openCreate}
                disabled={!students.length}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white disabled:opacity-60"
              >
                <Plus size={18} aria-hidden="true" />
                Create Action
              </button>
            </div>
          </header>

          {message && <Message success>{message}</Message>}

          <section className="grid gap-4 sm:grid-cols-3">
            <Summary
              label="Active Actions"
              value={
                actions.filter((action) =>
                  activeStatuses.includes(action.status),
                ).length
              }
            />
            <Summary
              label="Overdue"
              value={actions.filter((action) => action.is_overdue).length}
            />
            <Summary
              label="Completed"
              value={
                actions.filter((action) => action.status === "completed")
                  .length
              }
            />
          </section>

          {dashboard.mentorDashboardError && (
            <Message error>
              Student assignments could not be refreshed:{" "}
              {dashboard.mentorDashboardError.message}
            </Message>
          )}

          <Field label="Show actions">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className={inputClasses}
            >
              <option value="active">Active actions</option>
              <option value="overdue">Overdue actions</option>
              <option value="completed">Completed actions</option>
              <option value="cancelled">Cancelled actions</option>
              <option value="all">All actions</option>
            </select>
          </Field>

          {followUps.actionsError && (
            <Message error>{followUps.actionsError.message}</Message>
          )}

          {followUps.actionsLoading ? (
            <Message>Loading follow-up actions...</Message>
          ) : visibleActions.length ? (
            <section className="space-y-4" aria-label="Follow-up actions">
              {visibleActions.map((action) => (
                <article
                  key={action.id}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-700">
                        {action.student_name || "Student"}
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-blue-950">
                        {action.title}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{formatLabel(action.status)}</Badge>
                      <Badge>{formatLabel(action.priority)} priority</Badge>
                      {action.is_overdue && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Detail label="Owner" value={action.assigned_to_name} />
                    <Detail label="Due — Nigeria time" value={formatDate(action.due_at)} />
                    <Detail label="Action type" value={formatLabel(action.action_type)} />
                    <Detail label="Created by" value={action.created_by_name} />
                  </div>

                  {action.report_id && (
                    <p className="mt-4 text-sm text-slate-500">
                      Linked report: {formatLabel(action.report_type)}
                      {action.programme_week
                        ? ` · Week ${action.programme_week}`
                        : ""}
                    </p>
                  )}

                  <Text title="Action details" value={action.description} />
                  <Text title="Progress / outcome" value={action.outcome} />
                  <Text title="Additional notes" value={action.completion_notes} />

                  {action.completed_at && (
                    <p className="mt-4 text-sm text-slate-500">
                      Completed {formatDate(action.completed_at)}
                    </p>
                  )}

                  {action.can_update ? (
                    <button
                      type="button"
                      onClick={() => openUpdate(action)}
                      className="mt-5 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white"
                    >
                      Update Progress
                    </button>
                  ) : (
                    <p className="mt-5 text-sm text-slate-500">
                      {activeStatuses.includes(action.status)
                        ? "This assignment is no longer active. Contact the Advisory Department for further action."
                        : "This action is closed."}
                    </p>
                  )}
                </article>
              ))}
            </section>
          ) : !followUps.actionsError ? (
            <Message>No actions match this filter.</Message>
          ) : null}
        </div>
      </main>

      {modal?.type === "create" && (
        <CreateModal
          students={students}
          couple={couple}
          profile={profile}
          saving={saving}
          error={followUps.createActionError}
          onSave={saveCreate}
          onClose={closeModal}
        />
      )}

      {modal?.type === "update" && (
        <UpdateModal
          action={modal.action}
          saving={saving}
          error={followUps.updateActionError}
          onSave={saveUpdate}
          onClose={closeModal}
        />
      )}
    </MentoringLayout>
  );
}

function CreateModal({
  students,
  couple,
  profile,
  saving,
  error,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState({
    assignmentId: "",
    title: "",
    assignedTo: profile?.id || "",
    dueAt: "",
    description: "",
    priority: "normal",
    actionType: "support_follow_up",
  });

  const student = students.find(
    (item) => item.assignment_id === form.assignmentId,
  );

  const owners =
    student?.advisory_couple_id &&
    student.advisory_couple_id === couple?.id
      ? couple.members || []
      : [{ profile_id: profile?.id, full_name: profile?.full_name || "You" }];

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "assignmentId"
        ? { assignedTo: profile?.id || "" }
        : {}),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    try {
      await onSave(form);
    } catch {
      // The hook supplies the error displayed below.
    }
  }

  return (
    <Modal title="Create Follow-Up Action" onClose={onClose} saving={saving}>
      <form onSubmit={submit}>
        <fieldset disabled={saving} className="space-y-5">
          <Field label="Student">
            <select
              required
              name="assignmentId"
              value={form.assignmentId}
              onChange={change}
              className={inputClasses}
            >
              <option value="">Select a student</option>
              {students.map((item) => (
                <option key={item.assignment_id} value={item.assignment_id}>
                  {item.full_name || item.preferred_name || "Student"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Action title">
            <input
              required
              name="title"
              value={form.title}
              onChange={change}
              maxLength={200}
              className={inputClasses}
              placeholder="For example: Check whether accommodation concerns have improved"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Responsible advisor">
              <select
                required
                name="assignedTo"
                value={form.assignedTo}
                onChange={change}
                className={inputClasses}
              >
                {owners.map((owner) => (
                  <option key={owner.profile_id} value={owner.profile_id}>
                    {owner.full_name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Due date and time — Nigeria (WAT)">
              <input
                required
                type="datetime-local"
                name="dueAt"
                value={form.dueAt}
                onChange={change}
                className={inputClasses}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Priority">
              <select name="priority" value={form.priority} onChange={change} className={inputClasses}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>

            <Field label="Action type">
              <select name="actionType" value={form.actionType} onChange={change} className={inputClasses}>
                <option value="support_follow_up">Support follow-up</option>
                <option value="check_in">Check-in</option>
                <option value="record_feedback">Record feedback</option>
                <option value="conduct_follow_up">Conduct follow-up</option>
                <option value="student_attention">Student attention</option>
                <option value="report_review">Report review</option>
                <option value="clarification">Clarification</option>
                <option value="general">General</option>
              </select>
            </Field>
          </div>

          <Field label="Action details — optional">
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              maxLength={5000}
              rows={4}
              className={inputClasses}
              placeholder="Describe the agreed next step and relevant context."
            />
          </Field>

          <p className="text-sm leading-6 text-slate-500">
            This assigns an action within Advising. It does not send a
            referral to another department.
          </p>

          <FormButtons saving={saving} onClose={onClose} label="Create Action" />
        </fieldset>
        {error && <Message error>{error.message}</Message>}
      </form>
    </Modal>
  );
}

function UpdateModal({ action, saving, error, onSave, onClose }) {
  const [form, setForm] = useState({
    actionId: action.id,
    status: action.status,
    outcome: action.outcome || "",
    completionNotes: action.completion_notes || "",
  });

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    try {
      await onSave(form);
    } catch {
      // The hook supplies the error displayed below.
    }
  }

  return (
    <Modal title="Update Follow-Up Action" onClose={onClose} saving={saving}>
      <p className="mb-5 font-semibold text-blue-950">{action.title}</p>

      <form onSubmit={submit}>
        <fieldset disabled={saving} className="space-y-5">
          <Field label="Status">
            <select required name="status" value={form.status} onChange={change} className={inputClasses}>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>

          <Field
            label={
              form.status === "completed"
                ? "Outcome — required to complete"
                : "Progress / outcome — optional"
            }
          >
            <textarea
              required={form.status === "completed"}
              name="outcome"
              value={form.outcome}
              onChange={change}
              maxLength={5000}
              rows={4}
              className={inputClasses}
            />
          </Field>

          <Field
            label={
              form.status === "cancelled"
                ? "Reason for cancellation — required"
                : "Additional notes — optional"
            }
          >
            <textarea
              required={form.status === "cancelled"}
              name="completionNotes"
              value={form.completionNotes}
              onChange={change}
              maxLength={5000}
              rows={4}
              className={inputClasses}
            />
          </Field>

          <p className="text-sm leading-6 text-slate-500">
            Completed and cancelled actions cannot be reopened here.
            Saving replaces the current progress text; it does not
            create a separate update history.
          </p>

          <FormButtons saving={saving} onClose={onClose} label="Save Update" />
        </fieldset>
        {error && <Message error>{error.message}</Message>}
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose, saving }) {
  const dialogRef = useRef(null);

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

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="action-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
        <h2 id="action-modal-title" className="text-xl font-bold text-blue-950">
          {title}
        </h2>
        <button
          type="button"
          autoFocus
          disabled={saving}
          onClick={onClose}
          aria-label="Close action form"
          className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-60"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      <div className="p-6">{children}</div>
    </dialog>
  );
}

function FormButtons({ saving, onClose, label }) {
  return (
    <div className="flex justify-end gap-3 pt-3">
      <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold">
        Cancel
      </button>
      <button type="submit" className="rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white">
        {saving ? "Saving..." : label}
      </button>
    </div>
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

function Summary({ label, value }) {
  return (
    <article className="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <p className="font-semibold text-blue-800">{label}</p>
      <p className="mt-3 text-3xl font-bold text-blue-950">{value}</p>
    </article>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-slate-800">{value || "Not available"}</p>
    </div>
  );
}

function Text({ title, value }) {
  if (!value) return null;
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
        {value}
      </p>
    </section>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
      {children}
    </span>
  );
}

function Message({ children, error = false, success = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-xl border p-4 text-sm leading-6 ${
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

function formatLabel(value) {
  if (!value) return "Not available";
  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}