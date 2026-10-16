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

export function useSupervisorAppointments() {
  const { profile, role } = useAuth();
  const queryClient = useQueryClient();

  const staffQuery = useQuery({
    queryKey: ["staff-management", profile?.id],
    queryFn: getStaffManagementData,
    enabled: Boolean(profile?.id) && role === "super_admin",
    staleTime: 30 * 1000,
  });

  const appointmentMutation = useMutation({
    mutationFn: ({ profileId, supervisorType }) =>
      appointStaffWithClass({
        profileId,
        role: "supervisor",
        supervisorType,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["staff-management"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["super-admin-dashboard"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["supervisor-allocation-options"],
        }),
      ]);
    },
  });

  const staff = staffQuery.data?.staff || [];

  const supervisors = staff.filter(
    (member) =>
      member.role === "supervisor" ||
      member.appointed_roles?.includes("supervisor"),
  );

  const accounts = new Map();

  for (const account of staffQuery.data?.eligibleAccounts || []) {
    if (account.profile_id) {
      accounts.set(account.profile_id, account);
    }
  }

  for (const member of staff) {
    if (member.profile_id) {
      accounts.set(member.profile_id, {
        profile_id: member.profile_id,
        full_name: member.full_name,
        email: member.email,
      });
    }
  }

  return {
    supervisors,

    accounts: [...accounts.values()].sort((a, b) =>
      String(a.full_name || a.email || "").localeCompare(
        String(b.full_name || b.email || ""),
      ),
    ),

    loading: staffQuery.isLoading,
    fetching: staffQuery.isFetching,
    error: staffQuery.error,
    refresh: staffQuery.refetch,

    saveAppointment: appointmentMutation.mutateAsync,
    saving: appointmentMutation.isPending,
    resetAppointment: appointmentMutation.reset,
  };
}