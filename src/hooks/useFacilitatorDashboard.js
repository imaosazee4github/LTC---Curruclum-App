import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  createLearningExperienceActivity,
  createLearningExperienceResource,
  getMyFacilitatorDashboard,
  recordStudentEngagement,
  updateFacilitatorFollowUp,
} from "../services/facilitatorService";

export function useFacilitatorDashboard() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "facilitator";

  const dashboardQuery =
    useQuery({
      queryKey: [
        "facilitator-dashboard",
        profile?.id,
      ],

      queryFn:
        getMyFacilitatorDashboard,

      enabled,

      staleTime:
        30 * 1000,
    });

  async function refreshFacilitatorData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "facilitator-dashboard",
          profile?.id,
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "facilitator-students",
          profile?.id,
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "learning-experience-management",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "student-record",
        ],
      }),
    ]);
  }

  const recordEngagementMutation =
    useMutation({
      mutationFn:
        recordStudentEngagement,

      onSuccess:
        refreshFacilitatorData,

      onError: (error) => {
        console.error(
          "Recording student engagement failed:",
          error,
        );
      },
    });

  const updateFollowUpMutation =
    useMutation({
      mutationFn:
        updateFacilitatorFollowUp,

      onSuccess:
        refreshFacilitatorData,

      onError: (error) => {
        console.error(
          "Updating facilitator follow-up failed:",
          error,
        );
      },
    });

  const createResourceMutation =
    useMutation({
      mutationFn:
        createLearningExperienceResource,

      onSuccess:
        refreshFacilitatorData,

      onError: (error) => {
        console.error(
          "Creating learning-experience resource failed:",
          error,
        );
      },
    });

  const createActivityMutation =
    useMutation({
      mutationFn:
        createLearningExperienceActivity,

      onSuccess:
        refreshFacilitatorData,

      onError: (error) => {
        console.error(
          "Creating learning-experience activity failed:",
          error,
        );
      },
    });

  return {
    facilitatorDashboard:
      dashboardQuery.data || null,

    facilitatorDashboardLoading:
      dashboardQuery.isLoading,

    facilitatorDashboardFetching:
      dashboardQuery.isFetching,

    facilitatorDashboardError:
      dashboardQuery.error,

    refreshFacilitatorDashboard:
      dashboardQuery.refetch,

    recordEngagement:
      recordEngagementMutation
        .mutateAsync,

    recordingEngagement:
      recordEngagementMutation
        .isPending,

    recordEngagementError:
      recordEngagementMutation.error,

    recordEngagementResult:
      recordEngagementMutation.data,

    resetRecordEngagement:
      recordEngagementMutation.reset,

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

    createResource:
      createResourceMutation
        .mutateAsync,

    creatingResource:
      createResourceMutation
        .isPending,

    createResourceError:
      createResourceMutation.error,

    createResourceResult:
      createResourceMutation.data,

    resetCreateResource:
      createResourceMutation.reset,

    createActivity:
      createActivityMutation
        .mutateAsync,

    creatingActivity:
      createActivityMutation
        .isPending,

    createActivityError:
      createActivityMutation.error,

    createActivityResult:
      createActivityMutation.data,

    resetCreateActivity:
      createActivityMutation.reset,
  };
}