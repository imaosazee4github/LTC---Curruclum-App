import { supabase } from "../lib/supabase";

export async function getMySupervisorDashboard() {
  const { data, error } =
    await supabase.rpc(
      "get_my_supervisor_dashboard",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    supervisorType:
      data?.supervisorType || null,

    profile:
      data?.profile || null,

    summary: {
      totalProjects:
        Number(
          data?.summary?.totalProjects,
        ) || 0,

      activeProjects:
        Number(
          data?.summary?.activeProjects,
        ) || 0,

      upcomingSchedules:
        Number(
          data?.summary?.upcomingSchedules,
        ) || 0,

      assignedStudents:
        Number(
          data?.summary?.assignedStudents,
        ) || 0,

      attendancePending:
        Number(
          data?.summary?.attendancePending,
        ) || 0,

      workReportsPending:
        Number(
          data?.summary?.workReportsPending,
        ) || 0,
    },

    projects:
      Array.isArray(data?.projects)
        ? data.projects
        : [],
  };
}


export async function createServiceProject({
  code,
  title,
  location,
  startDate,
  description,
  expectedOutcomes,
  safetyRequirements,
  endDate,
  status,
}) {
  if (!code?.trim()) {
    throw new Error(
      "Enter a project code.",
    );
  }

  if (!title?.trim()) {
    throw new Error(
      "Enter a project title.",
    );
  }

  if (!location?.trim()) {
    throw new Error(
      "Enter the project location.",
    );
  }

  if (!startDate) {
    throw new Error(
      "Select a project start date.",
    );
  }

  if (
    endDate &&
    endDate < startDate
  ) {
    throw new Error(
      "The end date cannot be before the start date.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "create_service_project",
      {
        p_code:
          code.trim(),

        p_title:
          title.trim(),

        p_location:
          location.trim(),

        p_start_date:
          startDate,

        p_description:
          cleanOptionalText(
            description,
          ),

        p_expected_outcomes:
          cleanOptionalText(
            expectedOutcomes,
          ),

        p_safety_requirements:
          cleanOptionalText(
            safetyRequirements,
          ),

        p_end_date:
          endDate || null,

        p_status:
          status || "planned",
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createServiceProjectSchedule({
  projectId,
  scheduleDate,
  startTime,
  endTime,
  taskTitle,
  location,
  taskDescription,
  expectedOutcome,
  safetyRequirements,
  responsibilityLevel,
  status,
}) {
  if (!projectId) {
    throw new Error(
      "Select a service project.",
    );
  }

  if (!scheduleDate) {
    throw new Error(
      "Select a schedule date.",
    );
  }

  if (!startTime || !endTime) {
    throw new Error(
      "Enter the start and end times.",
    );
  }

  if (endTime <= startTime) {
    throw new Error(
      "The end time must be later than the start time.",
    );
  }

  if (!taskTitle?.trim()) {
    throw new Error(
      "Enter the scheduled task title.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "create_service_project_schedule",
      {
        p_project_id:
          projectId,

        p_schedule_date:
          scheduleDate,

        p_start_time:
          startTime,

        p_end_time:
          endTime,

        p_task_title:
          taskTitle.trim(),

        p_location:
          cleanOptionalText(
            location,
          ),

        p_task_description:
          cleanOptionalText(
            taskDescription,
          ),

        p_expected_outcome:
          cleanOptionalText(
            expectedOutcome,
          ),

        p_safety_requirements:
          cleanOptionalText(
            safetyRequirements,
          ),

        p_responsibility_level:
          responsibilityLevel ||
          "guided",

        p_status:
          status || "scheduled",
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getServiceStudentAssignmentOptions() {
  const { data, error } =
    await supabase.rpc(
      "get_service_student_assignment_options",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    students:
      Array.isArray(data?.students)
        ? data.students
        : [],

    schedules:
      Array.isArray(data?.schedules)
        ? data.schedules
        : [],

    assignments:
      Array.isArray(
        data?.assignments,
      )
        ? data.assignments
        : [],
  };
}

export async function assignStudentToServiceSchedule({
  scheduleId,
  studentProfileId,
  teamName,
  assignedTask,
  responsibilityLevel,
}) {
  if (!scheduleId) {
    throw new Error(
      "Select a scheduled service activity.",
    );
  }

  if (!studentProfileId) {
    throw new Error(
      "Select a student.",
    );
  }

  const allowedLevels = [
    "guided",
    "supported",
    "independent",
    "team_lead",
  ];

  const selectedLevel =
    responsibilityLevel ||
    "guided";

  if (
    !allowedLevels.includes(
      selectedLevel,
    )
  ) {
    throw new Error(
      "Select a valid responsibility level.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "assign_student_to_service_schedule",
      {
        p_schedule_id:
          scheduleId,

        p_student_profile_id:
          studentProfileId,

        p_team_name:
          cleanOptionalText(
            teamName,
          ),

        p_assigned_task:
          cleanOptionalText(
            assignedTask,
          ),

        p_responsibility_level:
          selectedLevel,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getSiteSupervisorWorkData() {
  const { data, error } =
    await supabase.rpc(
      "get_site_supervisor_work_data",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    supervisorType:
      data?.supervisorType ||
      null,

    summary: {
      assignedStudents:
        Number(
          data?.summary
            ?.assignedStudents,
        ) || 0,

      attendancePending:
        Number(
          data?.summary
            ?.attendancePending,
        ) || 0,

      attendanceRecorded:
        Number(
          data?.summary
            ?.attendanceRecorded,
        ) || 0,

      workReportsPending:
        Number(
          data?.summary
            ?.workReportsPending,
        ) || 0,

      workReportsRecorded:
        Number(
          data?.summary
            ?.workReportsRecorded,
        ) || 0,

      todaysAssignments:
        Number(
          data?.summary
            ?.todaysAssignments,
        ) || 0,
    },

    assignments:
      Array.isArray(
        data?.assignments,
      )
        ? data.assignments
        : [],
  };
}

export async function recordServiceAttendance({
  studentAssignmentId,
  attendanceStatus,
  arrivalTime,
  departureTime,
  serviceHours,
  attendanceRemarks,
}) {
  if (!studentAssignmentId) {
    throw new Error(
      "Select a student assignment.",
    );
  }

  const allowedStatuses = [
    "present",
    "late",
    "absent",
    "excused",
  ];

  if (
    !allowedStatuses.includes(
      attendanceStatus,
    )
  ) {
    throw new Error(
      "Select a valid attendance status.",
    );
  }

  if (
    arrivalTime &&
    departureTime &&
    departureTime <= arrivalTime
  ) {
    throw new Error(
      "Departure time must be later than arrival time.",
    );
  }

  const normalizedHours =
    serviceHours === "" ||
    serviceHours === null ||
    serviceHours === undefined
      ? null
      : Number(serviceHours);

  if (
    normalizedHours !== null &&
    (
      !Number.isFinite(
        normalizedHours,
      ) ||
      normalizedHours < 0
    )
  ) {
    throw new Error(
      "Enter valid service hours.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "record_service_attendance",
      {
        p_student_assignment_id:
          studentAssignmentId,

        p_attendance_status:
          attendanceStatus,

        p_arrival_time:
          arrivalTime || null,

        p_departure_time:
          departureTime || null,

        p_service_hours:
          normalizedHours,

        p_attendance_remarks:
          cleanOptionalText(
            attendanceRemarks,
          ),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function recordStudentServiceWork({
  studentAssignmentId,
  workPerformed,
  outcome,
  quality,
  reliability,
  safety,
  followThrough,
  responseToFeedback,
  independence,
  supportRequired,
  supervisorRemarks,
  increasingResponsibility,
  recommendedResponsibilityLevel,
}) {
  if (!studentAssignmentId) {
    throw new Error(
      "Select a student assignment.",
    );
  }

  if (!workPerformed?.trim()) {
    throw new Error(
      "Enter the work performed by the student.",
    );
  }

  const allowedRatings = [
    "not_observed",
    "needs_improvement",
    "developing",
    "meets_expectations",
    "exceeds_expectations",
  ];

  const ratings = {
    quality,
    reliability,
    safety,
    followThrough,
    responseToFeedback,
    independence,
  };

  const hasInvalidRating =
    Object.values(
      ratings,
    ).some(
      (rating) =>
        !allowedRatings.includes(
          rating ||
            "not_observed",
        ),
    );

  if (hasInvalidRating) {
    throw new Error(
      "Select valid student performance ratings.",
    );
  }

  const allowedLevels = [
    "guided",
    "supported",
    "independent",
    "team_lead",
  ];

  if (
    recommendedResponsibilityLevel &&
    !allowedLevels.includes(
      recommendedResponsibilityLevel,
    )
  ) {
    throw new Error(
      "Select a valid recommended responsibility level.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "record_student_service_work",
      {
        p_student_assignment_id:
          studentAssignmentId,

        p_work_performed:
          workPerformed.trim(),

        p_outcome:
          cleanOptionalText(
            outcome,
          ),

        p_quality:
          quality ||
          "not_observed",

        p_reliability:
          reliability ||
          "not_observed",

        p_safety:
          safety ||
          "not_observed",

        p_follow_through:
          followThrough ||
          "not_observed",

        p_response_to_feedback:
          responseToFeedback ||
          "not_observed",

        p_independence:
          independence ||
          "not_observed",

        p_support_required:
          cleanOptionalText(
            supportRequired,
          ),

        p_supervisor_remarks:
          cleanOptionalText(
            supervisorRemarks,
          ),

        p_increasing_responsibility:
          Boolean(
            increasingResponsibility,
          ),

        p_recommended_responsibility_level:
          recommendedResponsibilityLevel ||
          null,
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