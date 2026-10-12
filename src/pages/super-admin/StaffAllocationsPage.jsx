import {
  BriefcaseBusiness,
  GraduationCap,
  UserRoundCheck,
  Users,
} from "lucide-react";

import { useState } from "react";

import { useStaffAllocations } from "../../hooks/useStaffAllocations";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";

const initialClassForm = {
  classId: "",
  staffProfileId: "",
  assignmentRole: "instructor",
  notes: "",
};

const initialCoachForm = {
  studentProfileId: "",
  coachStaffProfileId: "",
  developmentArea: "",
  goal: "",
  currentPosition: "",
  practicePlan: "",
  targetDate: "",
};

const initialSupervisorForm = {
  projectId: "",
  supervisorStaffProfileId: "",
  supervisorType: "service_coordinator",
  notes: "",
};

export default function StaffAllocationsPage() {
  const {
    allocationManagement,
    coachingManagement,
    supervisorManagement,
    allocationManagementLoading,
    allocationManagementError,
    assignStaff,
    assigningStaff,
    assignStaffError,
    resetAssignStaff,
    assignCoach,
    assigningCoach,
    assignCoachError,
    resetAssignCoach,
    assignSupervisor,
    assigningSupervisor,
    assignSupervisorError,
    resetAssignSupervisor,
  } = useStaffAllocations();

  const [allocationType, setAllocationType] =
    useState("instructor");
  const [classForm, setClassForm] =
    useState(initialClassForm);
  const [coachForm, setCoachForm] =
    useState(initialCoachForm);
  const [supervisorForm, setSupervisorForm] =
    useState(initialSupervisorForm);
  const [successMessage, setSuccessMessage] =
    useState("");

  function handleTypeChange(event) {
    const value = event.target.value;
    setAllocationType(value);
    setSuccessMessage("");
    resetAssignStaff();
    resetAssignCoach();
    resetAssignSupervisor();

    if (["instructor", "facilitator"].includes(value)) {
      setClassForm((current) => ({
        ...current,
        assignmentRole: value,
        staffProfileId: "",
      }));
    }
  }

  function updateForm(setter) {
    return (event) => {
      const { name, value } = event.target;
      setter((current) => ({ ...current, [name]: value }));
      setSuccessMessage("");
    };
  }

  async function submitClass(event) {
    event.preventDefault();
    setSuccessMessage("");
    try {
      const result = await assignStaff({
        ...classForm,
        assignmentRole: allocationType,
      });
      setClassForm({
        ...initialClassForm,
        assignmentRole: allocationType,
      });
      setSuccessMessage(result?.message || "Staff allocated successfully.");
    } catch {
      // Mutation exposes the error.
    }
  }

  async function submitCoach(event) {
    event.preventDefault();
    setSuccessMessage("");
    try {
      const result = await assignCoach(coachForm);
      setCoachForm(initialCoachForm);
      setSuccessMessage(result?.message || "Coach allocated successfully.");
    } catch {
      // Mutation exposes the error.
    }
  }

  async function submitSupervisor(event) {
    event.preventDefault();
    setSuccessMessage("");
    try {
      const result = await assignSupervisor(supervisorForm);
      setSupervisorForm(initialSupervisorForm);
      setSuccessMessage(result?.message || "Supervisor allocated successfully.");
    } catch {
      // Mutation exposes the error.
    }
  }

  if (allocationManagementLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading staff allocations..." />
      </SuperAdminLayout>
    );
  }

  if (
    allocationManagementError ||
    !allocationManagement ||
    !coachingManagement ||
    !supervisorManagement
  ) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            allocationManagementError?.message ||
            "Staff allocation data could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  const classStaff = allocationManagement.staff.filter(
    (member) => member.appointedRole === allocationType,
  );

  const supervisorStaff = supervisorManagement.supervisors.filter(
    (member) => member.supervisorType === supervisorForm.supervisorType,
  );

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Central Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              Staff Allocations
            </h1>
            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Allocate appointed educators to classes, students and service
              projects. Staff appointments remain under Staff Management.
            </p>
          </header>

          {successMessage ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Instructors"
              value={allocationManagement.summary.appointedInstructors}
              icon={GraduationCap}
              tone="green"
            />
            <SummaryCard
              label="Facilitators"
              value={allocationManagement.summary.appointedFacilitators}
              icon={Users}
              tone="purple"
            />
            <SummaryCard
              label="Coaches"
              value={coachingManagement.summary.totalCoaches}
              icon={UserRoundCheck}
              tone="blue"
            />
            <SummaryCard
              label="Supervisors"
              value={supervisorManagement.summary.appointedSupervisors}
              icon={BriefcaseBusiness}
              tone="amber"
            />
          </section>

          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block max-w-md">
              <span className="text-sm font-semibold text-slate-700">
                Allocation Type
              </span>
              <select
                value={allocationType}
                onChange={handleTypeChange}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="instructor">Instructor → Class</option>
                <option value="facilitator">Facilitator → Class</option>
                <option value="coach">Coach → Student</option>
                <option value="supervisor">Supervisor → Service Project</option>
              </select>
            </label>
          </section>

          <section className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
            {["instructor", "facilitator"].includes(allocationType) ? (
              <ClassAllocationForm
                type={allocationType}
                form={classForm}
                classes={allocationManagement.classes}
                staff={classStaff}
                onChange={updateForm(setClassForm)}
                onSubmit={submitClass}
                submitting={assigningStaff}
                error={assignStaffError}
              />
            ) : null}

            {allocationType === "coach" ? (
              <CoachAllocationForm
                form={coachForm}
                coaches={coachingManagement.coaches}
                students={coachingManagement.students}
                onChange={updateForm(setCoachForm)}
                onSubmit={submitCoach}
                submitting={assigningCoach}
                error={assignCoachError}
              />
            ) : null}

            {allocationType === "supervisor" ? (
              <SupervisorAllocationForm
                form={supervisorForm}
                projects={supervisorManagement.projects}
                supervisors={supervisorStaff}
                onChange={updateForm(setSupervisorForm)}
                onSubmit={submitSupervisor}
                submitting={assigningSupervisor}
                error={assignSupervisorError}
              />
            ) : null}

            <CurrentAllocations
              type={allocationType}
              classAllocations={allocationManagement.allocations}
              coachingAllocations={coachingManagement.assignments}
              supervisorAllocations={supervisorManagement.assignments}
            />
          </section>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function ClassAllocationForm({
  type,
  form,
  classes,
  staff,
  onChange,
  onSubmit,
  submitting,
  error,
}) {
  return (
    <FormShell
      title={`Allocate ${formatLabel(type)}`}
      description={`Connect an appointed ${type} to a class.`}
      onSubmit={onSubmit}
      submitting={submitting}
      submitLabel={`Allocate ${formatLabel(type)}`}
      error={error}
    >
      <SelectField label="Class" name="classId" value={form.classId} onChange={onChange} required>
        <option value="">Select a class</option>
        {classes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.code} — {item.name} — {item.cohortName}
          </option>
        ))}
      </SelectField>
      <SelectField label={formatLabel(type)} name="staffProfileId" value={form.staffProfileId} onChange={onChange} required>
        <option value="">Select an appointed {type}</option>
        {staff.map((member) => (
          <option key={member.staffProfileId} value={member.staffProfileId}>
            {member.fullName || member.email}
          </option>
        ))}
      </SelectField>
      <TextArea name="notes" label="Notes" value={form.notes} onChange={onChange} />
      {staff.length === 0 ? <EmptyNotice text={`No active ${type} appointment is available.`} /> : null}
    </FormShell>
  );
}

