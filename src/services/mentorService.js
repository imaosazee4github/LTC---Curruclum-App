import { supabase } from "../lib/supabase";

export async function getMyMentorDashboard() {
  const { data, error } =
    await supabase.rpc(
      "get_my_mentor_dashboard",
    );

  if (error) {
    throw new Error(error.message);
  }

  return normalizeMentorDashboard(data);
}

export async function submitMentorReport({
  assignmentId,
  reportType,
  reportingPeriodStart,
  reportingPeriodEnd,
  context,
  strengths,
  developmentArea,
  feedback,
  supportRecommended,
  followUpRequired,
  intendedOutcome,
  attentionLevel,
  confidentialityLevel,
  requestStudentVisibility,
}) {
  if (!assignmentId) {
    throw new Error(
      "Select an assigned student.",
    );
  }

  if (!reportType) {
    throw new Error(
      "Select a report type.",
    );
  }

  if (!context?.trim()) {
    throw new Error(
      "Enter the context for this report.",
    );
  }

  if (!feedback?.trim()) {
    throw new Error(
      "Enter your mentor feedback.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "submit_my_mentor_report",
      {
        p_assignment_id:
          assignmentId,

        p_report_type:
          reportType,

        p_reporting_period_start:
          reportingPeriodStart ||
          null,

        p_reporting_period_end:
          reportingPeriodEnd ||
          null,

        p_context:
          context.trim(),

        p_strengths:
          cleanOptionalText(
            strengths,
          ),

        p_development_area:
          cleanOptionalText(
            developmentArea,
          ),

        p_feedback:
          feedback.trim(),

        p_support_recommended:
          cleanOptionalText(
            supportRecommended,
          ),

        p_follow_up_required:
          cleanOptionalText(
            followUpRequired,
          ),

        p_intended_outcome:
          cleanOptionalText(
            intendedOutcome,
          ),

        p_attention_level:
          attentionLevel ||
          "routine",

        p_confidentiality_level:
          confidentialityLevel ||
          "standard",

        p_request_student_visibility:
          Boolean(
            requestStudentVisibility,
          ),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function normalizeMentorDashboard(data) {
  return {
    success:
      Boolean(data?.success),

    mentor:
      data?.mentor || null,

    summary: {
      assignedMentees:
        Number(
          data?.summary
            ?.assignedMentees,
        ) || 0,

      checkInsDue:
        Number(
          data?.summary
            ?.checkInsDue,
        ) || 0,

      overdueCheckIns:
        Number(
          data?.summary
            ?.overdueCheckIns,
        ) || 0,

      clarificationRequests:
        Number(
          data?.summary
            ?.clarificationRequests,
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

      studentsNeedingAttention:
        Number(
          data?.summary
            ?.studentsNeedingAttention,
        ) || 0,
    },

    mentees:
      Array.isArray(data?.mentees)
        ? data.mentees
        : [],

    actions:
      Array.isArray(data?.actions)
        ? data.actions
        : [],

    recentReports:
      Array.isArray(
        data?.recentReports,
      )
        ? data.recentReports
        : [],
  };
}

function cleanOptionalText(value) {
  const cleaned =
    value?.trim();

  return cleaned || null;
}