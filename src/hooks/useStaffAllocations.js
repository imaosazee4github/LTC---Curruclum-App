import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  assignFacilitatorToLearningExperience,
  assignStaffToClass,
  assignSupervisorToProject,
  closeStaffClassAssignment,
  closeSupervisorProjectAssignment,
  getStaffAllocationManagementData,
  getSupervisorAllocationOptions,
} from "../services/staffAllocationService";

import {
  assignStudentToCoach,
  closeCoachingAssignment,
  getCoachingAssignmentOptions,
} from "../services/superAdminService";

export function useStaffAllocations() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
  } = useAuth();

  const enabled =
    Boolean(profile?.id) &&
    role === "super_admin";

  const classQuery =
    useQuery({
      queryKey: [
        "staff-allocation-management",
      ],

      queryFn:
        getStaffAllocationManagementData,

      enabled,

      staleTime:
        30 * 1000,
    });

  const coachingQuery =
    useQuery({
      queryKey: [
        "coaching-assignment-options",
        profile?.id,
      ],

      queryFn:
        getCoachingAssignmentOptions,

      enabled,

      staleTime:
        30 * 1000,
    });

  const supervisorQuery =
    useQuery({
      queryKey: [
        "supervisor-allocation-options",
      ],

      queryFn:
        getSupervisorAllocationOptions,

      enabled,

      staleTime:
        30 * 1000,
    });

  async function refreshAllocationData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "staff-allocation-management",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "learning-experience-management",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "coaching-assignment-options",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "supervisor-allocation-options",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "class-management",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "instructor-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "facilitator-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "coach-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "student-coaching-record",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "super-admin-dashboard",
        ],
      }),
    ]);
  }

  const assignClassMutation =
    useMutation({
      mutationFn:
        assignStaffToClass,

      onSuccess:
        refreshAllocationData,

      onError: (error) => {
        console.error(
          "Staff class allocation failed:",
          error,
        );
      },
    });

      const assignFacilitatorMutation =
    useMutation({
      mutationFn:
        assignFacilitatorToLearningExperience,

      onSuccess:
        refreshAllocationData,

      onError: (error) => {
        console.error(
          "Facilitator learning experience allocation failed:",
          error,
        );
      },
    });

  const closeClassMutation =
    useMutation({
      mutationFn:
        closeStaffClassAssignment,

      onSuccess:
        refreshAllocationData,

      onError: (error) => {
        console.error(
          "Closing staff class allocation failed:",
          error,
        );
      },
    });

  const assignCoachMutation =
    useMutation({
      mutationFn:
        assignStudentToCoach,

      onSuccess:
        refreshAllocationData,

      onError: (error) => {
        console.error(
          "Student coaching allocation failed:",
          error,
        );
      },
    });

  const closeCoachMutation =
    useMutation({
      mutationFn:
        closeCoachingAssignment,

      onSuccess:
        refreshAllocationData,

      onError: (error) => {
        console.error(
          "Closing coaching allocation failed:",
          error,
        );
      },
    });

  const assignSupervisorMutation =
    useMutation({
      mutationFn:
        assignSupervisorToProject,

      onSuccess:
        refreshAllocationData,

      onError: (error) => {
        console.error(
          "Supervisor project allocation failed:",
          error,
        );
      },
    });

  const closeSupervisorMutation =
    useMutation({
      mutationFn:
        closeSupervisorProjectAssignment,

      onSuccess:
        refreshAllocationData,

      onError: (error) => {
        console.error(
          "Closing supervisor allocation failed:",
          error,
        );
      },
    });

  return {
    allocationManagement:
      classQuery.data || null,

    coachingManagement:
      coachingQuery.data || null,

    supervisorManagement:
      supervisorQuery.data || null,

    allocationManagementLoading:
      classQuery.isLoading ||
      coachingQuery.isLoading ||
      supervisorQuery.isLoading,

    allocationManagementFetching:
      classQuery.isFetching ||
      coachingQuery.isFetching ||
      supervisorQuery.isFetching,

    allocationManagementError:
      classQuery.error ||
      coachingQuery.error ||
      supervisorQuery.error,

    refreshAllocations:
      refreshAllocationData,

    assignStaff:
      assignClassMutation.mutateAsync,

    assigningStaff:
      assignClassMutation.isPending,

    assignStaffError:
      assignClassMutation.error,

    resetAssignStaff:
      assignClassMutation.reset,

    assignFacilitator:
      assignFacilitatorMutation.mutateAsync,

    assigningFacilitator:
      assignFacilitatorMutation.isPending,

    assignFacilitatorError:
      assignFacilitatorMutation.error,

    resetAssignFacilitator:
      assignFacilitatorMutation.reset,

    closeAllocation:
      closeClassMutation.mutateAsync,

    closingAllocation:
      closeClassMutation.isPending,

    closeAllocationError:
      closeClassMutation.error,

    assignCoach:
      assignCoachMutation.mutateAsync,

    assigningCoach:
      assignCoachMutation.isPending,

    assignCoachError:
      assignCoachMutation.error,

    resetAssignCoach:
      assignCoachMutation.reset,

    closeCoachAllocation:
      closeCoachMutation.mutateAsync,

    closingCoachAllocation:
      closeCoachMutation.isPending,

    closeCoachAllocationError:
      closeCoachMutation.error,

    assignSupervisor:
      assignSupervisorMutation.mutateAsync,

    assigningSupervisor:
      assignSupervisorMutation.isPending,

    assignSupervisorError:
      assignSupervisorMutation.error,

    resetAssignSupervisor:
      assignSupervisorMutation.reset,

    closeSupervisorAllocation:
      closeSupervisorMutation.mutateAsync,

    closingSupervisorAllocation:
      closeSupervisorMutation.isPending,

    closeSupervisorAllocationError:
      closeSupervisorMutation.error,
  };
}