import { supabase } from "../lib/supabase";

export async function getMyInstructorDashboard() {
  const { data, error } =
    await supabase.rpc(
      "get_my_instructor_dashboard",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    instructor:
      data?.instructor || null,

    summary: {
      assignedCourses:
        Number(
          data?.summary
            ?.assignedCourses,
        ) || 0,

      activeClasses:
        Number(
          data?.summary
            ?.activeClasses,
        ) || 0,

      assignedStudents:
        Number(
          data?.summary
            ?.assignedStudents,
        ) || 0,

      sessionsToday:
        Number(
          data?.summary
            ?.sessionsToday,
        ) || 0,

      upcomingSessions:
        Number(
          data?.summary
            ?.upcomingSessions,
        ) || 0,

      openFollowUps:
        Number(
          data?.summary
            ?.openFollowUps,
        ) || 0,
    },

    courses:
      Array.isArray(data?.courses)
        ? data.courses
        : [],

    upcomingSessions:
      Array.isArray(
        data?.upcomingSessions,
      )
        ? data.upcomingSessions
        : [],

    followUps:
      Array.isArray(data?.followUps)
        ? data.followUps
        : [],
  };
}

export async function getMyInstructorStudents({
  classId = null,
} = {}) {
  const { data, error } =
    await supabase.rpc(
      "get_my_instructor_students",
      {
        p_class_id:
          classId || null,
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    classId:
      data?.class_id || null,

    totalStudents:
      Number(data?.totalStudents) ||
      0,

    students:
      Array.isArray(data?.students)
        ? data.students
        : [],
  };
}

export async function recordStudentAttendance({
  sessionId,
  studentProfileId,
  attendanceStatus,
  arrivalTime,
  departureTime,
  notes,
  followUpRequired = false,
}) {
  if (!sessionId) {
    throw new Error(
      "Select a class session.",
    );
  }

  if (!studentProfileId) {
    throw new Error(
      "Select a student.",
    );
  }

  if (!attendanceStatus) {
    throw new Error(
      "Select an attendance status.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "record_student_attendance",
      {
        p_session_id:
          sessionId,

        p_student_profile_id:
          studentProfileId,

        p_attendance_status:
          attendanceStatus,

        p_arrival_time:
          arrivalTime || null,

        p_departure_time:
          departureTime || null,

        p_notes:
          cleanOptionalText(notes),

        p_follow_up_required:
          Boolean(followUpRequired),
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function recordStudentLearning({
  classId,
  studentProfileId,
  recordType,
  learningStatus,
  sessionId,
  activityTitle,
  observation,
  evidenceDescription,
  evidenceUrl,
  strengths,
  developmentArea,
  feedback,
  concern,
  followUpRequired = false,
  followUpAction,
  followUpStatus,
}) {
  if (!classId) {
    throw new Error(
      "Select a class.",
    );
  }

  if (!studentProfileId) {
    throw new Error(
      "Select a student.",
    );
  }

  if (!recordType) {
    throw new Error(
      "Select a learning record type.",
    );
  }

  if (!learningStatus) {
    throw new Error(
      "Select a learning status.",
    );
  }

  const hasRecordContent =
    Boolean(activityTitle?.trim()) ||
    Boolean(observation?.trim()) ||
    Boolean(
      evidenceDescription?.trim(),
    ) ||
    Boolean(feedback?.trim()) ||
    Boolean(concern?.trim());

  if (!hasRecordContent) {
    throw new Error(
      "Enter an activity, observation, evidence, feedback, or concern.",
    );
  }

  if (
    followUpRequired &&
    !followUpAction?.trim()
  ) {
    throw new Error(
      "Enter the required follow-up action.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "record_student_learning",
      {
        p_class_id:
          classId,

        p_student_profile_id:
          studentProfileId,

        p_record_type:
          recordType,

        p_learning_status:
          learningStatus,

        p_session_id:
          sessionId || null,

        p_activity_title:
          cleanOptionalText(
            activityTitle,
          ),

        p_observation:
          cleanOptionalText(
            observation,
          ),

        p_evidence_description:
          cleanOptionalText(
            evidenceDescription,
          ),

        p_evidence_url:
          cleanOptionalText(
            evidenceUrl,
          ),

        p_strengths:
          cleanOptionalText(
            strengths,
          ),

        p_development_area:
          cleanOptionalText(
            developmentArea,
          ),

        p_feedback:
          cleanOptionalText(
            feedback,
          ),

        p_concern:
          cleanOptionalText(
            concern,
          ),

        p_follow_up_required:
          Boolean(followUpRequired),

        p_follow_up_action:
          cleanOptionalText(
            followUpAction,
          ),

        p_follow_up_status:
          followUpRequired
            ? followUpStatus ||
              "open"
            : null,
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