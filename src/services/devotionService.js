import { supabase } from "../lib/supabase";

export async function getDevotions(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error("Select a start and end date.");
  }

  if (endDate < startDate) {
    throw new Error("The end date must be on or after the start date.");
  }

  const { data, error } = await supabase.rpc("get_devotions", {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Devotions could not be loaded.");
  }

  return {
    devotions: Array.isArray(data.devotions) ? data.devotions : [],
    timezone: data.timezone || "Africa/Lagos",
  };
}

export async function saveDevotion(values) {
  const { data, error } = await supabase.rpc("save_devotion", {
    p_title: values.title.trim(),
    p_devotion_date: values.date,
    p_start_time: values.startTime,
    p_end_time: values.endTime,
    p_location: optionalText(values.location),
    p_meeting_url: optionalText(values.meetingUrl),
    p_recording_url: optionalText(values.recordingUrl),
    p_speaker: optionalText(values.speaker),
    p_description: optionalText(values.description),
    p_status: values.status,
    p_devotion_id: values.id || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("The devotion could not be saved.");
  }

  return data;
}

function optionalText(value) {
  return value?.trim() || null;
}