import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  assignStaffRole,
  getStaffManagementData,
} from "../services/superAdminService";

export function useStaffManagement() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "super_admin";


  const staffManagementQuery =
    useQuery({
      queryKey: [
        "staff-management",
        profile?.id,
      ],

      queryFn:
        getStaffManagementData,

      enabled,

      staleTime:
        30 * 1000,
    });


  async function refreshStaffData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "staff-management",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "super-admin-dashboard",
        ],
      }),
    ]);
  }


  const assignStaffMutation =
    useMutation({
      mutationFn:
        assignStaffRole,

      onSuccess:
        refreshStaffData,

      onError: (error) => {
        console.error(
          "Staff role assignment failed:",
          error,
        );
      },
    });


  return {
    staffManagement:
      staffManagementQuery.data ||
      null,

    staffSummary:
      staffManagementQuery
        .data?.summary || null,

    staff:
      staffManagementQuery
        .data?.staff || [],

    eligibleAccounts:
      staffManagementQuery
        .data?.eligibleAccounts || [],

    staffManagementLoading:
      staffManagementQuery.isLoading,

    staffManagementFetching:
      staffManagementQuery.isFetching,

    staffManagementError:
      staffManagementQuery.error,

    refreshStaffManagement:
      staffManagementQuery.refetch,


    appointStaff:
      assignStaffMutation
        .mutateAsync,

    appointingStaff:
      assignStaffMutation
        .isPending,

    appointStaffError:
      assignStaffMutation.error,

    appointStaffResult:
      assignStaffMutation.data,

    resetAppointStaff:
      assignStaffMutation.reset,
  };
}