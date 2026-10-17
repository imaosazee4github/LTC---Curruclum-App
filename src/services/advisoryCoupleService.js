import { supabase } from "../lib/supabase";

export async function getAdvisoryCoupleOptions() {
  const { data, error } = await supabase.rpc(
    "get_advisory_couple_options",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Advisory couples could not be loaded.");
  }

  return {
    couples: Array.isArray(data.couples)
      ? data.couples
      : [],

    availableAdvisors: Array.isArray(data.availableAdvisors)
      ? data.availableAdvisors
      : [],
  };
}

export async function createAdvisoryCouple({
  displayName,
  firstMentorProfileId,
  secondMentorProfileId,
}) {
  if (!displayName?.trim()) {
    throw new Error("Enter a name for the advisory couple.");
  }

  if (!firstMentorProfileId || !secondMentorProfileId) {
    throw new Error("Select both Advisors.");
  }

  if (firstMentorProfileId === secondMentorProfileId) {
    throw new Error("Select two different Advisors.");
  }

  const { data, error } = await supabase.rpc(
    "create_advisory_couple",
    {
      p_display_name: displayName.trim(),
      p_first_mentor_profile_id: firstMentorProfileId,
      p_second_mentor_profile_id: secondMentorProfileId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("The advisory couple could not be created.");
  }

  return data;
}

export async function assignStudentToAdvisoryCouple({
  studentProfileId,
  coupleId,
  assignmentReason,
  nextCheckInAt,
}) {
  if (!studentProfileId || !coupleId) {
    throw new Error("Select a student and an advisory couple.");
  }

  // Input represents Nigeria time, regardless of browser timezone.
  let checkInTimestamp = null;

  if (nextCheckInAt) {
    const parsedDate = new Date(`${nextCheckInAt}+01:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Enter a valid next check-in date and time.");
    }

    checkInTimestamp = parsedDate.toISOString();
  }

  const { data, error } = await supabase.rpc(
    "assign_student_to_advisory_couple",
    {
      p_student_profile_id: studentProfileId,
      p_couple_id: coupleId,
      p_assignment_reason: assignmentReason?.trim() || null,
      p_next_check_in_at: checkInTimestamp,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("The student could not be assigned.");
  }

  return data;
}