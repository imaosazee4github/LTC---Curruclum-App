import {
  useQuery,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getCoachOversightData,
} from "../services/coachOversightService";

export function useCoachOversight() {
  const {
    profile,
    role,
  } = useAuth();

  const coachOversightQuery =
    useQuery({
      queryKey: [
        "coach-oversight",
        profile?.id,
      ],

      queryFn:
        getCoachOversightData,

      enabled:
        Boolean(profile?.id) &&
        role === "super_admin",

      staleTime:
        30 * 1000,
    });

  const data =
    coachOversightQuery.data;

  return {
    coachOversight:
      data || null,

    coachSummary:
      data?.summary || null,

    coaches:
      data?.coaches || [],

    coachingAssignments:
      data?.assignments || [],

    coachingSessions:
      data?.sessions || [],

    coachingFollowUps:
      data?.followUps || [],

    coachOversightLoading:
      coachOversightQuery
        .isLoading,

    coachOversightFetching:
      coachOversightQuery
        .isFetching,

    coachOversightError:
      coachOversightQuery
        .error,

    refreshCoachOversight:
      coachOversightQuery
        .refetch,
  };
}