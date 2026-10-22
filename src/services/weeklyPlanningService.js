import { supabase } from "../lib/supabase";

const STAFF_ROLES = [
  "instructor",
  "facilitator",
  "coach",
];

async function callRpc(name, parameters = {}) {
  const { data, error } = await supabase.rpc(
    name,
    parameters,
  );

  if (error) {
    throw new Error(error.message);
  }

  if (data?.success === false) {
    throw new Error(
      data.message || "The request could not be completed.",
    );
  }

  return data;
}

function optionalText(value) {
  return value?.trim() || null;
}

function requireValue(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

function validateStaffRole(role) {
  if (!STAFF_ROLES.includes(role)) {
    throw new Error("Select a valid teaching role.");
  }
}

export async function getWeeklyPlanningOptions(cohortId) {
  requireValue(cohortId, "Select a programme cohort.");

  const data = await callRpc(
    "get_weekly_planning_options",
    { p_cohort_id: cohortId },
  );

  return {
    students: Array.isArray(data?.students)
      ? data.students
      : [],
    classes: Array.isArray(data?.classes)
      ? data.classes
      : [],
    staff: Array.isArray(data?.staff)
      ? data.staff
      : [],
  };
}

export async function getTeachingWeeks(cohortId) {
  requireValue(cohortId, "Select a programme cohort.");

  return callRpc("get_teaching_weeks", {
    p_cohort_id: cohortId,
  });
}

export async function getTeachingWeekDetails(teachingWeekId) {
  requireValue(teachingWeekId, "Select a teaching week.");

  const data = await callRpc(
    "get_teaching_week_details",
    { p_teaching_week_id: teachingWeekId },
  );

  return {
    week: data?.week || null,
    plans: Array.isArray(data?.plans)
      ? data.plans
      : [],
  };
}

export async function createTeachingWeek({
  cohortId,
  weekStart,
  notes,
}) {
  requireValue(cohortId, "Select a programme cohort.");
  requireValue(
    weekStart,
    "Select the Monday starting the week.",
  );

  return callRpc("create_teaching_week", {
    p_cohort_id: cohortId,
    p_week_start: weekStart,
    p_notes: optionalText(notes),
  });
}

export async function assignStudentProgrammeGroup({
  studentProfileId,
  programmeGroup,
}) {
  requireValue(studentProfileId, "Select a student.");

  if (!["A", "B"].includes(programmeGroup)) {
    throw new Error("Select programme Class A or B.");
  }

  return callRpc("assign_student_programme_group", {
    p_student_profile_id: studentProfileId,
    p_programme_group: programmeGroup,
  });
}

export async function saveWeeklyClassPlan({
  teachingWeekId,
  classId,
  notes,
}) {
  requireValue(teachingWeekId, "Select a teaching week.");
  requireValue(classId, "Select a course class.");

  return callRpc("save_weekly_class_plan", {
    p_teaching_week_id: teachingWeekId,
    p_class_id: classId,
    p_notes: optionalText(notes),
  });
}

export async function saveWeeklyClassStaff({
  weeklyClassPlanId,
  assignmentRole,
  staffProfileIds = [],
}) {
  requireValue(weeklyClassPlanId, "Select a weekly class.");
  validateStaffRole(assignmentRole);

  if (!Array.isArray(staffProfileIds)) {
    throw new Error("Select valid staff members.");
  }

  return callRpc("save_weekly_class_staff", {
    p_weekly_class_plan_id: weeklyClassPlanId,
    p_assignment_role: assignmentRole,
    p_staff_profile_ids: [...new Set(staffProfileIds)],
  });
}

export async function saveWeeklyLesson({
  weeklyClassPlanId,
  lessonId = null,
  title,
  lessonDate,
  startTime,
  endTime,
  topic,
  deliveryMode = "in_person",
  location,
  learningObjectives,
  notes,
}) {
  requireValue(weeklyClassPlanId, "Select a weekly class.");
  requireValue(title?.trim(), "Enter a lesson title.");
  requireValue(lessonDate, "Select the lesson date.");
  requireValue(startTime, "Enter the start time.");
  requireValue(endTime, "Enter the end time.");

  if (endTime <= startTime) {
    throw new Error(
      "The end time must follow the start time.",
    );
  }

  return callRpc("save_weekly_lesson", {
    p_weekly_class_plan_id: weeklyClassPlanId,
    p_lesson_id: lessonId || null,
    p_title: title.trim(),
    p_lesson_date: lessonDate,
    p_start_time: startTime,
    p_end_time: endTime,
    p_topic: optionalText(topic),
    p_delivery_mode: deliveryMode,
    p_location: optionalText(location),
    p_learning_objectives: optionalText(learningObjectives),
    p_notes: optionalText(notes),
  });
}

export async function saveWeeklyLessonWithTeam({
  teachingWeekId,
  classId,
  lesson,
  staff,
}) {
  requireValue(teachingWeekId, "Select a teaching week.");
  requireValue(classId, "Select a course class.");
  requireValue(
    lesson?.title?.trim(),
    "Enter a lesson title.",
  );
  requireValue(
    lesson?.lessonDate,
    "Select the lesson date.",
  );
  requireValue(
    lesson?.startTime,
    "Enter the start time.",
  );
  requireValue(
    lesson?.endTime,
    "Enter the end time.",
  );

  if (lesson.endTime <= lesson.startTime) {
    throw new Error(
      "The end time must follow the start time.",
    );
  }

  const deliveryMode = lesson.deliveryMode || "in_person";

  if (
    !["in_person", "online", "hybrid"].includes(deliveryMode)
  ) {
    throw new Error("Select a valid delivery mode.");
  }

  if (
    !staff ||
    typeof staff !== "object" ||
    Array.isArray(staff)
  ) {
    throw new Error("Select the teaching team.");
  }

  const staffEntries = Object.entries(staff);

  if (staffEntries.length === 0) {
    throw new Error("Select the teaching team.");
  }

  const normalizedStaff = {};

  for (const [role, ids] of staffEntries) {
    validateStaffRole(role);

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.some(
        (id) => typeof id !== "string" || !id.trim(),
      )
    ) {
      throw new Error(
        `Select at least one valid ${role}.`,
      );
    }

    normalizedStaff[role] = [
      ...new Set(ids.map((id) => id.trim())),
    ];
  }

  return callRpc("save_weekly_lesson_with_team", {
    p_teaching_week_id: teachingWeekId,
    p_class_id: classId,
    p_lesson: {
      lessonId: lesson.lessonId || null,
      title: lesson.title.trim(),
      lessonDate: lesson.lessonDate,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      topic: optionalText(lesson.topic),
      deliveryMode,
      location: optionalText(lesson.location),
      learningObjectives: optionalText(
        lesson.learningObjectives,
      ),
      notes: optionalText(lesson.notes),
    },
    p_staff: normalizedStaff,
  });
}

