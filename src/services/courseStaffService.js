import { supabase } from "../lib/supabase";

export async function getCourseStaffOptions() {
  const { data, error } = await supabase.rpc(
    "get_staff_course_appointment_options",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Course appointments could not be loaded.");
  }

  return {
    courses: Array.isArray(data.courses) ? data.courses : [],
    appointments: Array.isArray(data.appointments)
      ? data.appointments
      : [],
  };
}

export async function appointStaffToCourse({
  profileId,
  courseId,
  role,
  specialization,
  biography,
}) {
  if (!profileId) {
    throw new Error("Select a staff account.");
  }

  if (!courseId) {
    throw new Error("Select a course.");
  }

  if (!["instructor", "facilitator", "coach"].includes(role)) {
    throw new Error("Select a valid educator role.");
  }

  const { data, error } = await supabase.rpc(
    "appoint_staff_to_course",
    {
      p_profile_id: profileId,
      p_course_id: courseId,
      p_role: role,
      p_specialization: specialization?.trim() || null,
      p_biography: biography?.trim() || null,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("The course appointment could not be saved.");
  }

  return data;
}