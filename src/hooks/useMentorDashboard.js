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
  const queryClient = useQueryClient();
  const { profile, role } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "mentor";

  const dashboardQuery = useQuery({
    queryKey: ["mentor-dashboard", profile?.id],
    queryFn: getMyMentorDashboard,
    enabled,
    staleTime: 30 * 1000,

    // Keep shared work updated while either spouse is signed in.
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const submitReportMutation = useMutation({
    mutationFn: (values) => {
      if (!enabled) {
        throw new Error(
          "Only an Advisor can submit an advisory report.",
        );
      }

      return submitMentorReport(values);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["mentor-dashboard"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["mentoring-report-queue"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["mentor-department-dashboard"],
        }),
      ]);
    },

    onError: (error) => {
      console.error("Advisory report submission failed:", error);
    },
  });

  return {
    mentorDashboard: dashboardQuery.data || null,
    mentorDashboardLoading: dashboardQuery.isLoading,
    mentorDashboardFetching: dashboardQuery.isFetching,
    mentorDashboardError: dashboardQuery.error,
    refreshMentorDashboard: dashboardQuery.refetch,

    submitReport: submitReportMutation.mutateAsync,
    submittingReport: submitReportMutation.isPending,
    submitReportError: submitReportMutation.error,
    submitReportResult: submitReportMutation.data,
    resetSubmitReport: submitReportMutation.reset,
  };
}