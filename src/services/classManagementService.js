import { supabase } from "../lib/supabase";

export async function getClassManagementData() {
  const { data, error } = await supabase.rpc(
    "get_class_management_data",
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: Boolean(data?.success),
    summary: {
      totalClasses:
        Number(data?.summary?.totalClasses) || 0,
      activeClasses:
        Number(data?.summary?.activeClasses) || 0,
      weeklySchedules:
        Number(data?.summary?.weeklySchedules) || 0,
      scheduledSessions:
        Number(data?.summary?.scheduledSessions) || 0,
    },
    courses: Array.isArray(data?.courses)
      ? data.courses
      : [],
    cohorts: Array.isArray(data?.cohorts)
      ? data.cohorts
      : [],
    classes: Array.isArray(data?.classes)
      ? data.classes
      : [],
  };
}

export async function createProgrammeClass({
  courseId,
  cohortId,
  code,
  name,
  description,
  deliveryMode,
  location,
  startDate,
  endDate,
  enrollCohortStudents = true,
}) {
  if (!courseId) {
    throw new Error("Select a course.");
  }

  if (!cohortId) {
    throw new Error("Select a programme cohort.");
  }


  if (!name?.trim()) {
    throw new Error("Enter a class name.");
  }

  if (!startDate || !endDate) {
    throw new Error(
      "Select the class start and end dates.",
    );
  }

  const { data, error } = await supabase.rpc(
    "create_class",
    {
      p_course_id: courseId,
      p_cohort_id: cohortId,
      p_code: code?.trim() || null,
      p_name: name.trim(),
      p_description: cleanOptionalText(description),
      p_delivery_mode:
        deliveryMode || "in_person",
      p_location: cleanOptionalText(location),
      p_start_date: startDate,
      p_end_date: endDate,
      p_status: "planned",
      p_enroll_cohort_students:
        Boolean(enrollCohortStudents),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createClassSchedule({
  classId,
  dayOfWeek,
  startTime,
  endTime,
  location,
  notes,
}) {
  if (!classId) {
    throw new Error("Select a class.");
  }

  if (!dayOfWeek) {
    throw new Error("Select a day of the week.");
  }

  if (!startTime || !endTime) {
    throw new Error("Enter the start and end times.");
  }

  const { data, error } = await supabase.rpc(
    "create_class_schedule",
    {
      p_class_id: classId,
      p_day_of_week: dayOfWeek,
      p_start_time: startTime,
      p_end_time: endTime,
      p_location: cleanOptionalText(location),
      p_notes: cleanOptionalText(notes),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createClassSession({
  classId,
  title,
  sessionDate,
  startTime,
  endTime,
  sessionNumber,
  topic,
  learningObjectives,
  deliveryMode,
  location,
  notes,
}) {
  if (!classId) {
    throw new Error("Select a class.");
  }

  if (!title?.trim()) {
    throw new Error("Enter a session title.");
  }

  if (!sessionDate) {
    throw new Error("Select a session date.");
  }

  if (!startTime || !endTime) {
    throw new Error("Enter the start and end times.");
  }

  const parsedSessionNumber = sessionNumber
    ? Number(sessionNumber)
    : null;

  const { data, error } = await supabase.rpc(
    "create_class_session",
    {
      p_class_id: classId,
      p_title: title.trim(),
      p_session_date: sessionDate,
      p_start_time: startTime,
      p_end_time: endTime,
      p_session_number: parsedSessionNumber,
      p_topic: cleanOptionalText(topic),
      p_learning_objectives:
        cleanOptionalText(learningObjectives),
      p_delivery_mode:
        deliveryMode || "in_person",
      p_location: cleanOptionalText(location),
      p_notes: cleanOptionalText(notes),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function syncClassEnrollments({
  classId,
}) {
  if (!classId) {
    throw new Error("Select a class.");
  }

  const { data, error } = await supabase.rpc(
    "sync_class_enrollments",
    {
      p_class_id: classId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateClassroomAccess({
  classId,
  googleClassroomUrl,
  googleClassroomCode,
}) {
  if (!classId) {
    throw new Error("Select a class.");
  }

  const { data, error } = await supabase.rpc(
    "update_class_classroom_access",
    {
      p_class_id: classId,
      p_google_classroom_url:
        cleanOptionalText(googleClassroomUrl),
      p_google_classroom_code:
        cleanOptionalText(googleClassroomCode),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function cleanOptionalText(value) {
  const cleaned = value?.trim();
  return cleaned || null;
}