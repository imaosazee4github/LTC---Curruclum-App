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
  appointStaffToCourse,
  getCourseStaffOptions,
} from "../services/courseStaffService";

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

  const courseQuery = useQuery({
    queryKey: ["staff-course-appointments", profile?.id],
    queryFn: getCourseStaffOptions,
    enabled,
    staleTime: 30 * 1000,
  });

  async function refreshStaffData() {
    const keys = [
      ["staff-management"],
      ["staff-course-appointments"],
      ["staff-allocation-management"],
      ["weekly-planning"],
      ["super-admin-dashboard"],
      ["super-admin-students"],
    ];

    await Promise.all(
      keys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
  }

  const appointMutation = useMutation({
    mutationFn: (values) =>
      values.role === "supervisor"
        ? appointStaffWithClass({
            ...values,
            classId: null,
          })
        : appointStaffToCourse(values),

    onSuccess: refreshStaffData,

    onError: (error) => {
      console.error("Staff appointment failed:", error);
    },
  });

  async function refreshStaffManagement() {
    return Promise.all([
      staffQuery.refetch(),
      courseQuery.refetch(),
    ]);
  }

  return {
    staffManagement: staffQuery.data || null,
    staffSummary: staffQuery.data?.summary || null,
    staff: staffQuery.data?.staff || [],
    eligibleAccounts: staffQuery.data?.eligibleAccounts || [],

    courses: courseQuery.data?.courses || [],
    courseAppointments: courseQuery.data?.appointments || [],

    staffManagementLoading:
      staffQuery.isLoading || courseQuery.isLoading,

    staffManagementFetching:
      staffQuery.isFetching || courseQuery.isFetching,

    staffManagementError:
      staffQuery.error || courseQuery.error,

    refreshStaffManagement,

    appointStaff: appointMutation.mutateAsync,
    appointingStaff: appointMutation.isPending,
    appointStaffError: appointMutation.error,
    appointStaffResult: appointMutation.data,
    resetAppointStaff: appointMutation.reset,
  };
}