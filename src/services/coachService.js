import { supabase } from "../lib/supabase";

export async function getMyCoachDashboard() {
  const { data, error } =
    await supabase.rpc(
      "get_my_coach_dashboard",
    );

  if (error) {
    throw new Error(error.message);
  }

  return normalizeCoachDashboard(
    data,
  );
}

export async function recordCoachingSession({
  assignmentId,
  sessionSummary,
  feedback,
  sessionDate,
  performance,
  practice,
  progress,
  improvement,
  challenges,
  support,
  nextGoal,
  practiceAdjustment,
  followUpRequired,
  followUpImprovementArea,
  followUpAction,
  followUpDueDate,
}) {
  if (!assignmentId) {
    throw new Error(
      "Select a coaching assignment.",
    );
  }

  if (!sessionSummary?.trim()) {
    throw new Error(
      "Enter the coaching session summary.",
    );
  }

  if (!feedback?.trim()) {
    throw new Error(
      "Enter the coaching feedback.",
    );
  }

  if (
    followUpRequired &&
    !followUpImprovementArea?.trim()
  ) {
    throw new Error(
      "Enter the improvement area for the follow-up.",
    );
  }

  if (
    followUpRequired &&
    !followUpAction?.trim()
  ) {
    throw new Error(
      "Enter the required follow-up action.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "record_my_coaching_session",
      {
        p_assignment_id:
          assignmentId,

        p_session_summary:
          sessionSummary.trim(),

        p_feedback:
          feedback.trim(),

        p_session_date:
          sessionDate || null,

        p_performance:
          cleanOptionalText(
            performance,
          ),

        p_practice:
          cleanOptionalText(
            practice,
          ),

        p_progress:
          cleanOptionalText(
            progress,
          ),

        p_improvement:
          cleanOptionalText(
            improvement,
          ),

        p_challenges:
          cleanOptionalText(
            challenges,
          ),

        p_support:
          cleanOptionalText(
            support,
          ),

        p_next_goal:
          cleanOptionalText(
            nextGoal,
          ),

        p_practice_adjustment:
          cleanOptionalText(
            practiceAdjustment,
          ),

        p_follow_up_required:
          Boolean(
            followUpRequired,
          ),

        p_follow_up_improvement_area:
          followUpRequired
            ? cleanOptionalText(
                followUpImprovementArea,
              )
            : null,

        p_follow_up_action:
          followUpRequired
            ? cleanOptionalText(
                followUpAction,
              )
            : null,

        p_follow_up_due_date:
          followUpRequired
            ? followUpDueDate ||
              null
            : null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getMyCoachingRecords({
  assignmentId = null,
} = {}) {
  const { data, error } =
    await supabase.rpc(
      "get_my_coaching_records",
      {
        p_assignment_id:
          assignmentId || null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    summary: {
      totalSessions:
        Number(
          data?.summary
            ?.totalSessions,
        ) || 0,

      studentsCoached:
        Number(
          data?.summary
            ?.studentsCoached,
        ) || 0,

      sessionsWithFollowUp:
        Number(
          data?.summary
            ?.sessionsWithFollowUp,
        ) || 0,

      latestSessionDate:
        data?.summary
          ?.latestSessionDate ||
        null,
    },

    records:
      Array.isArray(data?.records)
        ? data.records
        : [],
  };
}

export async function updateCoachingFollowUp({
  followUpId,
  status,
  outcome,
}) {
  if (!followUpId) {
    throw new Error(
      "Select a coaching follow-up.",
    );
  }

  const allowedStatuses = [
    "open",
    "in_progress",
    "completed",
    "cancelled",
  ];

  if (
    !allowedStatuses.includes(status)
  ) {
    throw new Error(
      "Select a valid follow-up status.",
    );
  }

  if (
    (
      status === "completed" ||
      status === "cancelled"
    ) &&
    !outcome?.trim()
  ) {
    throw new Error(
      "Enter the follow-up outcome or closing notes.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "update_my_coaching_follow_up",
      {
        p_follow_up_id:
          followUpId,

        p_status:
          status,

        p_outcome:
          cleanOptionalText(
            outcome,
          ),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function normalizeCoachDashboard(data) {
  return {
    success:
      Boolean(data?.success),

    coach:
      data?.coach || null,

    summary: {
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

      goalsDue:
        Number(
          data?.summary?.goalsDue,
        ) || 0,

      overdueGoals:
        Number(
          data?.summary
            ?.overdueGoals,
        ) || 0,

      sessionsThisMonth:
        Number(
          data?.summary
            ?.sessionsThisMonth,
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

    assignments:
      Array.isArray(
        data?.assignments,
      )
        ? data.assignments
        : [],

    recentSessions:
      Array.isArray(
        data?.recentSessions,
      )
        ? data.recentSessions
        : [],

    followUps:
      Array.isArray(
        data?.followUps,
      )
        ? data.followUps
        : [],
  };
}

function cleanOptionalText(value) {
  const cleaned =
    value?.trim();

  return cleaned || null;
}