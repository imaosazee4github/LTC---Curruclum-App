import { supabase } from "../lib/supabase";

export async function getInstructorOversightData() {
  const { data, error } =
    await supabase.rpc(
      "get_instructor_oversight_data",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: Boolean(data?.success),

    summary: {
      totalInstructors:
        Number(
          data?.summary
            ?.totalInstructors,
        ) || 0,

      activeClasses:
        Number(
          data?.summary
            ?.activeClasses,
        ) || 0,

      totalStudents:
        Number(
          data?.summary
            ?.totalStudents,
        ) || 0,

      scheduledSessions:
        Number(
          data?.summary
            ?.scheduledSessions,
        ) || 0,

      completedSessions:
        Number(
          data?.summary
            ?.completedSessions,
        ) || 0,

      attendanceRecorded:
        Number(
          data?.summary
            ?.attendanceRecorded,
        ) || 0,

      attendancePending:
        Number(
          data?.summary
            ?.attendancePending,
        ) || 0,

      followUpsRequired:
        Number(
          data?.summary
            ?.followUpsRequired,
        ) || 0,
    },

    instructors:
      Array.isArray(
        data?.instructors,
      )
        ? data.instructors
        : [],

    classes:
      Array.isArray(data?.classes)
        ? data.classes
        : [],

    attendance:
      Array.isArray(
        data?.attendance,
      )
        ? data.attendance
        : [],
  };
}