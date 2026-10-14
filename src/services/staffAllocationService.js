import { supabase } from "../lib/supabase";

export async function getStaffAllocationManagementData() {
  const { data, error } = await supabase.rpc(
    "get_staff_allocation_management_data",
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: Boolean(data?.success),

    summary: {
      totalClasses:
        Number(data?.summary?.totalClasses) || 0,

      appointedInstructors:
        Number(
          data?.summary?.appointedInstructors,
        ) || 0,

      appointedFacilitators:
        Number(
          data?.summary?.appointedFacilitators,
        ) || 0,

      activeAllocations:
        Number(
          data?.summary?.activeAllocations,
        ) || 0,
    },

    classes: Array.isArray(data?.classes)
      ? data.classes
      : [],

    staff: Array.isArray(data?.staff)
      ? data.staff
      : [],

    allocations: Array.isArray(
      data?.allocations,
    )
      ? data.allocations
      : [],
  };
}

export async function assignStaffToClass({
  classId,
  staffProfileId,
  assignmentRole,
  notes,
}) {
  if (!classId) {
    throw new Error("Select a class.");
  }

  if (!staffProfileId) {
    throw new Error("Select a staff member.");
  }

  if (
    ![
      "instructor",
      "facilitator",
    ].includes(assignmentRole)
  ) {
    throw new Error(
      "Select a valid assignment role.",
    );
  }

  const { data, error } = await supabase.rpc(
    "assign_staff_to_class",
    {
      p_class_id: classId,

      p_staff_profile_id:
        staffProfileId,

      p_assignment_role:
        assignmentRole,

      p_notes:
        cleanOptionalText(notes),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function closeStaffClassAssignment({
  assignmentId,
  closingStatus,
  closingNotes,
}) {
  if (!assignmentId) {
    throw new Error(
      "Select a staff allocation.",
    );
  }

  const selectedStatus =
    closingStatus || "inactive";

  if (
    ![
      "completed",
      "inactive",
    ].includes(selectedStatus)
  ) {
    throw new Error(
      "Select a valid closing status.",
    );
  }

  const { data, error } = await supabase.rpc(
    "close_staff_class_assignment",
    {
      p_assignment_id:
        assignmentId,

      p_closing_status:
        selectedStatus,

      p_closing_notes:
        cleanOptionalText(
          closingNotes,
        ),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function getSupervisorAllocationOptions() {
  const { data, error } = await supabase.rpc(
    "get_supervisor_allocation_options",
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
          data?.summary?.totalProjects,
        ) || 0,

      openProjects:
        Number(
          data?.summary?.openProjects,
        ) || 0,

      appointedSupervisors:
        Number(
          data?.summary
            ?.appointedSupervisors,
        ) || 0,

      activeAllocations:
        Number(
          data?.summary
            ?.activeAllocations,
        ) || 0,
    },

    projects:
      Array.isArray(data?.projects)
        ? data.projects
        : [],

    supervisors:
      Array.isArray(
        data?.supervisors,
      )
        ? data.supervisors
        : [],

    assignments:
      Array.isArray(
        data?.assignments,
      )
        ? data.assignments
        : [],
  };
}

export async function assignSupervisorToProject({
  projectId,
  supervisorStaffProfileId,
  supervisorType,
  notes,
}) {
  if (!projectId) {
    throw new Error(
      "Select a service project.",
    );
  }

  if (!supervisorStaffProfileId) {
    throw new Error(
      "Select a supervisor.",
    );
  }

  if (
    ![
      "service_coordinator",
      "site_supervisor",
    ].includes(supervisorType)
  ) {
    throw new Error(
      "Select a valid supervisor responsibility.",
    );
  }

  const { data, error } = await supabase.rpc(
    "assign_supervisor_to_service_project",
    {
      p_project_id:
        projectId,

      p_supervisor_staff_profile_id:
        supervisorStaffProfileId,

      p_supervisor_type:
        supervisorType,

      p_notes:
        cleanOptionalText(notes),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function closeSupervisorProjectAssignment({
  assignmentId,
  closingStatus,
  closingNotes,
}) {
  if (!assignmentId) {
    throw new Error(
      "Select a supervisor allocation.",
    );
  }

  const selectedStatus =
    closingStatus || "completed";

  if (
    ![
      "completed",
      "inactive",
    ].includes(selectedStatus)
  ) {
    throw new Error(
      "Select a valid closing status.",
    );
  }

  const { data, error } = await supabase.rpc(
    "close_service_project_supervisor_assignment",
    {
      p_assignment_id:
        assignmentId,

      p_closing_status:
        selectedStatus,

      p_closing_notes:
        cleanOptionalText(
          closingNotes,
        ),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function assignFacilitatorToLearningExperience({
  learningExperienceId,
  facilitatorStaffProfileId,
  assignmentRole,
  notes,
}) {
  if (!learningExperienceId) {
    throw new Error(
      "Select a learning experience.",
    );
  }

  if (!facilitatorStaffProfileId) {
    throw new Error(
      "Select a facilitator.",
    );
  }

  const { data, error } =
    await supabase.rpc(
      "assign_facilitator_to_learning_experience",
      {
        p_learning_experience_id:
          learningExperienceId,

        p_facilitator_staff_profile_id:
          facilitatorStaffProfileId,

        p_assignment_role:
          assignmentRole ||
          "facilitator",

        p_notes:
          notes?.trim() || null,
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