import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  appointStaffWithClass,
  getStaffManagementData,
} from "../services/superAdminService";

import {
  getStaffAllocationManagementData,
} from "../services/staffAllocationService";

export function useStaffManagement() {
  const queryClient = useQueryClient();
  const { profile, role } = useAuth();

  const enabled =
    Boolean(profile?.id) && role === "super_admin";

  const staffQuery = useQuery({
    queryKey: ["staff-management", profile?.id],
    queryFn: getStaffManagementData,
    enabled,
    staleTime: 30 * 1000,
  });

  const allocationQuery = useQuery({
    queryKey: ["staff-allocation-management", profile?.id],
    queryFn: getStaffAllocationManagementData,
    enabled,
    staleTime: 30 * 1000,
  });

  async function refreshStaffData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["staff-management"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["staff-allocation-management"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["super-admin-dashboard"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["super-admin-students"],
      }),
    ]);
  }

  const appointMutation = useMutation({
    mutationFn: appointStaffWithClass,

    onSuccess: refreshStaffData,

    onError: (error) => {
      console.error("Staff assignment failed:", error);
    },
  });

  async function refreshStaffManagement() {
    return Promise.all([
      staffQuery.refetch(),
      allocationQuery.refetch(),
    ]);
  }

  const courseClasses = (
    allocationQuery.data?.classes || []
  ).filter((programmeClass) =>
    ["planned", "active"].includes(programmeClass.status),
  );

  return {
    staffManagement: staffQuery.data || null,

    staffSummary: staffQuery.data?.summary || null,

    staff: staffQuery.data?.staff || [],

    eligibleAccounts:
      staffQuery.data?.eligibleAccounts || [],

    courseClasses,

    classAllocations:
      allocationQuery.data?.allocations || [],

    staffManagementLoading:
      staffQuery.isLoading || allocationQuery.isLoading,

    staffManagementFetching:
      staffQuery.isFetching || allocationQuery.isFetching,

    staffManagementError:
      staffQuery.error || allocationQuery.error,

    refreshStaffManagement,

    appointStaff: appointMutation.mutateAsync,

    appointingStaff: appointMutation.isPending,

    appointStaffError: appointMutation.error,

    appointStaffResult: appointMutation.data,

    resetAppointStaff: appointMutation.reset,
  };
}