import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getMyInstructorDashboard,
  getMyInstructorStudents,
  recordStudentAttendance,
  recordStudentLearning,
} from "../services/instructorService";

export function useInstructorDashboard({
  classId = null,
} = {}) {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "instructor";


  const dashboardQuery =
    useQuery({
      queryKey: [
        "instructor-dashboard",
        profile?.id,
      ],

      queryFn:
        getMyInstructorDashboard,

      enabled,

      staleTime:
        30 * 1000,
    });


  const studentsQuery =
    useQuery({
      queryKey: [
        "instructor-students",
        profile?.id,
        classId,
      ],

      queryFn: () =>
        getMyInstructorStudents({
          classId,
        }),

      enabled,

      staleTime:
        30 * 1000,
    });


  async function refreshInstructorData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "instructor-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "instructor-students",
        ],
      }),
    ]);
  }


  const attendanceMutation =
    useMutation({
      mutationFn:
        recordStudentAttendance,

      onSuccess:
        refreshInstructorData,

      onError: (error) => {
        console.error(
          "Recording attendance failed:",
          error,
        );
      },
    });


  const learningMutation =
    useMutation({
      mutationFn:
        recordStudentLearning,

      onSuccess:
        refreshInstructorData,

      onError: (error) => {
        console.error(
          "Recording student learning failed:",
          error,
        );
      },
    });


  return {
    instructorDashboard:
      dashboardQuery.data || null,

    instructorDashboardLoading:
      dashboardQuery.isLoading,

    instructorDashboardFetching:
      dashboardQuery.isFetching,

    instructorDashboardError:
      dashboardQuery.error,

    refreshInstructorDashboard:
      dashboardQuery.refetch,


    instructorStudents:
      studentsQuery.data?.students ||
      [],

    instructorStudentSummary:
      studentsQuery.data || null,

    instructorStudentsLoading:
      studentsQuery.isLoading,

    instructorStudentsFetching:
      studentsQuery.isFetching,

    instructorStudentsError:
      studentsQuery.error,

    refreshInstructorStudents:
      studentsQuery.refetch,


    saveAttendance:
      attendanceMutation.mutateAsync,

    savingAttendance:
      attendanceMutation.isPending,

    attendanceError:
      attendanceMutation.error,

    attendanceResult:
      attendanceMutation.data,

    resetAttendance:
      attendanceMutation.reset,


    saveLearningRecord:
      learningMutation.mutateAsync,

    savingLearningRecord:
      learningMutation.isPending,

    learningRecordError:
      learningMutation.error,

    learningRecordResult:
      learningMutation.data,

    resetLearningRecord:
      learningMutation.reset,
  };
}