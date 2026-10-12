import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  assignFacilitatorToLearningExperience,
  closeLearningExperienceFacilitatorAssignment,
  createLearningExperience,
  createLearningExperienceSession,
  getLearningExperienceManagementData,
} from "../services/superAdminService";

export function useLearningExperienceManagement() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "super_admin";

  const managementQuery =
    useQuery({
      queryKey: [
        "learning-experience-management",
      ],

      queryFn:
        getLearningExperienceManagementData,

      enabled,

      staleTime:
        30 * 1000,
    });

  async function refreshLearningExperienceData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "learning-experience-management",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "facilitator-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "facilitator-students",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "super-admin-dashboard",
        ],
      }),
    ]);
  }

  const createExperienceMutation =
    useMutation({
      mutationFn:
        createLearningExperience,

      onSuccess:
        refreshLearningExperienceData,

      onError: (error) => {
        console.error(
          "Creating learning experience failed:",
          error,
        );
      },
    });

  const assignFacilitatorMutation =
    useMutation({
      mutationFn:
        assignFacilitatorToLearningExperience,

      onSuccess:
        refreshLearningExperienceData,

      onError: (error) => {
        console.error(
          "Assigning facilitator failed:",
          error,
        );
      },
    });

  const closeAssignmentMutation =
    useMutation({
      mutationFn:
        closeLearningExperienceFacilitatorAssignment,

      onSuccess:
        refreshLearningExperienceData,

      onError: (error) => {
        console.error(
          "Closing facilitator assignment failed:",
          error,
        );
      },
    });

  const createSessionMutation =
    useMutation({
      mutationFn:
        createLearningExperienceSession,

      onSuccess:
        refreshLearningExperienceData,

      onError: (error) => {
        console.error(
          "Creating learning-experience session failed:",
          error,
        );
      },
    });

  return {
    learningExperienceData:
      managementQuery.data || null,

    learningExperienceSummary:
      managementQuery.data
        ?.summary || null,

    learningExperiences:
      managementQuery.data
        ?.experiences || [],

    eligibleFacilitators:
      managementQuery.data
        ?.facilitators || [],

    programmeCohorts:
      managementQuery.data
        ?.cohorts || [],

    learningExperiencesLoading:
      managementQuery.isLoading,

    learningExperiencesFetching:
      managementQuery.isFetching,

    learningExperiencesError:
      managementQuery.error,

    refreshLearningExperiences:
      managementQuery.refetch,

    createExperience:
      createExperienceMutation
        .mutateAsync,

    creatingExperience:
      createExperienceMutation
        .isPending,

    createExperienceError:
      createExperienceMutation.error,

    createExperienceResult:
      createExperienceMutation.data,

    resetCreateExperience:
      createExperienceMutation.reset,

    assignFacilitator:
      assignFacilitatorMutation
        .mutateAsync,

    assigningFacilitator:
      assignFacilitatorMutation
        .isPending,

    assignFacilitatorError:
      assignFacilitatorMutation.error,

    assignFacilitatorResult:
      assignFacilitatorMutation.data,

    resetAssignFacilitator:
      assignFacilitatorMutation.reset,

    closeFacilitatorAssignment:
      closeAssignmentMutation
        .mutateAsync,

    closingFacilitatorAssignment:
      closeAssignmentMutation
        .isPending,

    closeFacilitatorAssignmentError:
      closeAssignmentMutation.error,

    closeFacilitatorAssignmentResult:
      closeAssignmentMutation.data,

    resetCloseFacilitatorAssignment:
      closeAssignmentMutation.reset,

    createSession:
      createSessionMutation
        .mutateAsync,

    creatingSession:
      createSessionMutation
        .isPending,

    createSessionError:
      createSessionMutation.error,

    createSessionResult:
      createSessionMutation.data,

    resetCreateSession:
      createSessionMutation.reset,
  };
}