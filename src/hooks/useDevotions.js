import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import {
  getDevotions,
  saveDevotion,
} from "../services/devotionService";

export function useDevotions(startDate, endDate) {
  const { profile, role } = useAuth();
  const queryClient = useQueryClient();

  const canManageDevotions = role === "mentor_department";

  const query = useQuery({
    queryKey: ["devotions", profile?.id, startDate, endDate],
    queryFn: () => getDevotions(startDate, endDate),
    enabled:
      Boolean(profile?.id) &&
      Boolean(startDate) &&
      Boolean(endDate) &&
      endDate >= startDate,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const mutation = useMutation({
    mutationFn: (values) => {
      if (!canManageDevotions) {
        throw new Error(
          "Only the Advisory Department can manage devotions.",
        );
      }

      return saveDevotion(values);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["devotions"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["student-daily-schedule"],
        }),
      ]);
    },
  });

  return {
    devotions: query.data?.devotions ?? [],
    devotionsLoading: query.isLoading,
    devotionsFetching: query.isFetching,
    devotionsError: query.error,
    refreshDevotions: query.refetch,
    canManageDevotions,
    saveDevotion: mutation.mutateAsync,
    savingDevotion: mutation.isPending,
  };
}