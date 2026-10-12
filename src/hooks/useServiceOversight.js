import {
  useQuery,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getServiceOversightData,
} from "../services/serviceOversightService";

export function useServiceOversight() {
  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "super_admin";

  const oversightQuery =
    useQuery({
      queryKey: [
        "service-oversight",
        profile?.id,
      ],

      queryFn:
        getServiceOversightData,

      enabled,

      staleTime:
        30 * 1000,
    });

  const data =
    oversightQuery.data;

  return {
    serviceOversight:
      data || null,

    oversightSummary:
      data?.summary || null,

    oversightProjects:
      data?.projects || [],

    oversightAssignments:
      data?.assignments || [],

    oversightLoading:
      oversightQuery.isLoading,

    oversightFetching:
      oversightQuery.isFetching,

    oversightError:
      oversightQuery.error,

    refreshOversight:
      oversightQuery.refetch,
  };
}