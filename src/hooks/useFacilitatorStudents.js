import {
  useQuery,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getMyFacilitatorStudents,
} from "../services/facilitatorService";

export function useFacilitatorStudents({
  learningExperienceId = null,
} = {}) {
  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "facilitator";

  const studentsQuery =
    useQuery({
      queryKey: [
        "facilitator-students",
        profile?.id,
        learningExperienceId ||
          "all",
      ],

      queryFn: () =>
        getMyFacilitatorStudents({
          learningExperienceId,
        }),

      enabled,

      staleTime:
        30 * 1000,
    });

  return {
    facilitatorStudentsData:
      studentsQuery.data || null,

    facilitatorExperiences:
      studentsQuery.data
        ?.experiences || [],

    facilitatorStudents:
      studentsQuery.data
        ?.students || [],

    selectedLearningExperienceId:
      studentsQuery.data
        ?.selectedLearningExperienceId ||
      learningExperienceId ||
      null,

    facilitatorStudentsLoading:
      studentsQuery.isLoading,

    facilitatorStudentsFetching:
      studentsQuery.isFetching,

    facilitatorStudentsError:
      studentsQuery.error,

    refreshFacilitatorStudents:
      studentsQuery.refetch,
  };
}