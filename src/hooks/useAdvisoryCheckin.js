import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import {
  submitAdvisoryCheckin,
} from "../services/advisoryCheckinService";

export function useAdvisoryCheckin() {
  const queryClient = useQueryClient();
  const { profile, role } = useAuth();

  const mutation = useMutation({
    mutationFn: (values) => {
      if (!profile?.id || role !== "mentor") {
        throw new Error(
          "Only an Advisor can submit an advisory update.",
        );
      }

      return submitAdvisoryCheckin(values);
    },

    onSuccess: async () => {
      const queryKeys = [
        ["mentor-dashboard"],
        ["mentor-department-dashboard"],
        ["mentoring-report-queue"],
        ["super-admin-dashboard"],
      ];

      await Promise.all(
        queryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });

  return {
    submitCheckin: mutation.mutateAsync,
    submittingCheckin: mutation.isPending,
    checkinError: mutation.error,
    resetCheckin: mutation.reset,
  };
}