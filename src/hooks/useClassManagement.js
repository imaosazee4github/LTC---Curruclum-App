import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  createClassSchedule,
  createClassSession,
  createProgrammeClass,
  getClassManagementData,
  syncClassEnrollments,
  updateClassroomAccess,
} from "../services/classManagementService";

export function useClassManagement() {
  const queryClient = useQueryClient();
  const { profile, role } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "super_admin";

  const queryKey = [
    "class-management",
    profile?.id,
  ];

  const managementQuery = useQuery({
    queryKey,
    queryFn: getClassManagementData,
    enabled,
    staleTime: 30 * 1000,
  });

  async function refreshClassManagement() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey,
      }),

      queryClient.invalidateQueries({
        queryKey: ["student-dashboard"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["instructor-dashboard"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["facilitator-dashboard"],
      }),
    ]);
  }

  const createClassMutation = useMutation({
    mutationFn: createProgrammeClass,
    onSuccess: refreshClassManagement,

    onError: (error) => {
      console.error(
        "Creating class failed:",
        error,
      );
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: createClassSchedule,
    onSuccess: refreshClassManagement,

    onError: (error) => {
      console.error(
        "Creating class schedule failed:",
        error,
      );
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: createClassSession,
    onSuccess: refreshClassManagement,

    onError: (error) => {
      console.error(
        "Creating class session failed:",
        error,
      );
    },
  });

  const syncEnrollmentsMutation = useMutation({
    mutationFn: syncClassEnrollments,
    onSuccess: refreshClassManagement,

    onError: (error) => {
      console.error(
        "Synchronizing class enrolments failed:",
        error,
      );
    },
  });

  const classroomAccessMutation = useMutation({
    mutationFn: updateClassroomAccess,
    onSuccess: refreshClassManagement,

    onError: (error) => {
      console.error(
        "Updating Google Classroom access failed:",
        error,
      );
    },
  });

  return {
    classManagement:
      managementQuery.data || null,

    classes:
      managementQuery.data?.classes || [],

    classCourses:
      managementQuery.data?.courses || [],

    classCohorts:
      managementQuery.data?.cohorts || [],

    classSummary:
      managementQuery.data?.summary || null,

    classManagementLoading:
      managementQuery.isLoading,

    classManagementFetching:
      managementQuery.isFetching,

    classManagementError:
      managementQuery.error,

    refreshClassManagement:
      managementQuery.refetch,

    createClass:
      createClassMutation.mutateAsync,

    creatingClass:
      createClassMutation.isPending,

    createClassError:
      createClassMutation.error,

    resetCreateClass:
      createClassMutation.reset,

    createSchedule:
      createScheduleMutation.mutateAsync,

    creatingSchedule:
      createScheduleMutation.isPending,

    createScheduleError:
      createScheduleMutation.error,

    resetCreateSchedule:
      createScheduleMutation.reset,

    createSession:
      createSessionMutation.mutateAsync,

    creatingSession:
      createSessionMutation.isPending,

    createSessionError:
      createSessionMutation.error,

    resetCreateSession:
      createSessionMutation.reset,

    syncEnrollments:
      syncEnrollmentsMutation.mutateAsync,

    syncingEnrollments:
      syncEnrollmentsMutation.isPending,

    syncEnrollmentsError:
      syncEnrollmentsMutation.error,

    resetSyncEnrollments:
      syncEnrollmentsMutation.reset,

    updateClassroom:
      classroomAccessMutation.mutateAsync,

    updatingClassroom:
      classroomAccessMutation.isPending,

    updateClassroomError:
      classroomAccessMutation.error,

    resetUpdateClassroom:
      classroomAccessMutation.reset,
  };
}