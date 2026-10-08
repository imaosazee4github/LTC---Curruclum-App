import {
  useQuery,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getSuperAdminDashboard,
} from "../services/superAdminService";

export function useSuperAdminDashboard() {
  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "super_admin";

  const dashboardQuery =
    useQuery({
      queryKey: [
        "super-admin-dashboard",
        profile?.id,
      ],

      queryFn:
        getSuperAdminDashboard,

      enabled,

      staleTime:
        30 * 1000,
    });

  return {
    superAdminDashboard:
      dashboardQuery.data || null,

    superAdminDashboardLoading:
      dashboardQuery.isLoading,

    superAdminDashboardFetching:
      dashboardQuery.isFetching,

    superAdminDashboardError:
      dashboardQuery.error,

    refreshSuperAdminDashboard:
      dashboardQuery.refetch,
  };
}