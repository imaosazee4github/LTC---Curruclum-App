import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import MentoringLayout from "../../layouts/MentoringLayout";

const activeStatuses = ["open", "in_progress", "waiting"];

const inputClasses =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

async function getDepartmentFollowUps() {
  const { data, error } = await supabase.rpc(
    "get_advisory_department_follow_ups",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Follow-up actions could not be loaded.");
  }

  return Array.isArray(data.actions) ? data.actions : [];
}

export default function MentorDepartmentFollowUpsPage() {
  const { profile, role } = useAuth();

  const [statusFilter, setStatusFilter] = useState("active");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");

  const actionsQuery = useQuery({
    queryKey: ["advisory-department-follow-ups", profile?.id],
    queryFn: getDepartmentFollowUps,
    enabled:
      Boolean(profile?.id) && role === "mentor_department",
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const actions = actionsQuery.data || [];
  const searchText = search.trim().toLowerCase();

  const visibleActions = actions.filter((action) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active"
        ? activeStatuses.includes(action.status)
        : statusFilter === "overdue"
          ? action.is_overdue
          : action.status === statusFilter);

    const matchesPriority =
      !priorityFilter || action.priority === priorityFilter;

    const searchableText = [
      action.student_name,
      action.title,
      action.assigned_to_name,
      action.couple_name,
      action.advisor_names,
      action.individual_advisor_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      matchesStatus &&
      matchesPriority &&
      (!searchText || searchableText.includes(searchText))
    );
  });

  const activeCount = actions.filter((action) =>
    activeStatuses.includes(action.status),
  ).length;

  const overdueCount = actions.filter(
    (action) => action.is_overdue,
  ).length;

  const completedCount = actions.filter(
    (action) => action.status === "completed",
  ).length;

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Advisory Operations
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                Follow-Up Actions
              </h1>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Monitor actions across advisory couples and earlier
                individual assignments. Review outstanding needs,
                responsible advisors and completion outcomes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => actionsQuery.refetch()}
              disabled={actionsQuery.isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={actionsQuery.isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          <section className="grid gap-4 sm:grid-cols-3">
            <Summary label="Active Actions" value={activeCount} />
            <Summary label="Overdue" value={overdueCount} />
            <Summary label="Completed" value={completedCount} />
          </section>

          <p className="text-sm leading-6 text-slate-500">
            Totals cover all loaded actions. The filters below apply
            to the list. Advisors update progress from My Actions.
          </p>

          <section
            aria-label="Follow-up filters"
            className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-3"
          >
            <Field label="Status">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={inputClasses}
              >
                <option value="active">Active actions</option>
                <option value="overdue">Overdue actions</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="waiting">Waiting</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="all">All actions</option>
              </select>
            </Field>

            <Field label="Priority">
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className={inputClasses}
              >
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>

            <Field label="Search student, couple or owner">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Enter a name or action title"
                className={inputClasses}
              />
            </Field>
          </section>

          {actionsQuery.isError && (
            <Message error>{actionsQuery.error.message}</Message>
          )}

          {actionsQuery.isLoading ? (
            <Message>Loading follow-up actions...</Message>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                {visibleActions.length}{" "}
                {visibleActions.length === 1 ? "action" : "actions"} found
              </p>

              {visibleActions.length ? (
                <section
                  aria-label="Department follow-up overview"
                  className="space-y-4"
                >
                  {visibleActions.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                </section>
              ) : !actionsQuery.isError ? (
                <Message>No actions match the selected filters.</Message>
              ) : null}
            </>
          )}
        </div>
      </main>
    </MentoringLayout>
  );
}

function ActionCard({ action }) {
  const active = activeStatuses.includes(action.status);
  const coupleAssignment = Boolean(action.advisory_couple_id);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
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

      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">
          {coupleAssignment
            ? action.advisor_names ||
              action.couple_name ||
              "Couple details unavailable"
            : action.individual_advisor_name ||
              "Advisor details unavailable"}
        </p>

        {coupleAssignment && action.couple_name && (
          <p className="mt-1 text-sm text-slate-500">
            {action.couple_name}
          </p>
        )}

        <p className="mt-2 text-xs text-slate-500">
          {coupleAssignment
            ? "Couple assignment"
            : "Earlier individual assignment"}
        </p>
      </div>

      <div className="mt-5 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Responsible advisor" value={action.assigned_to_name} />
        <Detail label="Due — Nigeria time" value={formatDate(action.due_at)} />
        <Detail label="Action type" value={formatLabel(action.action_type)} />
        <Detail label="Assignment status" value={formatLabel(action.assignment_status)} />
        <Detail label="Created by" value={action.created_by_name} />
        <Detail label="Created" value={formatDate(action.created_at)} />
        <Detail label="Last updated" value={formatDate(action.updated_at)} />

        {action.completed_at && (
          <Detail label="Completed" value={formatDate(action.completed_at)} />
        )}
      </div>

      {action.report_id && (
        <p className="mt-5 text-sm text-slate-500">
          Linked report: {formatLabel(action.report_type)}
          {action.programme_week
            ? ` · Week ${action.programme_week}`
            : ""}
        </p>
      )}

      <Text title="Action Details" value={action.description} />
      <Text title="Progress / Outcome" value={action.outcome} />
      <Text title="Additional Notes" value={action.completion_notes} />

      {active && action.assignment_status !== "active" && (
        <Message>
          This action remains unresolved, but its student assignment
          is no longer active. Department coordination is needed.
        </Message>
      )}

      {active && action.owner_account_status !== "active" && (
        <Message>
          The responsible advisor’s account is not active. Review
          who should take responsibility for this action.
        </Message>
      )}

      {active && coupleAssignment && action.couple_status !== "active" && (
        <Message>
          The advisory couple is inactive. Review arrangements for
          continuing this follow-up.
        </Message>
      )}
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
      <p className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-slate-800">{value || "Not available"}</p>
    </div>
  );
}

function Text({ title, value }) {
  if (!value) return null;

  return (
    <section className="mt-5">
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

function formatLabel(value) {
  if (!value) return "Not available";

  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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