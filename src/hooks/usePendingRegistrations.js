import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import {
  approveRegistration,
  getPendingRegistrations,
} from "../services/superAdminService";

export function usePendingRegistrations() {
  const queryClient = useQueryClient();
  const { profile, role } = useAuth();

  const registrationsQuery = useQuery({
    queryKey: ["pending-registrations", profile?.id],
    queryFn: getPendingRegistrations,
    enabled:
      Boolean(profile?.id) &&
      role === "super_admin",
    staleTime: 15 * 1000,
  });

  const approvalMutation = useMutation({
    mutationFn: approveRegistration,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["pending-registrations"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["super-admin-dashboard"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["super-admin-students"],
        }),
      ]);
    },
  });

  return {
    registrations: registrationsQuery.data ?? [],
    registrationsLoading: registrationsQuery.isLoading,
    registrationsFetching: registrationsQuery.isFetching,
    registrationsError: registrationsQuery.error,
    refreshRegistrations: registrationsQuery.refetch,

    approveRegistration: approvalMutation.mutateAsync,
    approving: approvalMutation.isPending,
    approvingProfileId: approvalMutation.isPending
      ? approvalMutation.variables
      : null,
  };
}