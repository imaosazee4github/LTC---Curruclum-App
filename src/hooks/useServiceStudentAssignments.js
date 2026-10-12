import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  assignStudentToServiceSchedule,
  getServiceStudentAssignmentOptions,
} from "../services/supervisorService";

export function useServiceStudentAssignments() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "supervisor";

  const optionsQuery =
    useQuery({
      queryKey: [
        "service-student-assignments",
        profile?.id,
      ],

      queryFn:
        getServiceStudentAssignmentOptions,

      enabled,

      staleTime:
        30 * 1000,
    });

  async function refreshAssignmentData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "service-student-assignments",
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
    ]);
  }

  const assignStudentMutation =
    useMutation({
      mutationFn:
        assignStudentToServiceSchedule,

      onSuccess:
        refreshAssignmentData,

      onError: (error) => {
        console.error(
          "Service student assignment failed:",
          error,
        );
      },
    });

  const data =
    optionsQuery.data;

  return {
    assignmentOptions:
      data || null,

    serviceStudents:
      data?.students || [],

    serviceSchedules:
      data?.schedules || [],

    serviceAssignments:
      data?.assignments || [],

    serviceAssignmentsLoading:
      optionsQuery.isLoading,

    serviceAssignmentsFetching:
      optionsQuery.isFetching,

    serviceAssignmentsError:
      optionsQuery.error,

    refreshServiceAssignments:
      optionsQuery.refetch,

    assignStudent:
      assignStudentMutation
        .mutateAsync,

    assigningStudent:
      assignStudentMutation
        .isPending,

    assignStudentError:
      assignStudentMutation.error,

    assignStudentResult:
      assignStudentMutation.data,

    resetAssignStudent:
      assignStudentMutation.reset,
  };
}