function CoachAllocationForm({ form, coaches, students, onChange, onSubmit, submitting, error }) {
  return (
    <FormShell title="Allocate Coach" description="Connect an appointed coach to a student development goal." onSubmit={onSubmit} submitting={submitting} submitLabel="Allocate Coach" error={error}>
      <SelectField label="Coach" name="coachStaffProfileId" value={form.coachStaffProfileId} onChange={onChange} required>
        <option value="">Select an appointed coach</option>
        {coaches.map((coach) => (
          <option key={coach.staff_profile_id} value={coach.staff_profile_id}>
            {coach.full_name || coach.email}
          </option>
        ))}
      </SelectField>
      <SelectField label="Student" name="studentProfileId" value={form.studentProfileId} onChange={onChange} required>
        <option value="">Select a student</option>
        {students.map((student) => (
          <option key={student.student_profile_id} value={student.student_profile_id}>
            {student.full_name || student.email}
          </option>
        ))}
      </SelectField>
      <Input label="Development Area" name="developmentArea" value={form.developmentArea} onChange={onChange} required />
      <TextArea label="Goal" name="goal" value={form.goal} onChange={onChange} required />
      <TextArea label="Current Position" name="currentPosition" value={form.currentPosition} onChange={onChange} />
      <TextArea label="Practice Plan" name="practicePlan" value={form.practicePlan} onChange={onChange} required />
      <Input label="Target Date" name="targetDate" type="date" value={form.targetDate} onChange={onChange} />
      {coaches.length === 0 ? <EmptyNotice text="No active coach appointment is available." /> : null}
    </FormShell>
  );
}

