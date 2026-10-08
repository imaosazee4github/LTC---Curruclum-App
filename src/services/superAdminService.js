import { supabase } from "../lib/supabase";

export async function getSuperAdminDashboard() {
  const { data, error } =
    await supabase.rpc(
      "get_super_admin_dashboard",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    summary:
      normalizeDashboardSummary(
        data?.summary,
      ),

    staffByRole:
      Array.isArray(data?.staffByRole)
        ? data.staffByRole
        : [],

    recentStaff:
      Array.isArray(data?.recentStaff)
        ? data.recentStaff
        : [],
  };
}

function normalizeDashboardSummary(
  summary,
) {
  return {
    totalStudents:
      Number(
        summary?.totalStudents,
      ) || 0,

    activeStudents:
      Number(
        summary?.activeStudents,
      ) || 0,

    instructors:
      Number(
        summary?.instructors,
      ) || 0,

    facilitators:
      Number(
        summary?.facilitators,
      ) || 0,

    coaches:
      Number(
        summary?.coaches,
      ) || 0,

    supervisors:
      Number(
        summary?.supervisors,
      ) || 0,

    mentors:
      Number(
        summary?.mentors,
      ) || 0,

    mentorDepartmentOfficers:
      Number(
        summary
          ?.mentorDepartmentOfficers,
      ) || 0,

    studentsWithoutMentors:
      Number(
        summary
          ?.studentsWithoutMentors,
      ) || 0,

    incompleteStudentProfiles:
      Number(
        summary
          ?.incompleteStudentProfiles,
      ) || 0,

    activeMentorAssignments:
      Number(
        summary
          ?.activeMentorAssignments,
      ) || 0,

    mentorReportsAwaitingReview:
      Number(
        summary
          ?.mentorReportsAwaitingReview,
      ) || 0,

    urgentMentorReports:
      Number(
        summary
          ?.urgentMentorReports,
      ) || 0,
  };
}