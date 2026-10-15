import { useQuery } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import {
  getSuperAdminStudentDetails,
} from "../services/superAdminService";

export function useSuperAdminStudentDetails(profileId) {
  const { profile, role } = useAuth();

  const query = useQuery({
    queryKey: [
      "super-admin-student-details",
      profile?.id,
      profileId,
    ],
    queryFn: () => getSuperAdminStudentDetails(profileId),
    enabled:
      Boolean(profile?.id) &&
      Boolean(profileId) &&
      role === "super_admin",
    staleTime: 30 * 1000,
  });

  return {
    studentDetails: query.data,
    studentDetailsLoading: query.isLoading,
    studentDetailsError: query.error,
    refreshStudentDetails: query.refetch,
  };
}