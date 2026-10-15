import { useQuery } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import {
  getSuperAdminStudentOverview,
} from "../services/superAdminService";

export function useSuperAdminStudents() {
  const { profile, role } = useAuth();

  const studentsQuery = useQuery({
    queryKey: [
      "super-admin-students",
      profile?.id,
    ],
    queryFn: getSuperAdminStudentOverview,
    enabled:
      Boolean(profile?.id) &&
      role === "super_admin",
    staleTime: 30 * 1000,
  });

  return {
    students: studentsQuery.data?.students ?? [],
    studentsLoading: studentsQuery.isLoading,
    studentsFetching: studentsQuery.isFetching,
    studentsError: studentsQuery.error,
    refreshStudents: studentsQuery.refetch,
  };
}