import { supabase } from "../lib/supabase";

import {
  CORE_CHECKIN_QUESTIONS,
  FOLLOW_UP_QUESTIONS,
  getAdvisoryWeekGuide,
} from "../data/advisoryCheckinGuide";

export async function submitAdvisoryCheckin({
  assignmentId,
  reportType,
  programmeWeek,
  conversationDate,
  conversationSummary,
  answers = {},
  wellbeingRating,
  supportRecommended,
  followUpRequired,
  previousReportId,
  confidentialityLevel = "restricted",
}) {
  if (!assignmentId) {
    throw new Error("Select an assigned student.");
  }

  if (!["check_in", "follow_up"].includes(reportType)) {
    throw new Error("Select Check-In or Follow-Up.");
  }

  const guide = getAdvisoryWeekGuide(programmeWeek);

  if (!guide) {
    throw new Error("Select a programme week from 1 to 8.");
  }

  if (!conversationDate) {
    throw new Error("Enter the conversation date.");
  }

  if (!conversationSummary?.trim()) {
    throw new Error("Enter a brief conversation summary.");
  }

  const rating =
    wellbeingRating === "" || wellbeingRating == null
      ? null
      : Number(wellbeingRating);

  if (
    rating !== null &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    throw new Error("Select a well-being rating from 1 to 5.");
  }

  const questions = [
    ...CORE_CHECKIN_QUESTIONS,
    ...guide.questions,
    ...(reportType === "follow_up" ? FOLLOW_UP_QUESTIONS : []),
  ];

  // Save only answered questions from the selected week.
  // Include their wording to preserve the historical record.
  const responses = questions.flatMap(({ id, question }) => {
    const answer =
      typeof answers[id] === "string" ? answers[id].trim() : "";

    return answer ? [{ id, question, answer }] : [];
  });

  const { data, error } = await supabase.rpc(
    "submit_my_advisory_checkin",
    {
      p_assignment_id: assignmentId,
      p_report_type: reportType,
      p_programme_week: guide.week,
      p_conversation_date: conversationDate,
      p_conversation_summary: conversationSummary.trim(),
      p_responses: responses,
      p_wellbeing_rating: rating,
      p_support_recommended: supportRecommended?.trim() || null,
      p_follow_up_required: followUpRequired?.trim() || null,
      p_previous_report_id:
        reportType === "follow_up" ? previousReportId || null : null,
      p_confidentiality_level: confidentialityLevel,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error("Your advisory update could not be submitted.");
  }

  return data;
}