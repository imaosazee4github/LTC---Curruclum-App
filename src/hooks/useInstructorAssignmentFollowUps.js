import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getMyAssignmentFollowUpData,
  reviewClassAssignmentSubmission,
} from "../services/instructorAssignmentService";

export function useInstructorAssignmentFollowUps() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "instructor";

  const followUpQuery =
    useQuery({
      queryKey: [
        "instructor-assignment-follow-ups",
        profile?.id,
      ],

      queryFn:
        getMyAssignmentFollowUpData,

      enabled,

      staleTime:
        30 * 1000,
    });

  async function refreshFollowUpData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "instructor-assignment-follow-ups",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "instructor-assignments",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "instructor-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "student-assignments",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "super-admin-assignment-oversight",
        ],
      }),
    ]);
  }

  const reviewMutation =
    useMutation({
      mutationFn:
        reviewClassAssignmentSubmission,

      onSuccess:
        refreshFollowUpData,

      onError: (error) => {
        console.error(
          "Reviewing assignment submission failed:",
          error,
        );
      },
    });

  return {
    followUpData:
      followUpQuery.data || null,

    followUpSummary:
      followUpQuery.data
        ?.summary || null,

    assignmentSubmissions:
      followUpQuery.data
        ?.submissions || [],

    followUpsLoading:
      followUpQuery.isLoading,

    followUpsFetching:
      followUpQuery.isFetching,

    followUpsError:
      followUpQuery.error,

    refreshFollowUps:
      followUpQuery.refetch,

    reviewSubmission:
      reviewMutation.mutateAsync,

    reviewingSubmission:
      reviewMutation.isPending,

    reviewSubmissionError:
      reviewMutation.error,

    reviewSubmissionResult:
      reviewMutation.data,

    resetReviewSubmission:
      reviewMutation.reset,
  };
}