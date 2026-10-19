import { supabase } from "../lib/supabase";

export async function getAdvisoryStudentConcerns() {
  const { data, error } = await supabase.rpc(
    "get_advisory_student_concerns",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Student concerns could not be loaded.");
  }

  return {
    concerns: Array.isArray(data.concerns) ? data.concerns : [],
  };
}

export async function updateMyAdvisoryConcern({
  engagementRecordId,
  status,
  sharedUpdate,
}) {
  if (!engagementRecordId) {
    throw new Error("Select a student concern.");
  }

  if (!["acknowledged", "in_progress", "addressed"].includes(status)) {
    throw new Error("Select a valid concern status.");
  }

  const update = sharedUpdate?.trim() || "";

  if (
    ["in_progress", "addressed"].includes(status) &&
    !update
  ) {
    throw new Error(
      "Enter a brief shared update explaining the follow-up.",
    );
  }

  if (update.length > 3000) {
    throw new Error("Keep the shared update within 3,000 characters.");
  }

  const { data, error } = await supabase.rpc(
    "update_my_advisory_concern",
    {
      p_engagement_record_id: engagementRecordId,
      p_status: status,
      p_shared_update: update || null,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("The concern could not be updated.");
  }

  return data;
}

export async function getMyFacilitatorAdvisoryUpdates() {
  const { data, error } = await supabase.rpc(
    "get_my_facilitator_advisory_updates",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Advisory updates could not be loaded.");
  }

  return {
    updates: Array.isArray(data.updates) ? data.updates : [],
  };
}