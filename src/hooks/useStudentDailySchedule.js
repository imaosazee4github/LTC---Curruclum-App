import { useQuery } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import {
  getMyStudentDailySchedule,
} from "../services/studentService";

export function useStudentDailySchedule(date) {
  const { profile, role } = useAuth();

  const scheduleQuery = useQuery({
    queryKey: [
      "student-daily-schedule",
      profile?.id,
      date,
    ],

    queryFn: () => getMyStudentDailySchedule(date),

    enabled:
      Boolean(profile?.id) &&
      role === "student" &&
      Boolean(date),

    staleTime: 30 * 1000,
  });

  return {
    activities: scheduleQuery.data?.activities ?? [],
    scheduleTimezone:
      scheduleQuery.data?.timezone ?? "Africa/Lagos",
    scheduleLoading: scheduleQuery.isLoading,
    scheduleFetching: scheduleQuery.isFetching,
    scheduleError: scheduleQuery.error,
    refreshSchedule: scheduleQuery.refetch,
  };
}