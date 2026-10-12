import {
  CalendarPlus,
  FolderPlus,
} from "lucide-react";

import { useState } from "react";

import {
  useSupervisorDashboard,
} from "../../hooks/useSupervisorDashboard";

import SupervisorLayout from "../../layouts/SupervisorLayout";

const initialProjectForm = {
  code: "",
  title: "",
  location: "",
  description: "",
  expectedOutcomes: "",
  safetyRequirements: "",
  startDate: "",
  endDate: "",
  status: "planned",
};

const initialScheduleForm = {
  projectId: "",
  scheduleDate: "",
  startTime: "",
  endTime: "",
  taskTitle: "",
  location: "",
  taskDescription: "",
  expectedOutcome: "",
  safetyRequirements: "",
  responsibilityLevel: "guided",
  status: "scheduled",
};

export default function ServiceProjectsPage() {
  const {
    supervisorDashboard,
    supervisorType,
    supervisorProjects,
    supervisorDashboardLoading,
    supervisorDashboardError,
    createProject,
    creatingProject,
    createProjectError,
    resetCreateProject,
    createSchedule,
    creatingSchedule,
    createScheduleError,
    resetCreateSchedule,
  } = useSupervisorDashboard();

  const [
    projectForm,
    setProjectForm,
  ] = useState(initialProjectForm);

  const [
    scheduleForm,
    setScheduleForm,
  ] = useState(initialScheduleForm);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  function handleProjectChange(event) {
    const {
      name,
      value,
    } = event.target;

    setProjectForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    resetCreateProject();
  }

  function handleScheduleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setScheduleForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    resetCreateSchedule();
  }

  async function handleCreateProject(
    event,
  ) {
    event.preventDefault();
    setSuccessMessage("");

    try {
      const result =
        await createProject(
          projectForm,
        );

      setProjectForm(
        initialProjectForm,
      );

      setSuccessMessage(
        result?.message ||
          "The service project was created successfully.",
      );
    } catch {
      // The mutation exposes the error.
    }
  }

  async function handleCreateSchedule(
    event,
  ) {
    event.preventDefault();
    setSuccessMessage("");

    try {
      const result =
        await createSchedule(
          scheduleForm,
        );

      setScheduleForm(
        initialScheduleForm,
      );

      setSuccessMessage(
        result?.message ||
          "The project activity was scheduled successfully.",
      );
    } catch {
      // The mutation exposes the error.
    }
  }

  if (supervisorDashboardLoading) {
    return (
      <SupervisorLayout>
        <PageMessage message="Loading service projects..." />
      </SupervisorLayout>
    );
  }

  if (
    supervisorDashboardError ||
    !supervisorDashboard
  ) {
    return (
      <SupervisorLayout>
        <PageMessage
          error
          message={
            supervisorDashboardError
              ?.message ||
            "Service projects could not be loaded."
          }
        />
      </SupervisorLayout>
    );
  }

  if (
    supervisorType !==
    "service_coordinator"
  ) {
    return (
      <SupervisorLayout
        supervisorType={
          supervisorType
        }
      >
        <PageMessage
          error
          message="Only the Service Coordinator can create and schedule service projects."
        />
      </SupervisorLayout>
    );
  }

  const availableProjects =
    supervisorProjects.filter(
      (project) =>
        ![
          "completed",
          "cancelled",
        ].includes(project.status),
    );

  return (
    <SupervisorLayout
      supervisorType={supervisorType}
    >
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Service Coordination
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              Projects & Schedules
            </h1>

            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Create service projects and
              schedule the tasks students
              will complete.
            </p>
          </header>

          {successMessage ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <section className="mt-8 grid gap-8 xl:grid-cols-2">
            <ProjectForm
              form={projectForm}
              onChange={
                handleProjectChange
              }
              onSubmit={
                handleCreateProject
              }
              submitting={
                creatingProject
              }
              error={
                createProjectError
              }
            />

            <ScheduleForm
              form={scheduleForm}
              projects={
                availableProjects
              }
              onChange={
                handleScheduleChange
              }
              onSubmit={
                handleCreateSchedule
              }
              submitting={
                creatingSchedule
              }
              error={
                createScheduleError
              }
            />
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Project Directory
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                All service projects and
                their scheduling progress.
              </p>
            </div>

            {supervisorProjects.length >
            0 ? (
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                {supervisorProjects.map(
                  (project) => (
                    <ProjectCard
                      key={
                        project.project_id
                      }
                      project={project}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-500">
                No service projects have
                been created.
              </div>
            )}
          </section>
        </div>
      </main>
    </SupervisorLayout>
  );
}

function ProjectForm({
  form,
  onChange,
  onSubmit,
  submitting,
  error,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <FormHeading
        icon={FolderPlus}
        title="Create Service Project"
        description="Define a project, location and expected outcomes."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="Project Code"
          name="code"
          value={form.code}
          onChange={onChange}
          placeholder="SP-001"
          required
        />

        <Field
          label="Project Title"
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="Community Construction"
          required
        />

        <Field
          label="Location"
          name="location"
          value={form.location}
          onChange={onChange}
          placeholder="Project worksite"
          required
        />

        <SelectField
          label="Project Status"
          name="status"
          value={form.status}
          onChange={onChange}
        >
          <option value="planned">
            Planned
          </option>

          <option value="active">
            Active
          </option>
        </SelectField>

        <Field
          label="Start Date"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={onChange}
          required
        />

        <Field
          label="End Date"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={onChange}
        />
      </div>

      <TextArea
        label="Description"
        name="description"
        value={form.description}
        onChange={onChange}
      />

      <TextArea
        label="Expected Outcomes"
        name="expectedOutcomes"
        value={form.expectedOutcomes}
        onChange={onChange}
      />

      <TextArea
        label="Safety Requirements"
        name="safetyRequirements"
        value={form.safetyRequirements}
        onChange={onChange}
      />

      <FormError error={error} />

      <SubmitButton
        submitting={submitting}
        idleLabel="Create Project"
        busyLabel="Creating Project..."
      />
    </form>
  );
}

function ScheduleForm({
  form,
  projects,
  onChange,
  onSubmit,
  submitting,
  error,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <FormHeading
        icon={CalendarPlus}
        title="Schedule Project Activity"
        description="Set the date, time, task and responsibility level."
      />

      <div className="mt-6">
        <SelectField
          label="Service Project"
          name="projectId"
          value={form.projectId}
          onChange={onChange}
          required
        >
          <option value="">
            Select a project
          </option>

          {projects.map((project) => (
            <option
              key={project.project_id}
              value={project.project_id}
            >
              {project.code} —{" "}
              {project.title}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          label="Schedule Date"
          name="scheduleDate"
          type="date"
          value={form.scheduleDate}
          onChange={onChange}
          required
        />

        <Field
          label="Task Title"
          name="taskTitle"
          value={form.taskTitle}
          onChange={onChange}
          placeholder="Foundation preparation"
          required
        />

        <Field
          label="Start Time"
          name="startTime"
          type="time"
          value={form.startTime}
          onChange={onChange}
          required
        />

        <Field
          label="End Time"
          name="endTime"
          type="time"
          value={form.endTime}
          onChange={onChange}
          required
        />

        <Field
          label="Location Override"
          name="location"
          value={form.location}
          onChange={onChange}
          placeholder="Uses project location if blank"
        />

        <SelectField
          label="Responsibility Level"
          name="responsibilityLevel"
          value={
            form.responsibilityLevel
          }
          onChange={onChange}
        >
          <option value="guided">
            Guided
          </option>

          <option value="supported">
            Supported
          </option>

          <option value="independent">
            Independent
          </option>

          <option value="team_lead">
            Team Lead
          </option>
        </SelectField>
      </div>

      <TextArea
        label="Task Description"
        name="taskDescription"
        value={form.taskDescription}
        onChange={onChange}
      />

      <TextArea
        label="Expected Outcome"
        name="expectedOutcome"
        value={form.expectedOutcome}
        onChange={onChange}
      />

      <TextArea
        label="Safety Requirements"
        name="safetyRequirements"
        value={form.safetyRequirements}
        onChange={onChange}
      />

      <FormError error={error} />

      <SubmitButton
        submitting={submitting}
        disabled={
          projects.length === 0
        }
        idleLabel="Schedule Activity"
        busyLabel="Scheduling..."
      />
    </form>
  );
}

function ProjectCard({ project }) {
  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
        {project.code}
      </p>

      <h3 className="mt-1 text-lg font-bold text-slate-950">
        {project.title}
      </h3>

      <p className="mt-2 text-sm text-slate-600">
        {project.location}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          {formatLabel(
            project.status,
          )}
        </span>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
          {Number(
            project.schedule_count,
          ) || 0}{" "}
          schedules
        </span>

        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
          {Number(
            project.student_count,
          ) || 0}{" "}
          students
        </span>
      </div>
    </article>
  );
}

function FormHeading({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-950">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  ...props
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      <input
        type={type}
        {...props}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({
  label,
  children,
  ...props
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      <select
        {...props}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

function TextArea({
  label,
  ...props
}) {
  return (
    <label className="mt-4 block text-sm font-semibold text-slate-700">
      {label}

      <textarea
        rows={3}
        {...props}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function FormError({ error }) {
  return error ? (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {error.message}
    </div>
  ) : null;
}

function SubmitButton({
  submitting,
  disabled = false,
  idleLabel,
  busyLabel,
}) {
  return (
    <button
      type="submit"
      disabled={
        submitting || disabled
      }
      className="mt-6 w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting
        ? busyLabel
        : idleLabel}
    </button>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
      <div
        className={`max-w-lg rounded-xl border px-6 py-5 text-center ${
          error
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        {message}
      </div>
    </main>
  );
}

function formatLabel(value) {
  return String(value || "planned")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}