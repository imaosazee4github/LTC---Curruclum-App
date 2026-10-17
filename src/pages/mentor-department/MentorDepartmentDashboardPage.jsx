import { RefreshCw } from "lucide-react";

import { useAdvisoryCouples } from "../../hooks/useAdvisoryCouples";
import { useMentorDepartment } from "../../hooks/useMentorDepartment";
import MentoringLayout from "../../layouts/MentoringLayout";

export default function MentorDepartmentDashboardPage() {
  const {
    mentorDepartmentDashboard: dashboard,
    mentorDepartmentLoading: loading,
    mentorDepartmentFetching: fetching,
    mentorDepartmentError: error,
    refreshMentorDepartmentDashboard: refreshDashboard,
  } = useMentorDepartment();

  const {
    couples,
    loading: couplesLoading,
    fetching: couplesFetching,
    error: couplesError,
    refresh: refreshCouples,
  } = useAdvisoryCouples();

  const summary = dashboard?.summary || {};
  const reports = dashboard?.recentReports || [];
  const refreshing = fetching || couplesFetching;

  async function refreshAll() {
    await Promise.allSettled([
      refreshDashboard(),
      refreshCouples(),
    ]);
  }

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-7">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Advisory Operations
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                Advisory Department Dashboard
              </h1>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Coordinate advisory couples, student assignments,
                report reviews and follow-up.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshAll}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {loading && !dashboard ? (
            <Message>Loading department dashboard...</Message>
          ) : !dashboard ? (
            <Message error>
              {error?.message || "The dashboard could not be loaded."}
            </Message>
          ) : (
            <>
              {error && (
                <Message error>
                  Dashboard refresh failed. Previously loaded totals
                  and reports are shown.
                </Message>
              )}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  label="Active Advisors"
                  value={summary.activeMentors}
                  detail={`${summary.availableMentors} available`}
                />
                <Metric
                  label="Active Student Assignments"
                  value={summary.activeAssignments}
                  detail="Includes couple and earlier individual assignments"
                />
                <Metric
                  label="Awaiting Assignment"
                  value={summary.studentsAwaitingAssignment}
                  detail="Students awaiting Advisors"
                />
                <Metric
                  label="Reports to Review"
                  value={summary.reportsAwaitingReview}
                  detail={`${summary.urgentReports} urgent reports`}
                  warning={summary.urgentReports > 0}
                />
              </section>

              <section className="grid gap-4 sm:grid-cols-3">
                <Metric
                  label="Open Follow-Ups"
                  value={summary.openFollowUps}
                />
                <Metric
                  label="Overdue Follow-Ups"
                  value={summary.overdueFollowUps}
                  warning={summary.overdueFollowUps > 0}
                />
                <Metric
                  label="Overdue Check-Ins"
                  value={summary.overdueCheckIns}
                  warning={summary.overdueCheckIns > 0}
                />
              </section>
            </>
          )}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Advisory Couple Workload"
              description="Each couple has one shared student capacity. Earlier individual assignments are excluded from these figures."
            />

            {couplesError ? (
              <div className="p-5">
                <Message error>
                  {couplesError.message ||
                    "Couple workload could not be loaded."}
                  {" "}Use Refresh to try again.
                </Message>
              </div>
            ) : couplesLoading ? (
              <div className="p-5">
                <Message>Loading couple workload...</Message>
              </div>
            ) : couples.length === 0 ? (
              <EmptyState message="Create advisory couples from Advisor Assignments to see their workload here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th scope="col" className="px-5 py-4">
                        Advisory Couple
                      </th>
                      <th scope="col" className="px-5 py-4">
                        Status
                      </th>
                      <th scope="col" className="px-5 py-4">
                        Shared Workload
                      </th>
                      <th scope="col" className="px-5 py-4">
                        Remaining Spaces
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {couples.map((couple) => (
                      <CoupleRow key={couple.id} couple={couple} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {dashboard && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                title="Recent Advisory Reports"
                description="Shared advisory responsibility and the individual who submitted each report."
              />

              {reports.length === 0 ? (
                <EmptyState message="Submitted advisory reports will appear here." />
              ) : (
                <div className="divide-y divide-slate-200">
                  {reports.map((report) => (
                    <ReportRow
                      key={report.report_id}
                      report={report}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </MentoringLayout>
  );
}

function CoupleRow({ couple }) {
  const full = couple.active_student_count >= couple.max_active_students;

  const status =
    couple.status !== "active"
      ? "Inactive"
      : couple.ready_for_assignment
        ? "Accepting students"
        : full
          ? "At capacity"
          : "Needs review";

  return (
    <tr className="text-sm">
      <td className="px-5 py-5">
        <p className="font-semibold text-blue-950">
          {couple.members
            .map((member) => member.full_name)
            .join(" & ") || couple.display_name}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          {couple.display_name}
        </p>

        {couple.members.some(
          (member) =>
            member.account_status !== "active" ||
            !["available", "limited"].includes(
              member.availability_status,
            ),
        ) && (
          <p className="mt-2 text-xs text-amber-700">
            One or more Advisors are currently unavailable.
          </p>
        )}
      </td>

      <td className="px-5 py-5">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {status}
        </span>
      </td>

      <td className="px-5 py-5 font-bold text-blue-950">
        {couple.active_student_count}/{couple.max_active_students}
      </td>

      <td className="px-5 py-5 text-slate-700">
        {couple.remaining_capacity}
      </td>
    </tr>
  );
}

function ReportRow({ report }) {
  const isCouple = Boolean(report.advisory_couple_id);

  return (
    <article className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h3 className="font-bold text-blue-950">
          {report.student_name}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {formatLabel(report.report_type)}
          {" · "}
          {formatLabel(report.attention_level)}
        </p>

        <p className="mt-3 break-words text-sm text-slate-700">
          <strong>{isCouple ? "Advisory couple: " : "Advisor: "}</strong>
          {isCouple
            ? report.advisor_names ||
              report.couple_name ||
              "Details unavailable"
            : report.mentor_name || "Details unavailable"}
        </p>

        {isCouple && report.couple_name && report.advisor_names && (
          <p className="mt-1 text-xs text-slate-500">
            {report.couple_name}
          </p>
        )}

        <p className="mt-2 text-sm text-slate-600">
          <strong>Submitted by: </strong>
          {report.submitted_by_name || "Name unavailable"}
        </p>
      </div>

      <div className="shrink-0 sm:text-right">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {formatLabel(report.status)}
        </span>
        <p className="mt-3 text-xs text-slate-500">
          {formatDate(report.submitted_at)}
        </p>
      </div>
    </article>
  );
}

function Metric({ label, value, detail, warning = false }) {
  return (
    <article
      className={`rounded-xl border p-5 ${
        warning
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-blue-200 bg-blue-50 text-blue-900"
      }`}
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value ?? 0}</p>
      {detail && <p className="mt-3 text-xs leading-5">{detail}</p>}
    </article>
  );
}

function SectionHeader({ title, description }) {
  return (
    <header className="border-b border-slate-200 p-5">
      <h2 className="text-xl font-bold text-blue-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </header>
  );
}

function EmptyState({ message }) {
  return <p className="p-8 text-center text-slate-500">{message}</p>;
}

function Message({ children, error = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-lg border p-4 text-sm ${
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
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}