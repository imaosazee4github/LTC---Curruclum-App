import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getMyApprovedMentorFeedback,
  getMyAssignedMentor,
  getOrInitializeStudentProfile,
  updateMyProfilePhoto,
  updateMyStudentProfile,
} from "../services/studentService";

export function useStudentProfile() {
  const queryClient = useQueryClient();

  const { profile, role, refreshProfile } = useAuth();

  const studentProfileQuery = useQuery({
    queryKey: ["student-profile", profile?.id],

    queryFn: () => getOrInitializeStudentProfile(profile.id),

    enabled: Boolean(profile?.id) && role === "student",

    staleTime: 30 * 1000,
  });

  const mentorFeedbackQuery = useQuery({
    queryKey: ["student-mentor-feedback", profile?.id],

    queryFn: getMyApprovedMentorFeedback,

    enabled: Boolean(profile?.id) && role === "student",

    staleTime: 30 * 1000,
  });

  const assignedMentorQuery = useQuery({
    queryKey: ["student-assigned-mentor", profile?.id],

    queryFn: getMyAssignedMentor,

    enabled: Boolean(profile?.id) && role === "student",

    staleTime: 30 * 1000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateMyStudentProfile,

    onSuccess: async () => {
      await Promise.all([
        refreshProfile(),

        queryClient.invalidateQueries({
          queryKey: ["student-profile", profile?.id],
        }),
      ]);
    },

    onError: (error) => {
      console.error("Student profile update failed:", error);
    },
  });

  const updatePhotoMutation = useMutation({
    mutationFn: updateMyProfilePhoto,

    onSuccess: async () => {
      await Promise.all([
        refreshProfile(),

        queryClient.invalidateQueries({
          queryKey: ["student-profile", profile?.id],
        }),
      ]);
    },

    onError: (error) => {
      console.error("Profile photo update failed:", error);
    },
  });

  return {
    studentProfile: studentProfileQuery.data || null,

    studentProfileLoading: studentProfileQuery.isLoading,

    studentProfileFetching: studentProfileQuery.isFetching,

    studentProfileError: studentProfileQuery.error,

    refreshStudentProfile: studentProfileQuery.refetch,

    assignedMentor: assignedMentorQuery.data || null,

    assignedMentorLoading: assignedMentorQuery.isLoading,

    assignedMentorFetching: assignedMentorQuery.isFetching,

    assignedMentorError: assignedMentorQuery.error,

    refreshAssignedMentor: assignedMentorQuery.refetch,

    saveStudentProfile: updateProfileMutation.mutateAsync,

    savingStudentProfile: updateProfileMutation.isPending,

    studentProfileSaveError: updateProfileMutation.error,

    studentProfileSaveResult: updateProfileMutation.data,

    resetStudentProfileSave: updateProfileMutation.reset,

    saveProfilePhoto: updatePhotoMutation.mutateAsync,

    savingProfilePhoto: updatePhotoMutation.isPending,

    profilePhotoError: updatePhotoMutation.error,

    profilePhotoResult: updatePhotoMutation.data,

    resetProfilePhoto: updatePhotoMutation.reset,

    mentorFeedback: mentorFeedbackQuery.data || null,

    approvedMentorFeedback: mentorFeedbackQuery.data?.feedback || [],

    approvedMentorFeedbackCount:
      mentorFeedbackQuery.data?.summary?.approvedFeedback || 0,

    mentorFeedbackLoading: mentorFeedbackQuery.isLoading,

    mentorFeedbackFetching: mentorFeedbackQuery.isFetching,

    mentorFeedbackError: mentorFeedbackQuery.error,

    refreshMentorFeedback: mentorFeedbackQuery.refetch,
  };
}
