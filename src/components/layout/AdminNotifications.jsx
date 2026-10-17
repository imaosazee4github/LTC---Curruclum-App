import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useSuperAdminDashboard } from "../../hooks/useSuperAdminDashboard";
import { getPendingRegistrations } from "../../services/superAdminService";

export default function AdminNotifications() {
  const dialogRef = useRef(null);
  const { profile, role } = useAuth();

  const {
    superAdminDashboard,
    superAdminDashboardLoading,
    superAdminDashboardFetching,
    superAdminDashboardError,
    refreshSuperAdminDashboard,
  } = useSuperAdminDashboard();

  const pendingQuery = useQuery({
    queryKey: ["pending-registrations", profile?.id],
    queryFn: getPendingRegistrations,
    enabled: Boolean(profile?.id) && role === "super_admin",
    staleTime: 15 * 1000,
  });

  const summary = superAdminDashboard?.summary || {};

  const pendingCount = Array.isArray(pendingQuery.data)
    ? pendingQuery.data.length
    : 0;

  const loading =
    superAdminDashboardLoading || pendingQuery.isLoading;

  const fetching =
    superAdminDashboardFetching || pendingQuery.isFetching;

  const hasError =
    Boolean(superAdminDashboardError) || pendingQuery.isError;

  const actions = [
    {
      id: "registrations",
      title: "Registrations awaiting approval",
      count: pendingCount,
      description:
        "Review each registration and its requested roles. Approve eligible users to activate their access.",
      path: "/super-admin/dashboard#registrations",
      button: "Review registrations",
    },
    {
      id: "urgent",
      title: "Urgent advisory reports",
      count: summary.urgentMentorReports,
      urgent: true,
      description:
        "Coordinate with the Advisory Department to review these reports and arrange the required support or follow-up.",
    },
    {
      id: "reports",
      title: "Advisor reports awaiting review",
      count: summary.mentorReportsAwaitingReview,
      description:
        "Ask the Advisory Department to review submitted reports and complete outstanding reviews. Urgent reports may also be included in this count.",
    },
    {
      id: "mentors",
      title: "Students without advisors",
      count: summary.studentsWithoutMentors,
      description:
        "Identify students without an advisor and coordinate their advisor assignments with the Advisory Department.",
      path: "/super-admin/dashboard#students",
      button: "View students",
    },
    {
      id: "profiles",
      title: "Incomplete student profiles",
      count: summary.incompleteStudentProfiles,
      description:
        "Review the students’ details and ask them to complete their missing profile information.",
      path: "/super-admin/dashboard#students",
      button: "View students",
    },
  ].filter((action) => Number(action.count) > 0);

  function closeModal() {
    dialogRef.current?.close();
  }

  async function refreshAlerts() {
    await Promise.allSettled([
      refreshSuperAdminDashboard(),
      pendingQuery.refetch(),
    ]);
  }

  function openModal() {
    dialogRef.current?.showModal();
    refreshAlerts();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        aria-label={
          hasError
            ? "Notifications: some alerts could not be loaded"
            : `Notifications: ${actions.length} action categories`
        }
        aria-haspopup="dialog"
        className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <Bell size={20} aria-hidden="true" />

        {actions.length > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {actions.length}
          </span>
        ) : hasError ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
            !
          </span>
        ) : null}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="admin-notifications-title"
        aria-describedby="admin-notifications-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
        className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-6">
          <div>
            <h2
              id="admin-notifications-title"
              className="text-xl font-bold text-blue-950"
            >
              Actions Required
            </h2>

            <p
              id="admin-notifications-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              Outstanding items and the action needed for each.
              The badge counts action categories.
            </p>
          </div>

          <button
            type="button"
            autoFocus
            onClick={closeModal}
            aria-label="Close notifications"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-4 p-6">
          {fetching && (
            <p role="status" className="text-sm text-slate-500">
              Updating notifications...
            </p>
          )}

          {hasError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              Some notifications could not be loaded. Refresh to try again.
            </div>
          )}

          {actions.map((action) => (
            <article
              key={action.id}
              className={`rounded-xl border p-5 ${
                action.urgent
                  ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={21}
                  aria-hidden="true"
                  className={`mt-1 shrink-0 ${
                    action.urgent ? "text-red-600" : "text-amber-600"
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold">{action.title}</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold">
                      {action.count}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {action.description}
                  </p>

                  {action.path && (
                    <Link
                      to={action.path}
                      onClick={closeModal}
                      className="mt-4 inline-block rounded-lg bg-blue-950 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
                    >
                      {action.button}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}

          {!loading && !hasError && actions.length === 0 && (
            <div className="py-8 text-center">
              <CheckCircle2
                size={40}
                aria-hidden="true"
                className="mx-auto text-green-600"
              />
              <h3 className="mt-4 font-bold">No outstanding actions</h3>
              <p className="mt-2 text-sm text-slate-500">
                No actions were found in the current dashboard data.
              </p>
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={refreshAlerts}
            disabled={fetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              aria-hidden="true"
              className={fetching ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg bg-blue-950 px-5 py-2 text-sm font-semibold text-white"
          >
            Close
          </button>
        </footer>
      </dialog>
    </>
  );
}