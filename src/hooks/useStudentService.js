import { useQuery } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import { getMyStudentService } from "../services/studentService";

export function useStudentService() {
  const { profile, role } = useAuth();

  const serviceQuery = useQuery({
    queryKey: ["student-service", profile?.id],
    queryFn: getMyStudentService,
    enabled: Boolean(profile?.id) && role === "student",
    staleTime: 30 * 1000,
  });

  return {
    assignments: serviceQuery.data?.assignments ?? [],
    serviceLoading: serviceQuery.isLoading,
    serviceFetching: serviceQuery.isFetching,
    serviceError: serviceQuery.error,
    refreshService: serviceQuery.refetch,
  };
}