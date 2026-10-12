import { supabase } from "../lib/supabase";

export async function getCoachOversightData() {
  const { data, error } =
    await supabase.rpc(
      "get_coach_oversight_data",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: Boolean(data?.success),

    summary: {
      totalCoaches:
        Number(
          data?.summary
            ?.totalCoaches,
        ) || 0,

      activeAssignments:
        Number(
          data?.summary
            ?.activeAssignments,
        ) || 0,

      pausedAssignments:
        Number(
          data?.summary
            ?.pausedAssignments,
        ) || 0,

      completedAssignments:
        Number(
          data?.summary
            ?.completedAssignments,
        ) || 0,

      activeStudents:
        Number(
          data?.summary
            ?.activeStudents,
        ) || 0,

      overdueAssignments:
        Number(
          data?.summary
            ?.overdueAssignments,
        ) || 0,

      totalSessions:
        Number(
          data?.summary
            ?.totalSessions,
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

    coaches:
      Array.isArray(data?.coaches)
        ? data.coaches
        : [],

    assignments:
      Array.isArray(
        data?.assignments,
      )
        ? data.assignments
        : [],

    sessions:
      Array.isArray(data?.sessions)
        ? data.sessions
        : [],

    followUps:
      Array.isArray(data?.followUps)
        ? data.followUps
        : [],
  };
}