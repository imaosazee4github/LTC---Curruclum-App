import { useQuery } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import { getMyStudentCoaching } from "../services/studentService";

export function useStudentCoaching() {
  const { profile, role } = useAuth();

  const query = useQuery({
    queryKey: ["student-coaching", profile?.id],
    queryFn: getMyStudentCoaching,
    enabled: Boolean(profile?.id) && role === "student",
    staleTime: 30 * 1000,
  });

  return {
    assignments: query.data?.assignments || [],
    sessions: query.data?.sessions || [],
    followUps: query.data?.followUps || [],
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refresh: query.refetch,
  };
}