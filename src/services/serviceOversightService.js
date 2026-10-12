import { supabase } from "../lib/supabase";

export async function getServiceOversightData() {
  const { data, error } =
    await supabase.rpc(
      "get_service_oversight_data",
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success:
      Boolean(data?.success),

    summary: {
      totalProjects:
        Number(
          data?.summary
            ?.totalProjects,
        ) || 0,

      activeProjects:
        Number(
          data?.summary
            ?.activeProjects,
        ) || 0,

      scheduledActivities:
        Number(
          data?.summary
            ?.scheduledActivities,
        ) || 0,

      assignedStudents:
        Number(
          data?.summary
            ?.assignedStudents,
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

      workReportsRecorded:
        Number(
          data?.summary
            ?.workReportsRecorded,
        ) || 0,

      workReportsPending:
        Number(
          data?.summary
            ?.workReportsPending,
        ) || 0,

      totalServiceHours:
        Number(
          data?.summary
            ?.totalServiceHours,
        ) || 0,
    },

    projects:
      Array.isArray(
        data?.projects,
      )
        ? data.projects
        : [],

    assignments:
      Array.isArray(
        data?.assignments,
      )
        ? data.assignments
        : [],
  };
}