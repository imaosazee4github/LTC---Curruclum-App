import { supabase } from "../lib/supabase";

export async function getMyMentorDashboard() {
  const { data, error } = await supabase.rpc(
    "get_my_mentor_dashboard",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Your Advisory dashboard could not be loaded.");
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
    throw new Error("Select an assigned student.");
  }

  if (!reportType) {
    throw new Error("Select a report type.");
  }

  if (!context?.trim()) {
    throw new Error("Enter the context for this report.");
  }

  if (!feedback?.trim()) {
    throw new Error("Enter your advisory feedback.");
  }

  const { data, error } = await supabase.rpc(
    "submit_my_mentor_report",
    {
      p_assignment_id: assignmentId,
      p_report_type: reportType,
      p_reporting_period_start: reportingPeriodStart || null,
      p_reporting_period_end: reportingPeriodEnd || null,
      p_context: context.trim(),
      p_strengths: cleanOptionalText(strengths),
      p_development_area: cleanOptionalText(developmentArea),
      p_feedback: feedback.trim(),
      p_support_recommended: cleanOptionalText(supportRecommended),
      p_follow_up_required: cleanOptionalText(followUpRequired),
      p_intended_outcome: cleanOptionalText(intendedOutcome),
      p_attention_level: attentionLevel || "routine",
      p_confidentiality_level: confidentialityLevel || "standard",
      p_request_student_visibility: Boolean(requestStudentVisibility),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Your advisory report could not be submitted.");
  }

  return data;
}

function normalizeMentorDashboard(data) {
  const mentees = Array.isArray(data?.mentees)
    ? data.mentees
    : [];

  const couple = data?.advisoryCouple;

  const advisoryCouple = couple?.id
    ? {
        id: couple.id,
        displayName: couple.display_name || "",
        maxActiveStudents: Number(couple.max_active_students) || 0,
        members: Array.isArray(couple.members)
          ? couple.members
          : [],
      }
    : null;

  const coupleStudents = advisoryCouple
    ? mentees.filter(
        (student) =>
          student.advisory_couple_id === advisoryCouple.id,
      )
    : [];

  const individualStudents = mentees.filter(
    (student) => !student.advisory_couple_id,
  );

  return {
    success: Boolean(data?.success),
    mentor: data?.mentor || null,
    advisoryCouple,

    workload: {
      coupleStudentCount: coupleStudents.length,
      individualStudentCount: individualStudents.length,
      coupleCapacity: advisoryCouple?.maxActiveStudents ?? null,
      coupleRemainingCapacity: advisoryCouple
        ? Math.max(
            advisoryCouple.maxActiveStudents - coupleStudents.length,
            0,
          )
        : null,
    },

    summary: {
      assignedMentees:
        Number(data?.summary?.assignedMentees) || 0,
      checkInsDue:
        Number(data?.summary?.checkInsDue) || 0,
      overdueCheckIns:
        Number(data?.summary?.overdueCheckIns) || 0,
      clarificationRequests:
        Number(data?.summary?.clarificationRequests) || 0,
      openFollowUps:
        Number(data?.summary?.openFollowUps) || 0,
      overdueFollowUps:
        Number(data?.summary?.overdueFollowUps) || 0,
      studentsNeedingAttention:
        Number(data?.summary?.studentsNeedingAttention) || 0,
    },

    mentees,

    actions: Array.isArray(data?.actions)
      ? data.actions
      : [],

    recentReports: Array.isArray(data?.recentReports)
      ? data.recentReports
      : [],
  };
}

function cleanOptionalText(value) {
  return value?.trim() || null;
}