import {
  useQuery,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getInstructorOversightData,
} from "../services/instructorOversightService";

export function useInstructorOversight() {
  const {
    profile,
    role,
  } = useAuth();

  const instructorOversightQuery =
    useQuery({
      queryKey: [
        "instructor-oversight",
        profile?.id,
      ],

      queryFn:
        getInstructorOversightData,

      enabled:
        Boolean(profile?.id) &&
        role === "super_admin",

      staleTime:
        30 * 1000,
    });

  const data =
    instructorOversightQuery.data;

  return {
    instructorOversightData:
      data || null,

    instructorSummary:
      data?.summary || null,

    instructors:
      data?.instructors || [],

    classes:
      data?.classes || [],

    attendance:
      data?.attendance || [],

    instructorOversightLoading:
      instructorOversightQuery
        .isLoading,

    instructorOversightFetching:
      instructorOversightQuery
        .isFetching,

    instructorOversightError:
      instructorOversightQuery.error,

    refreshInstructorOversight:
      instructorOversightQuery.refetch,
  };
}