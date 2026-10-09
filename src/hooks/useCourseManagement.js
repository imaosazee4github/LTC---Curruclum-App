import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  assignCourseInstructor,
  closeCourseInstructorAssignment,
  createCourse,
  getCourseManagementData,
} from "../services/superAdminService";

export function useCourseManagement() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "super_admin";

  const courseManagementQuery =
    useQuery({
      queryKey: [
        "course-management",
      ],

      queryFn:
        getCourseManagementData,

      enabled,

      staleTime:
        30 * 1000,
    });

  async function refreshCourseData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "course-management",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "super-admin-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "instructor-dashboard",
        ],
      }),
    ]);
  }

  const createCourseMutation =
    useMutation({
      mutationFn:
        createCourse,

      onSuccess:
        refreshCourseData,

      onError: (error) => {
        console.error(
          "Course creation failed:",
          error,
        );
      },
    });

  const assignInstructorMutation =
    useMutation({
      mutationFn:
        assignCourseInstructor,

      onSuccess:
        refreshCourseData,

      onError: (error) => {
        console.error(
          "Instructor assignment failed:",
          error,
        );
      },
    });

  const closeAssignmentMutation =
    useMutation({
      mutationFn:
        closeCourseInstructorAssignment,

      onSuccess:
        refreshCourseData,

      onError: (error) => {
        console.error(
          "Closing course assignment failed:",
          error,
        );
      },
    });

  return {
    courseManagement:
      courseManagementQuery.data ||
      null,

    courseManagementLoading:
      courseManagementQuery.isLoading,

    courseManagementFetching:
      courseManagementQuery.isFetching,

    courseManagementError:
      courseManagementQuery.error,

    refreshCourseManagement:
      courseManagementQuery.refetch,

    createCourse:
      createCourseMutation
        .mutateAsync,

    creatingCourse:
      createCourseMutation
        .isPending,

    createCourseError:
      createCourseMutation.error,

    createCourseResult:
      createCourseMutation.data,

    resetCreateCourse:
      createCourseMutation.reset,

    assignInstructor:
      assignInstructorMutation
        .mutateAsync,

    assigningInstructor:
      assignInstructorMutation
        .isPending,

    assignInstructorError:
      assignInstructorMutation.error,

    assignInstructorResult:
      assignInstructorMutation.data,

    resetAssignInstructor:
      assignInstructorMutation.reset,

    closeInstructorAssignment:
      closeAssignmentMutation
        .mutateAsync,

    closingInstructorAssignment:
      closeAssignmentMutation
        .isPending,

    closeInstructorAssignmentError:
      closeAssignmentMutation.error,

    closeInstructorAssignmentResult:
      closeAssignmentMutation.data,

    resetCloseInstructorAssignment:
      closeAssignmentMutation.reset,
  };
}