export async function removeWeeklyLesson({ lessonId }) {
  requireValue(lessonId, "Select a lesson.");

  return callRpc("remove_weekly_lesson", {
    p_lesson_id: lessonId,
  });
}

export async function saveWeeklyLessonStaff({
  lessonId,
  assignmentRole,
  staffProfileIds = [],
  useWeeklyDefault = false,
}) {
  requireValue(lessonId, "Select a lesson.");
  validateStaffRole(assignmentRole);

  if (!Array.isArray(staffProfileIds)) {
    throw new Error("Select valid staff members.");
  }

  return callRpc("save_weekly_lesson_staff", {
    p_weekly_lesson_id: lessonId,
    p_assignment_role: assignmentRole,
    p_staff_profile_ids: [...new Set(staffProfileIds)],
    p_use_weekly_default: Boolean(useWeeklyDefault),
  });
}

export async function reviewTeachingWeek({
  teachingWeekId,
}) {
  requireValue(teachingWeekId, "Select a teaching week.");

  return callRpc("review_teaching_week", {
    p_teaching_week_id: teachingWeekId,
  });
}

export async function getCourseTeachingTeamOptions(classId) {
  requireValue(classId, "Select a course class.");

  const data = await callRpc(
    "get_course_teaching_team_options",
    { p_class_id: classId },
  );

  return {
    roles: Array.isArray(data?.roles)
      ? data.roles
      : [],
    staff: Array.isArray(data?.staff)
      ? data.staff
      : [],
  };
}