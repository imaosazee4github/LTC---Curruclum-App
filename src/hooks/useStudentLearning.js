import { useQuery } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import { getMyStudentLearning } from "../services/studentService";

export function useStudentLearning() {
  const { profile, role } = useAuth();

  const query = useQuery({
    queryKey: ["student-learning", profile?.id],
    queryFn: getMyStudentLearning,
    enabled: Boolean(profile?.id) && role === "student",
    staleTime: 30 * 1000,
  });

  return {
    classes: query.data?.classes || [],
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
    refresh: query.refetch,
  };
}