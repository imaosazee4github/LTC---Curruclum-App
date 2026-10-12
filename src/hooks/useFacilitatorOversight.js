import {
  useQuery,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getFacilitatorOversightData,
} from "../services/facilitatorOversightService";

export function useFacilitatorOversight() {
  const {
    profile,
    role,
  } = useAuth();

  const facilitatorOversightQuery =
    useQuery({
      queryKey: [
        "facilitator-oversight",
        profile?.id,
      ],

      queryFn:
        getFacilitatorOversightData,

      enabled:
        Boolean(profile?.id) &&
        role === "super_admin",

      staleTime:
        30 * 1000,
    });

  const data =
    facilitatorOversightQuery.data;

  return {
    facilitatorOversight:
      data || null,

    facilitatorSummary:
      data?.summary || null,

    facilitators:
      data?.facilitators || [],

    learningExperiences:
      data?.experiences || [],

    engagementRecords:
      data?.engagementRecords || [],

    facilitatorFollowUps:
      data?.followUps || [],

    facilitatorOversightLoading:
      facilitatorOversightQuery
        .isLoading,

    facilitatorOversightFetching:
      facilitatorOversightQuery
        .isFetching,

    facilitatorOversightError:
      facilitatorOversightQuery
        .error,

    refreshFacilitatorOversight:
      facilitatorOversightQuery
        .refetch,
  };
}