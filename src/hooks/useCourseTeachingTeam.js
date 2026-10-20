import { useQuery } from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import { getCourseTeachingTeamOptions } from "../services/weeklyPlanningService";

export function useCourseTeachingTeam(classId) {
  const { profile, role } = useAuth();

  return useQuery({
    queryKey: [
      "weekly-planning",
      "course-team",
      profile?.id,
      classId,
    ],
    queryFn: () => getCourseTeachingTeamOptions(classId),
    enabled:
      Boolean(profile?.id && classId) &&
      ["super_admin", "administrator"].includes(role),
    staleTime: 0,
  });
}