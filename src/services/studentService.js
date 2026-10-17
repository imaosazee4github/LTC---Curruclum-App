import { supabase } from "../lib/supabase";

export async function initializeMyStudentProfile() {
  const { data, error } = await supabase.rpc(
    "initialize_my_student_profile",
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getMyStudentProfile(profileId) {
  if (!profileId) {
    return null;
  }

  const { data, error } = await supabase
    .from("student_profiles")
    .select(`
      id,
      profile_id,
      student_number,
      cohort_id,
      assigned_mentor_id,
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
      enrollment_status,
      profile_completion_percentage,
      created_at,
      updated_at,

      cohort:programme_cohorts (
        id,
        name,
        code,
        cohort_number,
        description,
        start_date,
        expected_completion_date,
        status
      )
    `)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getOrInitializeStudentProfile(profileId) {
  if (!profileId) {
    return null;
  }

  let studentProfile = await getMyStudentProfile(profileId);

  if (studentProfile) {
    return studentProfile;
  }

  await initializeMyStudentProfile();

  studentProfile = await getMyStudentProfile(profileId);

  if (!studentProfile) {
    throw new Error(
      "Your student profile could not be initialized.",
    );
  }

  return studentProfile;
}

export async function updateMyStudentProfile({
  fullName,
  phone,
  preferredName,
  dateOfBirth,
  gender,
  residentialAddress,
  city,
  state,
  country,
  emergencyContactName,
  emergencyContactRelationship,
  emergencyContactPhone,
}) {
  const { data, error } = await supabase.rpc(
    "update_my_student_profile",
    {
      p_full_name: fullName?.trim() || "",
      p_phone: phone?.trim() || "",
      p_preferred_name: preferredName?.trim() || null,
      p_date_of_birth: dateOfBirth || null,
      p_gender: gender || null,
      p_residential_address: residentialAddress?.trim() || null,
      p_city: city?.trim() || null,
      p_state: state?.trim() || null,
      p_country: country?.trim() || "Nigeria",
      p_emergency_contact_name: emergencyContactName?.trim() || null,
      p_emergency_contact_relationship:
        emergencyContactRelationship?.trim() || null,
      p_emergency_contact_phone: emergencyContactPhone?.trim() || null,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateMyProfilePhoto({ secureUrl, publicId }) {
  if (!secureUrl || !publicId) {
    throw new Error(
      "Cloudinary did not return the required image information.",
    );
  }

  const { data, error } = await supabase.rpc(
    "update_my_profile_photo",
    {
      p_profile_photo_url: secureUrl,
      p_profile_photo_public_id: publicId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getMyAssignedMentor() {
  const { data, error } = await supabase.rpc(
    "get_my_assigned_mentor",
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: Boolean(data?.success),
    assigned: Boolean(data?.assigned),
    mentor: data?.mentor || null,
    message: data?.message || "",
  };
}

export async function getMyApprovedMentorFeedback() {
  const { data, error } = await supabase.rpc(
    "get_my_approved_mentor_feedback",
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: Boolean(data?.success),
    assignedMentor: data?.assignedMentor || null,
    summary: {
      approvedFeedback: Number(data?.summary?.approvedFeedback) || 0,
    },
    feedback: Array.isArray(data?.feedback) ? data.feedback : [],
  };
}

export async function getMyStudentDailySchedule(date) {
  if (!date) {
    throw new Error("Select a schedule date.");
  }

  const [learningResult, serviceResult] = await Promise.all([
    supabase.rpc("get_my_student_daily_schedule", {
      p_date: date,
    }),
    supabase.rpc("get_my_student_service_schedule", {
      p_date: date,
    }),
  ]);

  if (learningResult.error) {
    throw new Error(learningResult.error.message);
  }

  if (serviceResult.error) {
    throw new Error(serviceResult.error.message);
  }

  if (!learningResult.data?.success || !serviceResult.data?.success) {
    throw new Error(
      "Your complete daily schedule could not be loaded.",
    );
  }

  const learningActivities = Array.isArray(
    learningResult.data.activities,
  )
    ? learningResult.data.activities
    : [];

  const serviceActivities = Array.isArray(
    serviceResult.data.activities,
  )
    ? serviceResult.data.activities
    : [];

  const activities = [
    ...learningActivities,
    ...serviceActivities,
  ].sort(
    (a, b) =>
      String(a.start_time || "").localeCompare(
        String(b.start_time || ""),
      ) ||
      String(a.title || "").localeCompare(String(b.title || "")) ||
      String(a.id).localeCompare(String(b.id)),
  );

  return {
    date,
    timezone: "Africa/Lagos",
    activities,
  };
}

export async function getMyStudentCoaching() {
  const { data, error } = await supabase.rpc(
    "get_my_student_coaching",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Your coaching records could not be loaded.");
  }

  return {
    assignments: Array.isArray(data.assignments)
      ? data.assignments
      : [],
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
    followUps: Array.isArray(data.followUps) ? data.followUps : [],
  };
}

export async function getMyStudentLearning() {
  const { data, error } = await supabase.rpc(
    "get_my_student_learning",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Your courses could not be loaded.");
  }

  return {
    classes: Array.isArray(data.classes) ? data.classes : [],
  };
}

export async function getMyStudentService() {
  const { data, error } = await supabase.rpc(
    "get_my_student_service",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Your service records could not be loaded.");
  }

  return {
    timezone: data.timezone || "Africa/Lagos",
    assignments: Array.isArray(data.assignments)
      ? data.assignments
      : [],
  };
}