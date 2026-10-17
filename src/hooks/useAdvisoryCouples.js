import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  assignStudentToAdvisoryCouple,
  createAdvisoryCouple,
  getAdvisoryCoupleOptions,
} from "../services/advisoryCoupleService";

import {
  getMentoringAssignmentOptions,
} from "../services/mentorDepartmentService";

export function useAdvisoryCouples() {
  const queryClient = useQueryClient();
  const { profile, role } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "mentor_department";

  const optionsQuery = useQuery({
    queryKey: ["advisory-couple-options", profile?.id],

    queryFn: async () => {
      const [coupleOptions, assignmentOptions] =
        await Promise.all([
          getAdvisoryCoupleOptions(),
          getMentoringAssignmentOptions(),
        ]);

      if (!assignmentOptions?.success) {
        throw new Error("Student assignment options could not be loaded.");
      }

      return {
        ...coupleOptions,

        students: (
          assignmentOptions.studentsAwaitingAssignment || []
        ).filter(
          (student) => student.enrollment_status === "active",
        ),
      };
    },

    enabled,
    staleTime: 15 * 1000,
  });

  async function refreshRelatedData() {
    const queryKeys = [
      ["advisory-couple-options"],
      ["mentoring-assignment-options"],
      ["mentor-department-dashboard"],
      ["mentor-dashboard"],
      ["super-admin-dashboard"],
    ];

    await Promise.all(
      queryKeys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
  }

  const createMutation = useMutation({
    mutationFn: (values) => {
      if (!enabled) {
        throw new Error(
          "Only the Advisory Department can create couples.",
        );
      }

      return createAdvisoryCouple(values);
    },

    onSuccess: refreshRelatedData,
  });

  const assignMutation = useMutation({
    mutationFn: (values) => {
      if (!enabled) {
        throw new Error(
          "Only the Advisory Department can assign students.",
        );
      }

      return assignStudentToAdvisoryCouple(values);
    },

    onSuccess: refreshRelatedData,
  });

  return {
    couples: optionsQuery.data?.couples ?? [],
    availableAdvisors:
      optionsQuery.data?.availableAdvisors ?? [],
    students: optionsQuery.data?.students ?? [],

    loading: optionsQuery.isLoading,
    fetching: optionsQuery.isFetching,
    error: optionsQuery.error,
    refresh: optionsQuery.refetch,

    createCouple: createMutation.mutateAsync,
    creatingCouple: createMutation.isPending,
    createCoupleError: createMutation.error,
    resetCreateCouple: createMutation.reset,

    assignStudent: assignMutation.mutateAsync,
    assigningStudent: assignMutation.isPending,
    assignStudentError: assignMutation.error,
    resetAssignStudent: assignMutation.reset,
  };
}