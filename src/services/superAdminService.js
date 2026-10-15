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
  supervisorType,
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

  const allowedSupervisorTypes = [
    "service_coordinator",
    "site_supervisor",
  ];

  if (
    role === "supervisor" &&
    !allowedSupervisorTypes.includes(
      supervisorType,
    )
  ) {
    throw new Error(
      "Select a supervisor type.",
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

        p_supervisor_type:
          role === "supervisor"
            ? supervisorType
            : null,
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

export async function getCourseManagementData() {
  const { data, error } =
    await supabase.rpc(
      "get_course_management_data",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    summary: {
      totalCourses:
        Number(
          data?.summary?.totalCourses,
        ) || 0,

      activeCourses:
        Number(
          data?.summary?.activeCourses,
        ) || 0,

      plannedCourses:
        Number(
          data?.summary?.plannedCourses,
        ) || 0,

      activeInstructors:
        Number(
          data?.summary
            ?.activeInstructors,
        ) || 0,

      activeAssignments:
        Number(
          data?.summary
            ?.activeAssignments,
        ) || 0,
    },

    courses:
      Array.isArray(data?.courses)
        ? data.courses
        : [],

    instructors:
      Array.isArray(
        data?.instructors,
      )
        ? data.instructors
        : [],
  };
}

export async function createCourse({
  code,
  title,
  description,
  learningArea,
  competencyBucket,
  status,
}) {
  if (!code?.trim()) {
    throw new Error(
      "Enter the course code.",
    );
  }

  if (!title?.trim()) {
    throw new Error(
      "Enter the course title.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "create_course",
      {
        p_code:
          code.trim(),

        p_title:
          title.trim(),

        p_description:
          cleanOptionalText(
            description,
          ),

        p_learning_area:
          cleanOptionalText(
            learningArea,
          ),

        p_competency_bucket:
          competencyBucket ||
          "foundational_competencies",

        p_status:
          status || "planned",
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function assignCourseInstructor({
  courseId,
  staffProfileId,
  assignmentRole,
}) {
  if (!courseId) {
    throw new Error(
      "Select a course.",
    );
  }

  if (!staffProfileId) {
    throw new Error(
      "Select an instructor.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "assign_course_instructor",
      {
        p_course_id:
          courseId,

        p_staff_profile_id:
          staffProfileId,

        p_assignment_role:
          assignmentRole ||
          "instructor",
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function closeCourseInstructorAssignment({
  assignmentId,
  closingStatus,
}) {
  if (!assignmentId) {
    throw new Error(
      "Select an instructor assignment.",
    );
  }

  const allowedStatuses = [
    "completed",
    "inactive",
  ];

  const selectedStatus =
    closingStatus || "completed";

  if (
    !allowedStatuses.includes(
      selectedStatus,
    )
  ) {
    throw new Error(
      "Select a valid closing status.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "close_course_instructor_assignment",
      {
        p_assignment_id:
          assignmentId,

        p_closing_status:
          selectedStatus,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCoachingAssignmentOptions() {
  const { data, error } =
    await supabase.rpc(
      "get_coaching_assignment_options",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    summary: {
      totalCoaches:
        Number(
          data?.summary?.totalCoaches,
        ) || 0,

      availableCoaches:
        Number(
          data?.summary?.availableCoaches,
        ) || 0,

      totalStudents:
        Number(
          data?.summary?.totalStudents,
        ) || 0,

      activeAssignments:
        Number(
          data?.summary?.activeAssignments,
        ) || 0,
    },

    coaches:
      Array.isArray(data?.coaches)
        ? data.coaches
        : [],

    students:
      Array.isArray(data?.students)
        ? data.students
        : [],

    assignments:
      Array.isArray(data?.assignments)
        ? data.assignments
        : [],
  };
}

export async function assignStudentToCoach({
  studentProfileId,
  coachStaffProfileId,
  developmentArea,
  goal,
  currentPosition,
  practicePlan,
  targetDate,
}) {
  if (!studentProfileId) {
    throw new Error(
      "Select a student.",
    );
  }

  if (!coachStaffProfileId) {
    throw new Error(
      "Select a coach.",
    );
  }

  if (!developmentArea?.trim()) {
    throw new Error(
      "Enter the development area.",
    );
  }

  if (!goal?.trim()) {
    throw new Error(
      "Enter the coaching goal.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "assign_student_to_coach",
      {
        p_student_profile_id:
          studentProfileId,

        p_coach_staff_profile_id:
          coachStaffProfileId,

        p_development_area:
          developmentArea.trim(),

        p_goal:
          goal.trim(),

        p_current_position:
          cleanOptionalText(
            currentPosition,
          ),

        p_practice_plan:
          cleanOptionalText(
            practicePlan,
          ),

        p_target_date:
          targetDate || null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function closeCoachingAssignment({
  assignmentId,
  closingStatus,
  closingNotes,
}) {
  if (!assignmentId) {
    throw new Error(
      "Select a coaching assignment.",
    );
  }

  const allowedStatuses = [
    "completed",
    "cancelled",
  ];

  const selectedStatus =
    closingStatus || "completed";

  if (
    !allowedStatuses.includes(
      selectedStatus,
    )
  ) {
    throw new Error(
      "Select a valid closing status.",
    );
  }

  if (!closingNotes?.trim()) {
    throw new Error(
      "Enter closing notes.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "close_coaching_assignment",
      {
        p_assignment_id:
          assignmentId,

        p_closing_status:
          selectedStatus,

        p_closing_notes:
          closingNotes.trim(),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}



export async function getLearningExperienceManagementData() {
  const [
    managementResult,
    cohortResult,
  ] = await Promise.all([
    supabase.rpc(
      "get_learning_experience_management_data",
    ),

    supabase.rpc(
      "get_learning_experience_cohort_options",
    ),
  ]);

  if (managementResult.error) {
    throw new Error(
      managementResult.error.message,
    );
  }

  if (cohortResult.error) {
    throw new Error(
      cohortResult.error.message,
    );
  }

  const managementData =
    managementResult.data;

  const cohortData =
    cohortResult.data;

  return {
    success:
      Boolean(
        managementData?.success,
      ) &&
      Boolean(
        cohortData?.success,
      ),

    summary:
      normalizeLearningExperienceSummary(
        managementData?.summary,
      ),

    experiences:
      Array.isArray(
        managementData?.experiences,
      )
        ? managementData.experiences
        : [],

    facilitators:
      Array.isArray(
        managementData?.facilitators,
      )
        ? managementData.facilitators
        : [],

    cohorts:
      Array.isArray(
        cohortData?.cohorts,
      )
        ? cohortData.cohorts
        : [],
  };
}


export async function createLearningExperience({
  code,
  title,
  description,
  learningObjectives,
  cohortId,
  deliveryMode,
  location,
  startDate,
  endDate,
  status,
  enrollCohortStudents = true,
}) {
  if (!code?.trim()) {
    throw new Error(
      "Enter a learning-experience code.",
    );
  }

  if (!title?.trim()) {
    throw new Error(
      "Enter a learning-experience title.",
    );
  }

  const allowedDeliveryModes = [
    "in_person",
    "online",
    "hybrid",
  ];

  const selectedDeliveryMode =
    deliveryMode || "in_person";

  if (
    !allowedDeliveryModes.includes(
      selectedDeliveryMode,
    )
  ) {
    throw new Error(
      "Select a valid delivery mode.",
    );
  }

  const allowedStatuses = [
    "planned",
    "active",
    "completed",
    "cancelled",
    "inactive",
  ];

  const selectedStatus =
    status || "planned";

  if (
    !allowedStatuses.includes(
      selectedStatus,
    )
  ) {
    throw new Error(
      "Select a valid learning-experience status.",
    );
  }

  if (
    startDate &&
    endDate &&
    endDate < startDate
  ) {
    throw new Error(
      "The end date cannot be earlier than the start date.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "create_learning_experience",
      {
        p_code:
          code.trim(),

        p_title:
          title.trim(),

        p_description:
          cleanOptionalText(
            description,
          ),

        p_learning_objectives:
          cleanOptionalText(
            learningObjectives,
          ),

        p_cohort_id:
          cohortId || null,

        p_delivery_mode:
          selectedDeliveryMode,

        p_location:
          cleanOptionalText(
            location,
          ),

        p_start_date:
          startDate || null,

        p_end_date:
          endDate || null,

        p_status:
          selectedStatus,

        p_enroll_cohort_students:
          Boolean(
            enrollCohortStudents,
          ),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function assignFacilitatorToLearningExperience({
  learningExperienceId,
  facilitatorStaffProfileId,
  assignmentRole,
  notes,
}) {
  if (!learningExperienceId) {
    throw new Error(
      "Select a learning experience.",
    );
  }

  if (!facilitatorStaffProfileId) {
    throw new Error(
      "Select a facilitator.",
    );
  }

  const allowedRoles = [
    "lead_facilitator",
    "facilitator",
    "assistant_facilitator",
  ];

  const selectedRole =
    assignmentRole ||
    "facilitator";

  if (
    !allowedRoles.includes(
      selectedRole,
    )
  ) {
    throw new Error(
      "Select a valid assignment role.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "assign_facilitator_to_learning_experience",
      {
        p_learning_experience_id:
          learningExperienceId,

        p_facilitator_staff_profile_id:
          facilitatorStaffProfileId,

        p_assignment_role:
          selectedRole,

        p_notes:
          cleanOptionalText(
            notes,
          ),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function closeLearningExperienceFacilitatorAssignment({
  assignmentId,
  closingStatus,
  closingNotes,
}) {
  if (!assignmentId) {
    throw new Error(
      "Select a facilitator assignment.",
    );
  }

  const allowedStatuses = [
    "completed",
    "inactive",
  ];

  const selectedStatus =
    closingStatus || "completed";

  if (
    !allowedStatuses.includes(
      selectedStatus,
    )
  ) {
    throw new Error(
      "Select a valid closing status.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "close_learning_experience_facilitator_assignment",
      {
        p_assignment_id:
          assignmentId,

        p_closing_status:
          selectedStatus,

        p_closing_notes:
          cleanOptionalText(
            closingNotes,
          ),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createLearningExperienceSession({
  learningExperienceId,
  title,
  sessionDate,
  startTime,
  endTime,
  sessionNumber,
  topic,
  learningObjectives,
  deliveryMode,
  location,
  status,
  notes,
}) {
  if (!learningExperienceId) {
    throw new Error(
      "Select a learning experience.",
    );
  }

  if (!title?.trim()) {
    throw new Error(
      "Enter a session title.",
    );
  }

  if (!sessionDate) {
    throw new Error(
      "Select a session date.",
    );
  }

  if (!startTime) {
    throw new Error(
      "Enter the session start time.",
    );
  }

  if (!endTime) {
    throw new Error(
      "Enter the session end time.",
    );
  }

  if (endTime <= startTime) {
    throw new Error(
      "The end time must be later than the start time.",
    );
  }

  const allowedDeliveryModes = [
    "in_person",
    "online",
    "hybrid",
  ];

  const selectedDeliveryMode =
    deliveryMode || "in_person";

  if (
    !allowedDeliveryModes.includes(
      selectedDeliveryMode,
    )
  ) {
    throw new Error(
      "Select a valid delivery mode.",
    );
  }

  const allowedStatuses = [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
  ];

  const selectedStatus =
    status || "scheduled";

  if (
    !allowedStatuses.includes(
      selectedStatus,
    )
  ) {
    throw new Error(
      "Select a valid session status.",
    );
  }

  const parsedSessionNumber =
    sessionNumber
      ? Number(sessionNumber)
      : null;

  if (
    parsedSessionNumber !== null &&
    (
      !Number.isInteger(
        parsedSessionNumber,
      ) ||
      parsedSessionNumber < 1
    )
  ) {
    throw new Error(
      "Session number must be a positive whole number.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "create_learning_experience_session",
      {
        p_learning_experience_id:
          learningExperienceId,

        p_title:
          title.trim(),

        p_session_date:
          sessionDate,

        p_start_time:
          startTime,

        p_end_time:
          endTime,

        p_session_number:
          parsedSessionNumber,

        p_topic:
          cleanOptionalText(
            topic,
          ),

        p_learning_objectives:
          cleanOptionalText(
            learningObjectives,
          ),

        p_delivery_mode:
          selectedDeliveryMode,

        p_location:
          cleanOptionalText(
            location,
          ),

        p_status:
          selectedStatus,

        p_notes:
          cleanOptionalText(
            notes,
          ),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function normalizeLearningExperienceSummary(
  summary,
) {
  return {
    totalExperiences:
      Number(
        summary?.totalExperiences,
      ) || 0,

    plannedExperiences:
      Number(
        summary?.plannedExperiences,
      ) || 0,

    activeExperiences:
      Number(
        summary?.activeExperiences,
      ) || 0,

    completedExperiences:
      Number(
        summary?.completedExperiences,
      ) || 0,

    totalActiveAssignments:
      Number(
        summary
          ?.totalActiveAssignments,
      ) || 0,

    totalEnrolledStudents:
      Number(
        summary
          ?.totalEnrolledStudents,
      ) || 0,

    totalSessions:
      Number(
        summary?.totalSessions,
      ) || 0,

    activeFacilitators:
      Number(
        summary?.activeFacilitators,
      ) || 0,
  };
}

export async function getSuperAdminStudentOverview() {
  const { data, error } = await supabase.rpc(
    "get_super_admin_student_overview",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(
      "The student overview could not be loaded.",
    );
  }

  return {
    students: Array.isArray(data.students)
      ? data.students
      : [],
  };
}

export async function getSuperAdminStudentDetails(profileId) {
  if (!profileId) {
    throw new Error("A student profile ID is required.");
  }

  const { data: account, error: accountError } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      phone,
      profile_photo_url
    `)
    .eq("id", profileId)
    .eq("role", "student")
    .maybeSingle();

  if (accountError) {
    throw new Error(accountError.message);
  }

  if (!account) {
    return null;
  }

  const { data: studentProfile, error: studentError } = await supabase
    .from("student_profiles")
    .select(`
      id,
      profile_id,
      student_number,
      preferred_name,
      date_of_birth,
      gender,
      residential_address,
      city,
      state,
      country,
      emergency_contact_name,
      emergency_contact_relationship,
      emergency_contact_phone,
      entry_date,
      expected_completion_date,
      profile_completion_percentage
    `)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (studentError) {
    throw new Error(studentError.message);
  }

  return {
    account,
    studentProfile,
  };
}

function cleanOptionalText(value) {
  const cleaned =
    value?.trim();

  return cleaned || null;
}