function SupervisorAllocationForm({ form, projects, supervisors, onChange, onSubmit, submitting, error }) {
  const openProjects = projects.filter((project) => ["planned", "active"].includes(project.status));
  return (
    <FormShell title="Allocate Supervisor" description="Connect an appointed supervisor to a service project." onSubmit={onSubmit} submitting={submitting} submitLabel="Allocate Supervisor" error={error}>
      <SelectField label="Responsibility" name="supervisorType" value={form.supervisorType} onChange={onChange} required>
        <option value="service_coordinator">Service Coordinator</option>
        <option value="site_supervisor">Site Supervisor</option>
      </SelectField>
      <SelectField label="Service Project" name="projectId" value={form.projectId} onChange={onChange} required>
        <option value="">Select a project</option>
        {openProjects.map((project) => (
          <option key={project.projectId} value={project.projectId}>
            {project.code} — {project.title}
          </option>
        ))}
      </SelectField>
      <SelectField label="Supervisor" name="supervisorStaffProfileId" value={form.supervisorStaffProfileId} onChange={onChange} required>
        <option value="">Select an appointed supervisor</option>
        {supervisors.map((member) => (
          <option key={member.staffProfileId} value={member.staffProfileId}>
            {member.fullName || member.email}
          </option>
        ))}
      </SelectField>
      <TextArea label="Notes" name="notes" value={form.notes} onChange={onChange} />
      {openProjects.length === 0 ? <EmptyNotice text="No planned or active service project is available." /> : null}
      {supervisors.length === 0 ? <EmptyNotice text="No supervisor with this responsibility is appointed." /> : null}
    </FormShell>
  );
}

function CurrentAllocations({ type, classAllocations, coachingAllocations, supervisorAllocations }) {
  let items = [];
  if (["instructor", "facilitator"].includes(type)) {
    items = classAllocations
      .filter((item) => item.assignmentRole === type && item.status === "active")
      .map((item) => ({
        id: item.assignmentId,
        name: item.staffName || item.staffEmail,
        target: `${item.classCode} — ${item.className}`,
        detail: item.cohortName,
      }));
  } else if (type === "coach") {
    items = coachingAllocations
      .filter((item) => item.status === "active")
      .map((item) => ({
        id: item.assignment_id,
        name: item.coach?.full_name || item.coach?.email,
        target: item.student?.full_name || item.student?.email,
        detail: item.development_area,
      }));
  } else {
    items = supervisorAllocations
      .filter((item) => item.status === "active")
      .map((item) => ({
        id: item.assignmentId,
        name: item.supervisorName || item.supervisorEmail,
        target: `${item.projectCode} — ${item.projectTitle}`,
        detail: formatLabel(item.supervisorType),
      }));
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="text-xl font-bold text-slate-950">Current {formatLabel(type)} Allocations</h2>
        <p className="mt-1 text-sm text-slate-600">Active responsibilities for the selected role.</p>
      </div>
      {items.length ? (
        <div className="divide-y divide-slate-200">
          {items.map((item) => (
            <article key={item.id} className="p-5">
              <p className="font-bold text-slate-950">{item.name || "Staff member"}</p>
              <p className="mt-2 font-semibold text-blue-700">{item.target}</p>
              <p className="mt-1 text-sm text-slate-500">{item.detail || "No additional details"}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-sm text-slate-500">No active allocations for this role.</div>
      )}
    </section>
  );
}

function FormShell({ title, description, onSubmit, submitting, submitLabel, error, children }) {
  return (
    <form onSubmit={onSubmit} className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-6 space-y-4">{children}</div>
      {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</div> : null}
      <button type="submit" disabled={submitting} className="mt-6 w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? "Saving Allocation..." : submitLabel}
      </button>
    </form>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select {...props} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
        {children}
      </select>
    </label>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input {...props} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea {...props} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
    </label>
  );
}

function EmptyNotice({ text }) {
  return <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{text}</div>;
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${tones[tone]}`}><Icon className="h-6 w-6" /></div>
      </div>
    </article>
  );
}

function PageMessage({ message, error = false }) {
  return (
    <main className="p-5 md:p-8">
      <div className={`mx-auto max-w-3xl rounded-xl border px-5 py-8 text-center ${error ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600"}`}>
        {message}
      </div>
    </main>
  );
}

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
