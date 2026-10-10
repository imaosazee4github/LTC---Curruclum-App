import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  assignStudentToCoach,
  closeCoachingAssignment,
  getCoachingAssignmentOptions,
} from "../services/superAdminService";

export function useCoachingAssignments() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const assignmentOptionsQuery =
    useQuery({
      queryKey: [
        "coaching-assignment-options",
        profile?.id,
      ],

      queryFn:
        getCoachingAssignmentOptions,

      enabled:
        Boolean(profile?.id) &&
        role === "super_admin",

      staleTime:
        30 * 1000,
    });

  const assignStudentMutation =
    useMutation({
      mutationFn:
        assignStudentToCoach,

      onSuccess: async () => {
        await invalidateCoachingData(
          queryClient,
          profile?.id,
        );
      },

      onError: (error) => {
        console.error(
          "Student coaching assignment failed:",
          error,
        );
      },
    });

  const closeAssignmentMutation =
    useMutation({
      mutationFn:
        closeCoachingAssignment,

      onSuccess: async () => {
        await invalidateCoachingData(
          queryClient,
          profile?.id,
        );
      },

      onError: (error) => {
        console.error(
          "Closing coaching assignment failed:",
          error,
        );
      },
    });

  const data =
    assignmentOptionsQuery.data;

  return {
    coachingAssignmentData:
      data || null,

    coachingSummary:
      data?.summary || null,

    coaches:
      data?.coaches || [],

    students:
      data?.students || [],

    coachingAssignments:
      data?.assignments || [],

    coachingAssignmentsLoading:
      assignmentOptionsQuery.isLoading,

    coachingAssignmentsFetching:
      assignmentOptionsQuery.isFetching,

    coachingAssignmentsError:
      assignmentOptionsQuery.error,

    refreshCoachingAssignments:
      assignmentOptionsQuery.refetch,

    assignStudent:
      assignStudentMutation.mutateAsync,

    assigningStudent:
      assignStudentMutation.isPending,

    assignStudentError:
      assignStudentMutation.error,

    assignStudentResult:
      assignStudentMutation.data,

    resetAssignStudent:
      assignStudentMutation.reset,

    closeAssignment:
      closeAssignmentMutation.mutateAsync,

    closingAssignment:
      closeAssignmentMutation.isPending,

    closeAssignmentError:
      closeAssignmentMutation.error,

    closeAssignmentResult:
      closeAssignmentMutation.data,

    resetCloseAssignment:
      closeAssignmentMutation.reset,
  };
}

async function invalidateCoachingData(
  queryClient,
  profileId,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [
        "coaching-assignment-options",
        profileId,
      ],
    }),

    queryClient.invalidateQueries({
      queryKey: [
        "coach-dashboard",
      ],
    }),

    queryClient.invalidateQueries({
      queryKey: [
        "super-admin-dashboard",
      ],
    }),

    queryClient.invalidateQueries({
      queryKey: [
        "student-coaching-record",
      ],
    }),
  ]);
}