import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  createServiceProject,
  createServiceProjectSchedule,
  getMySupervisorDashboard,
} from "../services/supervisorService";

export function useSupervisorDashboard() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const dashboardQuery =
    useQuery({
      queryKey: [
        "supervisor-dashboard",
        profile?.id,
      ],

      queryFn:
        getMySupervisorDashboard,

      enabled:
        Boolean(profile?.id) &&
        role === "supervisor",

      staleTime:
        30 * 1000,
    });

  async function refreshSupervisorData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "supervisor-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "super-admin-dashboard",
        ],
      }),
    ]);
  }

  const createProjectMutation =
    useMutation({
      mutationFn:
        createServiceProject,

      onSuccess:
        refreshSupervisorData,

      onError: (error) => {
        console.error(
          "Service project creation failed:",
          error,
        );
      },
    });

  const createScheduleMutation =
    useMutation({
      mutationFn:
        createServiceProjectSchedule,

      onSuccess:
        refreshSupervisorData,

      onError: (error) => {
        console.error(
          "Service project scheduling failed:",
          error,
        );
      },
    });

  const data =
    dashboardQuery.data;

  return {
    supervisorDashboard:
      data || null,

    supervisorProfile:
      data?.profile || null,

    supervisorType:
      data?.supervisorType || null,

    supervisorSummary:
      data?.summary || null,

    supervisorProjects:
      data?.projects || [],

    supervisorDashboardLoading:
      dashboardQuery.isLoading,

    supervisorDashboardFetching:
      dashboardQuery.isFetching,

    supervisorDashboardError:
      dashboardQuery.error,

    refreshSupervisorDashboard:
      dashboardQuery.refetch,

    createProject:
      createProjectMutation
        .mutateAsync,

    creatingProject:
      createProjectMutation
        .isPending,

    createProjectError:
      createProjectMutation.error,

    createProjectResult:
      createProjectMutation.data,

    resetCreateProject:
      createProjectMutation.reset,

    createSchedule:
      createScheduleMutation
        .mutateAsync,

    creatingSchedule:
      createScheduleMutation
        .isPending,

    createScheduleError:
      createScheduleMutation.error,

    createScheduleResult:
      createScheduleMutation.data,

    resetCreateSchedule:
      createScheduleMutation.reset,
  };
}