import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import {
  createAdvisoryFollowUp,
  getMyAdvisoryFollowUps,
  updateAdvisoryFollowUp,
} from "../services/advisoryFollowUpService";

export function useAdvisoryFollowUps() {
  const queryClient = useQueryClient();
  const { profile, role } = useAuth();

  const enabled = Boolean(profile?.id) && role === "mentor";

  const actionsQuery = useQuery({
    queryKey: ["advisory-follow-ups", profile?.id],
    queryFn: getMyAdvisoryFollowUps,
    enabled,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  function requireAdvisor() {
    if (!enabled) {
      throw new Error("Sign in with your advisor account to continue.");
    }
  }

  async function refreshRelatedData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["advisory-follow-ups"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["mentor-dashboard"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["mentor-department-dashboard"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["super-admin-dashboard"],
      }),
    ]);
  }

  const createMutation = useMutation({
    mutationFn: (values) => {
      requireAdvisor();
      return createAdvisoryFollowUp(values);
    },
    onSuccess: refreshRelatedData,
  });

  const updateMutation = useMutation({
    mutationFn: (values) => {
      requireAdvisor();
      return updateAdvisoryFollowUp(values);
    },
    onSuccess: refreshRelatedData,
  });

  return {
    actions: actionsQuery.data?.actions || [],
    actionsLoading: actionsQuery.isLoading,
    actionsFetching: actionsQuery.isFetching,
    actionsError: actionsQuery.error,
    refreshActions: actionsQuery.refetch,

    createAction: createMutation.mutateAsync,
    creatingAction: createMutation.isPending,
    createActionError: createMutation.error,
    resetCreateAction: createMutation.reset,

    updateAction: updateMutation.mutateAsync,
    updatingAction: updateMutation.isPending,
    updateActionError: updateMutation.error,
    resetUpdateAction: updateMutation.reset,
  };
}