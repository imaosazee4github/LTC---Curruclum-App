import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  assignStudentProgrammeGroup,
  createTeachingWeek,
  getTeachingWeekDetails,
  getTeachingWeeks,
  getWeeklyPlanningOptions,
  removeWeeklyLesson,
  reviewTeachingWeek,
  saveWeeklyClassPlan,
  saveWeeklyClassStaff,
  saveWeeklyLesson,
  saveWeeklyLessonStaff,
  saveWeeklyLessonWithTeam,
} from "../services/weeklyPlanningService";

const REFRESH_KEYS = [
  "weekly-planning",
  "class-management",
  "student-dashboard",
  "instructor-dashboard",
  "facilitator-dashboard",
  "coach-dashboard",
];

function usePlanningMutation({
  mutationFn,
  enabled,
  resetReview,
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => {
      if (!enabled) {
        throw new Error(
          "You do not have access to weekly planning.",
        );
      }

      return mutationFn(payload);
    },

    onMutate: () => {
      resetReview();
    },

    onSuccess: async () => {
      await Promise.all(
        REFRESH_KEYS.map((key) =>
          queryClient.invalidateQueries({
            queryKey: [key],
          }),
        ),
      );
    },
  });
}

export function useWeeklyPlanning({
  cohortId = "",
  teachingWeekId = "",
} = {}) {
  const { profile, role } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    ["super_admin", "administrator"].includes(role);

  const optionsQuery = useQuery({
    queryKey: [
      "weekly-planning",
      "options",
      profile?.id,
      cohortId,
    ],
    queryFn: () => getWeeklyPlanningOptions(cohortId),
    enabled: enabled && Boolean(cohortId),
    staleTime: 30 * 1000,
  });

  const weeksQuery = useQuery({
    queryKey: [
      "weekly-planning",
      "weeks",
      profile?.id,
      cohortId,
    ],
    queryFn: () => getTeachingWeeks(cohortId),
    enabled: enabled && Boolean(cohortId),
    staleTime: 30 * 1000,
  });

  const detailsQuery = useQuery({
    queryKey: [
      "weekly-planning",
      "details",
      profile?.id,
      cohortId,
      teachingWeekId,
    ],
    queryFn: () =>
      getTeachingWeekDetails(teachingWeekId),
    enabled:
      enabled &&
      Boolean(cohortId) &&
      Boolean(teachingWeekId),
    staleTime: 15 * 1000,
  });

  const reviewMutation = useMutation({
    mutationFn: (payload) => {
      if (!enabled) {
        throw new Error(
          "You do not have access to review this timetable.",
        );
      }

      return reviewTeachingWeek(payload);
    },
  });

  const mutationOptions = {
    enabled,
    resetReview: reviewMutation.reset,
  };

  const createWeek = usePlanningMutation({
    ...mutationOptions,
    mutationFn: createTeachingWeek,
  });

  const assignGroup = usePlanningMutation({
    ...mutationOptions,
    mutationFn: assignStudentProgrammeGroup,
  });

  const saveClassPlan = usePlanningMutation({
    ...mutationOptions,
    mutationFn: saveWeeklyClassPlan,
  });

  const saveClassStaff = usePlanningMutation({
    ...mutationOptions,
    mutationFn: saveWeeklyClassStaff,
  });

  const saveLesson = usePlanningMutation({
    ...mutationOptions,
    mutationFn: saveWeeklyLesson,
  });

  const saveLessonWithTeam = usePlanningMutation({
    ...mutationOptions,
    mutationFn: saveWeeklyLessonWithTeam,
  });

  const removeLesson = usePlanningMutation({
    ...mutationOptions,
    mutationFn: removeWeeklyLesson,
  });

  const saveLessonStaff = usePlanningMutation({
    ...mutationOptions,
    mutationFn: saveWeeklyLessonStaff,
  });

  const weeksData = weeksQuery.data;

  const weeks = Array.isArray(weeksData)
    ? weeksData
    : Array.isArray(weeksData?.weeks)
      ? weeksData.weeks
      : [];

  const selectedWeek =
    detailsQuery.data?.week || null;

  // Only show the review for the currently selected week.
  const reviewResult =
    reviewMutation.variables?.teachingWeekId ===
    teachingWeekId
      ? reviewMutation.data || null
      : null;

  return {
    enabled,

    students: optionsQuery.data?.students || [],
    classes: optionsQuery.data?.classes || [],
    staff: optionsQuery.data?.staff || [],

    weeks,
    selectedWeek,
    plans: detailsQuery.data?.plans || [],

    optionsQuery,
    weeksQuery,
    detailsQuery,

    createWeek,
    assignGroup,
    saveClassPlan,
    saveClassStaff,
    saveLesson,
    saveLessonWithTeam,
    removeLesson,
    saveLessonStaff,

    reviewWeek: reviewMutation,
    reviewResult,

    isDraft: selectedWeek?.status === "draft",

    loading:
      optionsQuery.isLoading ||
      weeksQuery.isLoading ||
      detailsQuery.isLoading,

    fetching:
      optionsQuery.isFetching ||
      weeksQuery.isFetching ||
      detailsQuery.isFetching,

    error:
      optionsQuery.error ||
      weeksQuery.error ||
      detailsQuery.error ||
      null,
  };
}