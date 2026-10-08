import { supabase } from "../lib/supabase";

export async function getMentorDepartmentDashboard() {
  const { data, error } =
    await supabase.rpc(
      "get_mentor_department_dashboard",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    summary:
      normalizeDepartmentSummary(
        data?.summary,
      ),

    mentorWorkload:
      Array.isArray(
        data?.mentorWorkload,
      )
        ? data.mentorWorkload
        : [],

    recentReports:
      Array.isArray(
        data?.recentReports,
      )
        ? data.recentReports
        : [],
  };
}

export async function getMentoringAssignmentOptions() {
  const { data, error } =
    await supabase.rpc(
      "get_mentoring_assignment_options",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    mentors:
      Array.isArray(data?.mentors)
        ? data.mentors
        : [],

    studentsAwaitingAssignment:
      Array.isArray(
        data?.studentsAwaitingAssignment,
      )
        ? data.studentsAwaitingAssignment
        : [],

    totalAvailableMentors:
      Number(
        data?.totalAvailableMentors,
      ) || 0,

    totalStudentsAwaitingAssignment:
      Number(
        data
          ?.totalStudentsAwaitingAssignment,
      ) || 0,
  };
}

export async function getMentoringReportQueue({
  status = null,
  attentionLevel = null,
} = {}) {
  const { data, error } =
    await supabase.rpc(
      "get_mentoring_report_queue",
      {
        p_status:
          status || null,

        p_attention_level:
          attentionLevel || null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    reports:
      Array.isArray(data?.reports)
        ? data.reports
        : [],

    summary:
      normalizeReportSummary(
        data?.summary,
      ),
  };
}

export async function assignStudentToMentor({
  studentProfileId,
  mentorProfileId,
  assignmentReason,
  nextCheckInAt,
}) {
  if (!studentProfileId) {
    throw new Error(
      "Select a student.",
    );
  }

  if (!mentorProfileId) {
    throw new Error(
      "Select a mentor.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "assign_student_to_mentor",
      {
        p_student_profile_id:
          studentProfileId,

        p_mentor_profile_id:
          mentorProfileId,

        p_assignment_reason:
          cleanOptionalText(
            assignmentReason,
          ),

        p_next_check_in_at:
          nextCheckInAt || null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function closeMentorAssignment({
  assignmentId,
  closingStatus,
  closingNotes,
}) {
  if (!assignmentId) {
    throw new Error(
      "Select a mentor assignment.",
    );
  }

  if (!closingStatus) {
    throw new Error(
      "Select a closing status.",
    );
  }

  if (!closingNotes?.trim()) {
    throw new Error(
      "Enter closing notes.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "close_mentor_assignment",
      {
        p_assignment_id:
          assignmentId,

        p_closing_status:
          closingStatus,

        p_closing_notes:
          closingNotes.trim(),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function reviewMentorReport({
  reportId,
  decision,
  reviewNotes,
  visibilityDecision,
  studentVisibleSummary,
}) {
  if (!reportId) {
    throw new Error(
      "Select a mentor report.",
    );
  }

  if (!decision) {
    throw new Error(
      "Select a report decision.",
    );
  }

  if (!visibilityDecision) {
    throw new Error(
      "Select a student visibility decision.",
    );
  }

  if (
    visibilityDecision ===
      "approve" &&
    !studentVisibleSummary?.trim()
  ) {
    throw new Error(
      "Enter the feedback summary that the student may view.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "review_mentor_report",
      {
        p_report_id:
          reportId,

        p_decision:
          decision,

        p_review_notes:
          cleanOptionalText(
            reviewNotes,
          ),

        p_visibility_decision:
          visibilityDecision,

        p_student_visible_summary:
          cleanOptionalText(
            studentVisibleSummary,
          ),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function normalizeDepartmentSummary(
  summary,
) {
  return {
    activeMentors:
      Number(
        summary?.activeMentors,
      ) || 0,

    availableMentors:
      Number(
        summary?.availableMentors,
      ) || 0,

    activeAssignments:
      Number(
        summary?.activeAssignments,
      ) || 0,

    studentsAwaitingAssignment:
      Number(
        summary
          ?.studentsAwaitingAssignment,
      ) || 0,

    reportsAwaitingReview:
      Number(
        summary
          ?.reportsAwaitingReview,
      ) || 0,

    urgentReports:
      Number(
        summary?.urgentReports,
      ) || 0,

    openFollowUps:
      Number(
        summary?.openFollowUps,
      ) || 0,

    overdueFollowUps:
      Number(
        summary?.overdueFollowUps,
      ) || 0,

    overdueCheckIns:
      Number(
        summary?.overdueCheckIns,
      ) || 0,
  };
}

function normalizeReportSummary(
  summary,
) {
  return {
    totalReports:
      Number(
        summary?.totalReports,
      ) || 0,

    awaitingReview:
      Number(
        summary?.awaitingReview,
      ) || 0,

    clarificationRequested:
      Number(
        summary
          ?.clarificationRequested,
      ) || 0,

    followUpRequired:
      Number(
        summary?.followUpRequired,
      ) || 0,

    urgentReports:
      Number(
        summary?.urgentReports,
      ) || 0,

    priorityReports:
      Number(
        summary?.priorityReports,
      ) || 0,

    approvedForStudents:
      Number(
        summary
          ?.approvedForStudents,
      ) || 0,
  };
}

function cleanOptionalText(value) {
  const cleaned =
    value?.trim();

  return cleaned || null;
}