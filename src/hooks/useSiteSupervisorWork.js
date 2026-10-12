import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getSiteSupervisorWorkData,
  recordServiceAttendance,
  recordStudentServiceWork,
} from "../services/supervisorService";

export function useSiteSupervisorWork() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "supervisor";

  const siteWorkQuery =
    useQuery({
      queryKey: [
        "site-supervisor-work",
        profile?.id,
      ],

      queryFn:
        getSiteSupervisorWorkData,

      enabled,

      staleTime:
        30 * 1000,
    });

  async function refreshSiteWorkData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "site-supervisor-work",
        ],
      }),

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

      queryClient.invalidateQueries({
        queryKey: [
          "service-oversight",
        ],
      }),
    ]);
  }

  const attendanceMutation =
    useMutation({
      mutationFn:
        recordServiceAttendance,

      onSuccess:
        refreshSiteWorkData,

      onError: (error) => {
        console.error(
          "Service attendance recording failed:",
          error,
        );
      },
    });

  const workReportMutation =
    useMutation({
      mutationFn:
        recordStudentServiceWork,

      onSuccess:
        refreshSiteWorkData,

      onError: (error) => {
        console.error(
          "Student service work report failed:",
          error,
        );
      },
    });

  const data =
    siteWorkQuery.data;

  return {
    siteSupervisorWork:
      data || null,

    siteWorkSummary:
      data?.summary || null,

    siteWorkAssignments:
      data?.assignments || [],

    siteSupervisorType:
      data?.supervisorType ||
      null,

    siteWorkLoading:
      siteWorkQuery.isLoading,

    siteWorkFetching:
      siteWorkQuery.isFetching,

    siteWorkError:
      siteWorkQuery.error,

    refreshSiteWork:
      siteWorkQuery.refetch,

    saveAttendance:
      attendanceMutation
        .mutateAsync,

    savingAttendance:
      attendanceMutation
        .isPending,

    attendanceError:
      attendanceMutation.error,

    attendanceResult:
      attendanceMutation.data,

    resetAttendance:
      attendanceMutation.reset,

    saveWorkReport:
      workReportMutation
        .mutateAsync,

    savingWorkReport:
      workReportMutation
        .isPending,

    workReportError:
      workReportMutation.error,

    workReportResult:
      workReportMutation.data,

    resetWorkReport:
      workReportMutation.reset,
  };
}