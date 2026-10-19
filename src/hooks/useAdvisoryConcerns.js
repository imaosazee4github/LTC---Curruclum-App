import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import {
  getAdvisoryStudentConcerns,
  getMyFacilitatorAdvisoryUpdates,
  updateMyAdvisoryConcern,
} from "../services/advisoryConcernService";

export function useAdvisoryConcerns() {
  const queryClient = useQueryClient();
  const { profile, role } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    ["mentor", "mentor_department"].includes(role);

  const concernsQuery = useQuery({
    queryKey: ["advisory-student-concerns", profile?.id, role],
    queryFn: getAdvisoryStudentConcerns,
    enabled,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const updateMutation = useMutation({
    mutationFn: (values) => {
      if (!profile?.id || role !== "mentor") {
        throw new Error(
          "Sign in as an assigned advisor to update this concern.",
        );
      }

      return updateMyAdvisoryConcern(values);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["advisory-student-concerns"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["facilitator-advisory-updates"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["mentor-dashboard"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["mentor-department-dashboard"],
        }),
      ]);
    },
  });

  return {
    concerns: concernsQuery.data?.concerns || [],
    concernsLoading: concernsQuery.isLoading,
    concernsFetching: concernsQuery.isFetching,
    concernsError: concernsQuery.error,
    refreshConcerns: concernsQuery.refetch,

    updateConcern: updateMutation.mutateAsync,
    updatingConcern: updateMutation.isPending,
    updateConcernError: updateMutation.error,
    resetUpdateConcern: updateMutation.reset,
  };
}

export function useFacilitatorAdvisoryUpdates() {
  const { profile, role } = useAuth();

  const updatesQuery = useQuery({
    queryKey: ["facilitator-advisory-updates", profile?.id],
    queryFn: getMyFacilitatorAdvisoryUpdates,
    enabled: Boolean(profile?.id) && role === "facilitator",
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    updates: updatesQuery.data?.updates || [],
    updatesLoading: updatesQuery.isLoading,
    updatesFetching: updatesQuery.isFetching,
    updatesError: updatesQuery.error,
    refreshUpdates: updatesQuery.refetch,
  };
}