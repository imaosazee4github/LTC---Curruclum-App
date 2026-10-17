import { supabase } from "../lib/supabase";

function cleanText(value) {
  return value?.trim() || null;
}

function nigeriaDateTimeToIso(value) {
  if (!value) {
    throw new Error("Select a due date and time.");
  }

  // The form supplies a datetime-local value in Nigeria time.
  const date = new Date(`${value}+01:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Select a valid due date and time.");
  }

  return date.toISOString();
}

export async function getMyAdvisoryFollowUps() {
  const { data, error } = await supabase.rpc(
    "get_my_advisory_follow_ups",
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Your follow-up actions could not be loaded.");
  }

  return {
    actions: Array.isArray(data.actions) ? data.actions : [],
  };
}

export async function createAdvisoryFollowUp({
  assignmentId,
  title,
  assignedTo,
  dueAt,
  description,
  priority = "normal",
  actionType = "support_follow_up",
  reportId = null,
}) {
  if (!assignmentId) {
    throw new Error("Select an assigned student.");
  }

  if (!title?.trim()) {
    throw new Error("Enter an action title.");
  }

  if (!assignedTo) {
    throw new Error("Select the advisor responsible for this action.");
  }

  const { data, error } = await supabase.rpc(
    "create_my_advisory_follow_up",
    {
      p_assignment_id: assignmentId,
      p_title: title.trim(),
      p_assigned_to: assignedTo,
      p_due_at: nigeriaDateTimeToIso(dueAt),
      p_description: cleanText(description),
      p_priority: priority,
      p_action_type: actionType,
      p_report_id: reportId || null,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("The follow-up action could not be created.");
  }

  return data;
}

export async function updateAdvisoryFollowUp({
  actionId,
  status,
  outcome,
  completionNotes,
}) {
  if (!actionId) {
    throw new Error("Select a follow-up action.");
  }

  if (!status) {
    throw new Error("Select an action status.");
  }

  if (status === "completed" && !outcome?.trim()) {
    throw new Error("Record the outcome before completing this action.");
  }

  if (status === "cancelled" && !completionNotes?.trim()) {
    throw new Error("Explain why the action is being cancelled.");
  }

  const { data, error } = await supabase.rpc(
    "update_my_advisory_follow_up",
    {
      p_action_id: actionId,
      p_status: status,
      p_outcome: cleanText(outcome),
      p_completion_notes: cleanText(completionNotes),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("The follow-up action could not be updated.");
  }

  return data;
}