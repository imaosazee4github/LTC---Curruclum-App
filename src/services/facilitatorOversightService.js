import { supabase } from "../lib/supabase";

export async function getFacilitatorOversightData() {
  const { data, error } =
    await supabase.rpc(
      "get_facilitator_oversight_data",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: Boolean(data?.success),

    summary: {
      totalFacilitators:
        Number(
          data?.summary
            ?.totalFacilitators,
        ) || 0,

      activeExperiences:
        Number(
          data?.summary
            ?.activeExperiences,
        ) || 0,

      activeStudents:
        Number(
          data?.summary
            ?.activeStudents,
        ) || 0,

      scheduledSessions:
        Number(
          data?.summary
            ?.scheduledSessions,
        ) || 0,

      completedSessions:
        Number(
          data?.summary
            ?.completedSessions,
        ) || 0,

      engagementRecorded:
        Number(
          data?.summary
            ?.engagementRecorded,
        ) || 0,

      engagementPending:
        Number(
          data?.summary
            ?.engagementPending,
        ) || 0,

      followUpsRequired:
        Number(
          data?.summary
            ?.followUpsRequired,
        ) || 0,

      openFollowUps:
        Number(
          data?.summary
            ?.openFollowUps,
        ) || 0,

      overdueFollowUps:
        Number(
          data?.summary
            ?.overdueFollowUps,
        ) || 0,
    },

    facilitators:
      Array.isArray(
        data?.facilitators,
      )
        ? data.facilitators
        : [],

    experiences:
      Array.isArray(
        data?.experiences,
      )
        ? data.experiences
        : [],

    engagementRecords:
      Array.isArray(
        data?.engagementRecords,
      )
        ? data.engagementRecords
        : [],

    followUps:
      Array.isArray(
        data?.followUps,
      )
        ? data.followUps
        : [],
  };
}