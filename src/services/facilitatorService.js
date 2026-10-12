import { supabase } from "../lib/supabase";

export async function getMyFacilitatorDashboard() {
  const { data, error } =
    await supabase.rpc(
      "get_my_facilitator_dashboard",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    facilitator:
      data?.facilitator || null,

    summary:
      normalizeDashboardSummary(
        data?.summary,
      ),

    experiences:
      Array.isArray(data?.experiences)
        ? data.experiences
        : [],

    upcomingSessions:
      Array.isArray(
        data?.upcomingSessions,
      )
        ? data.upcomingSessions
        : [],

    followUps:
      Array.isArray(data?.followUps)
        ? data.followUps
        : [],
  };
}

export async function getMyFacilitatorStudents({
  learningExperienceId = null,
} = {}) {
  const { data, error } =
    await supabase.rpc(
      "get_my_facilitator_students",
      {
        p_learning_experience_id:
          learningExperienceId || null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    selectedLearningExperienceId:
      data?.selectedLearningExperienceId ||
      null,

    experiences:
      Array.isArray(data?.experiences)
        ? data.experiences
        : [],

    students:
      Array.isArray(data?.students)
        ? data.students
        : [],
  };
}

export async function recordStudentEngagement({
  learningExperienceId,
  sessionId,
  studentProfileId,
  attendanceStatus,
  preparationLevel,
  participationLevel,
  engagementLevel,
  contributionLevel,
  observation,
  learningObservation,
  concern,
  supportProvided,
  followUpRequired = false,
  followUpSupportRequired,
  followUpAction,
  followUpDueDate,
}) {
  if (!learningExperienceId) {
    throw new Error(
      "Select a learning experience.",
    );
  }

  if (!sessionId) {
    throw new Error(
      "Select a session.",
    );
  }

  if (!studentProfileId) {
    throw new Error(
      "Select a student.",
    );
  }

  const allowedAttendanceStatuses = [
    "present",
    "absent",
    "late",
    "excused",
    "remote",
  ];

  if (
    !allowedAttendanceStatuses.includes(
      attendanceStatus,
    )
  ) {
    throw new Error(
      "Select a valid attendance status.",
    );
  }

  const selectedPreparationLevel =
    preparationLevel ||
    "not_observed";

  const selectedParticipationLevel =
    participationLevel ||
    "not_observed";

  const selectedEngagementLevel =
    engagementLevel ||
    "not_observed";

  const selectedContributionLevel =
    contributionLevel ||
    "not_observed";

  if (
    followUpRequired &&
    !cleanOptionalText(concern)
  ) {
    throw new Error(
      "Enter the concern requiring follow-up.",
    );
  }

  if (
    followUpRequired &&
    !cleanOptionalText(
      followUpAction,
    )
  ) {
    throw new Error(
      "Enter the required follow-up action.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "record_student_engagement",
      {
        p_learning_experience_id:
          learningExperienceId,

        p_session_id:
          sessionId,

        p_student_profile_id:
          studentProfileId,

        p_attendance_status:
          attendanceStatus,

        p_preparation_level:
          selectedPreparationLevel,

        p_participation_level:
          selectedParticipationLevel,

        p_engagement_level:
          selectedEngagementLevel,

        p_contribution_level:
          selectedContributionLevel,

        p_observation:
          cleanOptionalText(
            observation,
          ),

        p_learning_observation:
          cleanOptionalText(
            learningObservation,
          ),

        p_concern:
          cleanOptionalText(
            concern,
          ),

        p_support_provided:
          cleanOptionalText(
            supportProvided,
          ),

        p_follow_up_required:
          Boolean(followUpRequired),

        p_follow_up_support_required:
          cleanOptionalText(
            followUpSupportRequired,
          ),

        p_follow_up_action:
          cleanOptionalText(
            followUpAction,
          ),

        p_follow_up_due_date:
          followUpDueDate || null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateFacilitatorFollowUp({
  followUpId,
  status,
  outcome,
  supportRequired,
  actionRequired,
  dueDate,
}) {
  if (!followUpId) {
    throw new Error(
      "Select a follow-up record.",
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
    status === "completed" &&
    !cleanOptionalText(outcome)
  ) {
    throw new Error(
      "Enter the follow-up outcome.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "update_my_facilitator_follow_up",
      {
        p_follow_up_id:
          followUpId,

        p_status:
          status,

        p_outcome:
          cleanOptionalText(
            outcome,
          ),

        p_support_required:
          cleanOptionalText(
            supportRequired,
          ),

        p_action_required:
          cleanOptionalText(
            actionRequired,
          ),

        p_due_date:
          dueDate || null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createLearningExperienceResource({
  learningExperienceId,
  title,
  resourceType,
  sessionId,
  description,
  resourceUrl,
  status = "active",
}) {
  if (!learningExperienceId) {
    throw new Error(
      "Select a learning experience.",
    );
  }

  if (!cleanOptionalText(title)) {
    throw new Error(
      "Enter a resource title.",
    );
  }

  if (!resourceType) {
    throw new Error(
      "Select a resource type.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "create_learning_experience_resource",
      {
        p_learning_experience_id:
          learningExperienceId,

        p_title:
          title.trim(),

        p_resource_type:
          resourceType,

        p_session_id:
          sessionId || null,

        p_description:
          cleanOptionalText(
            description,
          ),

        p_resource_url:
          cleanOptionalText(
            resourceUrl,
          ),

        p_status:
          status,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createLearningExperienceActivity({
  learningExperienceId,
  title,
  activityType,
  sessionId,
  description,
  instructions,
  expectedOutcome,
  status = "planned",
}) {
  if (!learningExperienceId) {
    throw new Error(
      "Select a learning experience.",
    );
  }

  if (!cleanOptionalText(title)) {
    throw new Error(
      "Enter an activity title.",
    );
  }

  if (!activityType) {
    throw new Error(
      "Select an activity type.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "create_learning_experience_activity",
      {
        p_learning_experience_id:
          learningExperienceId,

        p_title:
          title.trim(),

        p_activity_type:
          activityType,

        p_session_id:
          sessionId || null,

        p_description:
          cleanOptionalText(
            description,
          ),

        p_instructions:
          cleanOptionalText(
            instructions,
          ),

        p_expected_outcome:
          cleanOptionalText(
            expectedOutcome,
          ),

        p_status:
          status,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function normalizeDashboardSummary(
  summary,
) {
  return {
    activeExperiences:
      Number(
        summary?.activeExperiences,
      ) || 0,

    assignedStudents:
      Number(
        summary?.assignedStudents,
      ) || 0,

    upcomingSessions:
      Number(
        summary?.upcomingSessions,
      ) || 0,

    resources:
      Number(
        summary?.resources,
      ) || 0,

    activities:
      Number(
        summary?.activities,
      ) || 0,

    openFollowUps:
      Number(
        summary?.openFollowUps,
      ) || 0,
  };
}

function cleanOptionalText(value) {
  const cleaned =
    typeof value === "string"
      ? value.trim()
      : "";

  return cleaned || null;
}