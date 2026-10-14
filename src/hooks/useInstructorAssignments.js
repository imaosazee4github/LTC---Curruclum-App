import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  createWeeklyClassAssignment,
  getMyInstructorAssignmentData,
} from "../services/instructorAssignmentService";

export function useInstructorAssignments() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "instructor";

  const assignmentQuery =
    useQuery({
      queryKey: [
        "instructor-assignments",
        profile?.id,
      ],

      queryFn:
        getMyInstructorAssignmentData,

      enabled,

      staleTime:
        30 * 1000,
    });

  async function refreshAssignmentData() {
    await Promise.all([
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

  const createMutation =
    useMutation({
      mutationFn:
        createWeeklyClassAssignment,

      onSuccess:
        refreshAssignmentData,

      onError: (error) => {
        console.error(
          "Creating weekly assignment failed:",
          error,
        );
      },
    });

  return {
    assignmentData:
      assignmentQuery.data || null,

    assignmentSummary:
      assignmentQuery.data
        ?.summary || null,

    instructorClasses:
      assignmentQuery.data
        ?.classes || [],

    assignments:
      assignmentQuery.data
        ?.assignments || [],

    assignmentsLoading:
      assignmentQuery.isLoading,

    assignmentsFetching:
      assignmentQuery.isFetching,

    assignmentsError:
      assignmentQuery.error,

    refreshAssignments:
      assignmentQuery.refetch,

    createAssignment:
      createMutation.mutateAsync,

    creatingAssignment:
      createMutation.isPending,

    createAssignmentError:
      createMutation.error,

    createAssignmentResult:
      createMutation.data,

    resetCreateAssignment:
      createMutation.reset,
  };
}