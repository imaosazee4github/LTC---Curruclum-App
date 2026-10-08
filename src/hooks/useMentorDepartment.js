import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  assignStudentToMentor,
  closeMentorAssignment,
  getMentorDepartmentDashboard,
  getMentoringAssignmentOptions,
  getMentoringReportQueue,
  reviewMentorReport,
} from "../services/mentorDepartmentService";

export function useMentorDepartment({
  reportStatus = null,
  attentionLevel = null,
} = {}) {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "mentor_department";


  const dashboardQuery =
    useQuery({
      queryKey: [
        "mentor-department-dashboard",
        profile?.id,
      ],

      queryFn:
        getMentorDepartmentDashboard,

      enabled,

      staleTime:
        30 * 1000,
    });


  const assignmentOptionsQuery =
    useQuery({
      queryKey: [
        "mentoring-assignment-options",
      ],

      queryFn:
        getMentoringAssignmentOptions,

      enabled,

      staleTime:
        30 * 1000,
    });


  const reportQueueQuery =
    useQuery({
      queryKey: [
        "mentoring-report-queue",
        reportStatus,
        attentionLevel,
      ],

      queryFn: () =>
        getMentoringReportQueue({
          status:
            reportStatus,

          attentionLevel,
        }),

      enabled,

      staleTime:
        15 * 1000,
    });


  async function refreshMentoringData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "mentor-department-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "mentoring-assignment-options",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "mentoring-report-queue",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "mentor-dashboard",
        ],
      }),
    ]);
  }


  const assignMutation =
    useMutation({
      mutationFn:
        assignStudentToMentor,

      onSuccess:
        refreshMentoringData,

      onError: (error) => {
        console.error(
          "Mentor assignment failed:",
          error,
        );
      },
    });


  const closeAssignmentMutation =
    useMutation({
      mutationFn:
        closeMentorAssignment,

      onSuccess:
        refreshMentoringData,

      onError: (error) => {
        console.error(
          "Closing mentor assignment failed:",
          error,
        );
      },
    });


  const reviewReportMutation =
    useMutation({
      mutationFn:
        reviewMentorReport,

      onSuccess:
        refreshMentoringData,

      onError: (error) => {
        console.error(
          "Mentor report review failed:",
          error,
        );
      },
    });


  return {
    mentorDepartmentDashboard:
      dashboardQuery.data || null,

    mentorDepartmentLoading:
      dashboardQuery.isLoading,

    mentorDepartmentFetching:
      dashboardQuery.isFetching,

    mentorDepartmentError:
      dashboardQuery.error,

    refreshMentorDepartmentDashboard:
      dashboardQuery.refetch,


    assignmentOptions:
      assignmentOptionsQuery.data ||
      null,

    assignmentOptionsLoading:
      assignmentOptionsQuery
        .isLoading,

    assignmentOptionsFetching:
      assignmentOptionsQuery
        .isFetching,

    assignmentOptionsError:
      assignmentOptionsQuery.error,

    refreshAssignmentOptions:
      assignmentOptionsQuery.refetch,


    mentoringReportQueue:
      reportQueueQuery.data || null,

    mentoringReportQueueLoading:
      reportQueueQuery.isLoading,

    mentoringReportQueueFetching:
      reportQueueQuery.isFetching,

    mentoringReportQueueError:
      reportQueueQuery.error,

    refreshMentoringReportQueue:
      reportQueueQuery.refetch,


    assignMentor:
      assignMutation.mutateAsync,

    assigningMentor:
      assignMutation.isPending,

    assignMentorError:
      assignMutation.error,

    assignMentorResult:
      assignMutation.data,

    resetAssignMentor:
      assignMutation.reset,


    closeAssignment:
      closeAssignmentMutation
        .mutateAsync,

    closingAssignment:
      closeAssignmentMutation
        .isPending,

    closeAssignmentError:
      closeAssignmentMutation.error,

    closeAssignmentResult:
      closeAssignmentMutation.data,

    resetCloseAssignment:
      closeAssignmentMutation.reset,


    reviewReport:
      reviewReportMutation
        .mutateAsync,

    reviewingReport:
      reviewReportMutation.isPending,

    reviewReportError:
      reviewReportMutation.error,

    reviewReportResult:
      reviewReportMutation.data,

    resetReviewReport:
      reviewReportMutation.reset,
  };
}