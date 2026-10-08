import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getMyMentorDashboard,
  submitMentorReport,
} from "../services/mentorService";

export function useMentorDashboard() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const dashboardQuery =
    useQuery({
      queryKey: [
        "mentor-dashboard",
        profile?.id,
      ],

      queryFn:
        getMyMentorDashboard,

      enabled:
        Boolean(profile?.id) &&
        role === "mentor",

      staleTime:
        30 * 1000,
    });


  const submitReportMutation =
    useMutation({
      mutationFn:
        submitMentorReport,

      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              "mentor-dashboard",
              profile?.id,
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "mentoring-report-queue",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "mentor-department-dashboard",
            ],
          }),
        ]);
      },

      onError: (error) => {
        console.error(
          "Mentor report submission failed:",
          error,
        );
      },
    });


  return {
    mentorDashboard:
      dashboardQuery.data || null,

    mentorDashboardLoading:
      dashboardQuery.isLoading,

    mentorDashboardFetching:
      dashboardQuery.isFetching,

    mentorDashboardError:
      dashboardQuery.error,

    refreshMentorDashboard:
      dashboardQuery.refetch,


    submitReport:
      submitReportMutation
        .mutateAsync,

    submittingReport:
      submitReportMutation
        .isPending,

    submitReportError:
      submitReportMutation.error,

    submitReportResult:
      submitReportMutation.data,

    resetSubmitReport:
      submitReportMutation.reset,
  };
}