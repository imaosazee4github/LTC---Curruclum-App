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

export async function getStaffManagementData() {
  const { data, error } =
    await supabase.rpc(
      "get_staff_management_data",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    summary:
      normalizeStaffSummary(
        data?.summary,
      ),

    staff:
      Array.isArray(data?.staff)
        ? data.staff
        : [],

    eligibleAccounts:
      Array.isArray(
        data?.eligibleAccounts,
      )
        ? data.eligibleAccounts
        : [],
  };
}

export async function assignStaffRole({
  profileId,
  role,
  staffNumber,
  jobTitle,
  specialization,
  biography,
  availabilityStatus,
}) {
  if (!profileId) {
    throw new Error(
      "Select an account.",
    );
  }

  const allowedRoles = [
    "instructor",
    "facilitator",
    "coach",
    "supervisor",
  ];

  if (!allowedRoles.includes(role)) {
    throw new Error(
      "Select a valid staff role.",
    );
  }

  const allowedAvailabilityStatuses = [
    "available",
    "limited",
    "unavailable",
    "inactive",
  ];

  const selectedAvailability =
    availabilityStatus ||
    "available";

  if (
    !allowedAvailabilityStatuses.includes(
      selectedAvailability,
    )
  ) {
    throw new Error(
      "Select a valid availability status.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "assign_staff_role",
      {
        p_profile_id:
          profileId,

        p_role:
          role,

        p_staff_number:
          cleanOptionalText(
            staffNumber,
          ),

        p_job_title:
          cleanOptionalText(
            jobTitle,
          ),

        p_specialization:
          cleanOptionalText(
            specialization,
          ),

        p_biography:
          cleanOptionalText(
            biography,
          ),

        p_availability_status:
          selectedAvailability,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function normalizeStaffSummary(summary) {
  return {
    totalStaff:
      Number(
        summary?.totalStaff,
      ) || 0,

    activeStaff:
      Number(
        summary?.activeStaff,
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

    availableStaff:
      Number(
        summary?.availableStaff,
      ) || 0,
  };
}

function cleanOptionalText(value) {
  const cleaned =
    value?.trim();

  return cleaned || null;
}