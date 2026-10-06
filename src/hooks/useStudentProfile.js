import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

import {
  getOrInitializeStudentProfile,
  updateMyProfilePhoto,
  updateMyStudentProfile,
} from "../services/studentService";

export function useStudentProfile() {
  const queryClient =
    useQueryClient();

  const {
    profile,
    role,
    refreshProfile,
  } = useAuth();

  const studentProfileQuery =
    useQuery({
      queryKey: [
        "student-profile",
        profile?.id,
      ],

      queryFn: () =>
        getOrInitializeStudentProfile(
          profile.id,
        ),

      enabled:
        Boolean(profile?.id) &&
        role === "student",

      staleTime: 30 * 1000,
    });

  const updateProfileMutation =
    useMutation({
      mutationFn:
        updateMyStudentProfile,

      onSuccess: async () => {
        await Promise.all([
          refreshProfile(),

          queryClient.invalidateQueries({
            queryKey: [
              "student-profile",
              profile?.id,
            ],
          }),
        ]);
      },

      onError: (error) => {
        console.error(
          "Student profile update failed:",
          error,
        );
      },
    });

  const updatePhotoMutation =
    useMutation({
      mutationFn:
        updateMyProfilePhoto,

      onSuccess: async () => {
        await Promise.all([
          refreshProfile(),

          queryClient.invalidateQueries({
            queryKey: [
              "student-profile",
              profile?.id,
            ],
          }),
        ]);
      },

      onError: (error) => {
        console.error(
          "Profile photo update failed:",
          error,
        );
      },
    });

  return {
    studentProfile:
      studentProfileQuery.data ||
      null,

    studentProfileLoading:
      studentProfileQuery.isLoading,

    studentProfileFetching:
      studentProfileQuery.isFetching,

    studentProfileError:
      studentProfileQuery.error,

    refreshStudentProfile:
      studentProfileQuery.refetch,

    saveStudentProfile:
      updateProfileMutation
        .mutateAsync,

    savingStudentProfile:
      updateProfileMutation.isPending,

    studentProfileSaveError:
      updateProfileMutation.error,

    studentProfileSaveResult:
      updateProfileMutation.data,

    resetStudentProfileSave:
      updateProfileMutation.reset,

    saveProfilePhoto:
      updatePhotoMutation.mutateAsync,

    savingProfilePhoto:
      updatePhotoMutation.isPending,

    profilePhotoError:
      updatePhotoMutation.error,

    profilePhotoResult:
      updatePhotoMutation.data,

    resetProfilePhoto:
      updatePhotoMutation.reset,
  };
}