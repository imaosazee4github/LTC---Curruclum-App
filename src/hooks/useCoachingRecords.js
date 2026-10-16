import { useQuery } from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getMyCoachDashboard,
  getMyCoachingRecords,
} from "../services/coachService";

export function useCoachingRecords({
  assignmentId = null,
} = {}) {
  const { profile, role } = useAuth();

  const enabled =
    Boolean(profile?.id) && role === "coach";

  const recordsQuery = useQuery({
    queryKey: [
      "coach-records",
      profile?.id,
      assignmentId || "all",
    ],

    queryFn: () =>
      getMyCoachingRecords({ assignmentId }),

    enabled,
    staleTime: 30 * 1000,
  });

  // Reuse the dashboard query and its cached assignments.
  const dashboardQuery = useQuery({
    queryKey: [
      "coach-dashboard",
      profile?.id,
    ],

    queryFn: getMyCoachDashboard,

    enabled,
    staleTime: 30 * 1000,
  });

  async function refreshCoachingRecords() {
    await Promise.allSettled([
      recordsQuery.refetch(),
      dashboardQuery.refetch(),
    ]);
  }

  return {
    coachingRecords:
      recordsQuery.data || null,

    coachingRecordsSummary:
      recordsQuery.data?.summary || {
        totalSessions: 0,
        studentsCoached: 0,
        sessionsWithFollowUp: 0,
        latestSessionDate: null,
      },

    records:
      recordsQuery.data?.records || [],

    coachingAssignments:
      dashboardQuery.data?.assignments || [],

    coachingRecordsLoading:
      recordsQuery.isLoading ||
      dashboardQuery.isLoading,

    coachingRecordsFetching:
      recordsQuery.isFetching ||
      dashboardQuery.isFetching,

    coachingRecordsError:
      recordsQuery.error ||
      dashboardQuery.error,

    refreshCoachingRecords,
  };
}