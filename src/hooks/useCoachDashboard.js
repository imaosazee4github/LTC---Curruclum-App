import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getMyCoachDashboard,
  recordCoachingSession,
  updateCoachingFollowUp,
} from "../services/coachService";

export function useCoachDashboard() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "coach";

  const dashboardQuery =
    useQuery({
      queryKey: [
        "coach-dashboard",
        profile?.id,
      ],

      queryFn:
        getMyCoachDashboard,

      enabled,

      staleTime:
        30 * 1000,
    });

  async function refreshCoachingData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "coach-dashboard",
          profile?.id,
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "coaching-assignment-options",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "student-coaching-record",
        ],
      }),
    ]);
  }

  const recordSessionMutation =
    useMutation({
      mutationFn:
        recordCoachingSession,

      onSuccess:
        refreshCoachingData,

      onError: (error) => {
        console.error(
          "Recording coaching session failed:",
          error,
        );
      },
    });

  const updateFollowUpMutation =
    useMutation({
      mutationFn:
        updateCoachingFollowUp,

      onSuccess:
        refreshCoachingData,

      onError: (error) => {
        console.error(
          "Updating coaching follow-up failed:",
          error,
        );
      },
    });

  return {
    coachDashboard:
      dashboardQuery.data || null,

    coachDashboardLoading:
      dashboardQuery.isLoading,

    coachDashboardFetching:
      dashboardQuery.isFetching,

    coachDashboardError:
      dashboardQuery.error,

    refreshCoachDashboard:
      dashboardQuery.refetch,

    recordSession:
      recordSessionMutation
        .mutateAsync,

    recordingSession:
      recordSessionMutation
        .isPending,

    recordSessionError:
      recordSessionMutation.error,

    recordSessionResult:
      recordSessionMutation.data,

    resetRecordSession:
      recordSessionMutation.reset,

    updateFollowUp:
      updateFollowUpMutation
        .mutateAsync,

    updatingFollowUp:
      updateFollowUpMutation
        .isPending,

    updateFollowUpError:
      updateFollowUpMutation.error,

    updateFollowUpResult:
      updateFollowUpMutation.data,

    resetUpdateFollowUp:
      updateFollowUpMutation.reset,
  };
}