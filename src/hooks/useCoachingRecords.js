import {
  useQuery,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getMyCoachingRecords,
} from "../services/coachService";

export function useCoachingRecords({
  assignmentId = null,
} = {}) {
  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "coach";

  const recordsQuery = useQuery({
    queryKey: [
      "coach-records",
      profile?.id,
      assignmentId || "all",
    ],

    queryFn: () =>
      getMyCoachingRecords({
        assignmentId,
      }),

    enabled,

    staleTime: 30 * 1000,
  });

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
      recordsQuery.data?.records ||
      [],

    coachingRecordsLoading:
      recordsQuery.isLoading,

    coachingRecordsFetching:
      recordsQuery.isFetching,

    coachingRecordsError:
      recordsQuery.error,

    refreshCoachingRecords:
      recordsQuery.refetch,
  };
}