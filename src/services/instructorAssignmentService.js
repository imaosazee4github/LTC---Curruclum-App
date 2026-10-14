import { supabase } from "../lib/supabase";

export async function getMyInstructorAssignmentData() {
  const { data, error } =
    await supabase.rpc(
      "get_my_instructor_assignment_data",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: Boolean(data?.success),

    summary: {
      totalAssignments:
        Number(
          data?.summary?.totalAssignments,
        ) || 0,

      publishedAssignments:
        Number(
          data?.summary
            ?.publishedAssignments,
        ) || 0,

      dueOrOverdueAssignments:
        Number(
          data?.summary
            ?.dueOrOverdueAssignments,
        ) || 0,

      pendingSubmissions:
        Number(
          data?.summary?.pendingSubmissions,
        ) || 0,

      openFollowUps:
        Number(
          data?.summary?.openFollowUps,
        ) || 0,
    },

    classes: Array.isArray(data?.classes)
      ? data.classes
      : [],

    assignments: Array.isArray(
      data?.assignments,
    )
      ? data.assignments
      : [],
  };
}

export async function createWeeklyClassAssignment({
  classId,
  title,
  instructions,
  weekNumber,
  dueDate,
  availableFrom,
  assignmentScope = "all_students",
  studentProfileIds = [],
  publish = true,
}) {
  if (!classId) {
    throw new Error("Select a class.");
  }

  if (!title?.trim()) {
    throw new Error(
      "Enter an assignment title.",
    );
  }

  if (!instructions?.trim()) {
    throw new Error(
      "Enter assignment instructions.",
    );
  }

  if (
    !Number.isInteger(Number(weekNumber)) ||
    Number(weekNumber) < 1
  ) {
    throw new Error(
      "Enter a valid course week.",
    );
  }

  if (!dueDate) {
    throw new Error(
      "Select an assignment due date.",
    );
  }

  if (
    assignmentScope ===
      "selected_students" &&
    studentProfileIds.length === 0
  ) {
    throw new Error(
      "Select at least one student.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "create_weekly_class_assignment",
      {
        p_class_id:
          classId,

        p_title:
          title.trim(),

        p_instructions:
          instructions.trim(),

        p_week_number:
          Number(weekNumber),

        p_due_date:
          dueDate,

        p_available_from:
          availableFrom || null,

        p_assignment_scope:
          assignmentScope,

        p_student_profile_ids:
          assignmentScope ===
          "selected_students"
            ? studentProfileIds
            : null,

        p_publish:
          Boolean(publish),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function getMyAssignmentFollowUpData() {
  const { data, error } =
    await supabase.rpc(
      "get_my_assignment_follow_up_data",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    summary: {
      totalSubmissions:
        Number(
          data?.summary
            ?.totalSubmissions,
        ) || 0,

      awaitingReview:
        Number(
          data?.summary
            ?.awaitingReview,
        ) || 0,

      openFollowUps:
        Number(
          data?.summary
            ?.openFollowUps,
        ) || 0,

      completedFollowUps:
        Number(
          data?.summary
            ?.completedFollowUps,
        ) || 0,
    },

    submissions:
      Array.isArray(
        data?.submissions,
      )
        ? data.submissions
        : [],
  };
}

export async function reviewClassAssignmentSubmission({
  assignmentStudentId,
  instructorFeedback,
  followUpRequired = false,
  followUpAction,
  followUpStatus,
  followUpNotes,
}) {
  if (!assignmentStudentId) {
    throw new Error(
      "Select an assignment submission.",
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

  const selectedStatus =
    followUpRequired
      ? followUpStatus || "open"
      : "not_required";

  const allowedStatuses = [
    "not_required",
    "open",
    "in_progress",
    "resolved",
    "closed",
  ];

  if (
    !allowedStatuses.includes(
      selectedStatus,
    )
  ) {
    throw new Error(
      "Select a valid follow-up status.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "review_class_assignment_submission",
      {
        p_assignment_student_id:
          assignmentStudentId,

        p_instructor_feedback:
          cleanOptionalText(
            instructorFeedback,
          ),

        p_follow_up_required:
          Boolean(
            followUpRequired,
          ),

        p_follow_up_action:
          followUpRequired
            ? cleanOptionalText(
                followUpAction,
              )
            : null,

        p_follow_up_status:
          selectedStatus,

        p_follow_up_notes:
          followUpRequired
            ? cleanOptionalText(
                followUpNotes,
              )
            : null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function cleanOptionalText(value) {
  const cleaned =
    value?.trim();

  return cleaned || null;
}