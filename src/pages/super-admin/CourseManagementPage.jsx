import {
  BookOpen,
  GraduationCap,
  Plus,
  UserRoundCheck,
  Users,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useCourseManagement,
} from "../../hooks/useCourseManagement";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";

const initialCourseForm = {
  code: "",
  title: "",
  description: "",
  learningArea: "",
  competencyBucket:
    "foundational_competencies",
  status: "planned",
};

const initialAssignmentForm = {
  courseId: "",
  staffProfileId: "",
  assignmentRole: "instructor",
};

export default function CourseManagementPage() {
  const {
    courseManagement,
    courseManagementLoading,
    courseManagementError,
    createCourse,
    creatingCourse,
    createCourseError,
    resetCreateCourse,
    assignInstructor,
    assigningInstructor,
    assignInstructorError,
    resetAssignInstructor,
    closeInstructorAssignment,
    closingInstructorAssignment,
  } = useCourseManagement();

  const [
    courseForm,
    setCourseForm,
  ] = useState(initialCourseForm);

  const [
    assignmentForm,
    setAssignmentForm,
  ] = useState(
    initialAssignmentForm,
  );

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  function handleCourseChange(event) {
    const {
      name,
      value,
    } = event.target;

    setCourseForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    resetCreateCourse();
  }

  function handleAssignmentChange(
    event,
  ) {
    const {
      name,
      value,
    } = event.target;

    setAssignmentForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );

    setSuccessMessage("");
    resetAssignInstructor();
  }

  async function handleCreateCourse(
    event,
  ) {
    event.preventDefault();
    setSuccessMessage("");

    try {
      const result =
        await createCourse(
          courseForm,
        );

      setCourseForm(
        initialCourseForm,
      );

      setSuccessMessage(
        result?.message ||
          "The course was created successfully.",
      );
    } catch {
      // The mutation exposes the error.
    }
  }

  async function handleAssignInstructor(
    event,
  ) {
    event.preventDefault();
    setSuccessMessage("");

    try {
      const result =
        await assignInstructor(
          assignmentForm,
        );

      setAssignmentForm(
        initialAssignmentForm,
      );

      setSuccessMessage(
        result?.message ||
          "The instructor was assigned successfully.",
      );
    } catch {
      // The mutation exposes the error.
    }
  }

  async function handleCloseAssignment(
    assignmentId,
  ) {
    const confirmed =
      window.confirm(
        "Remove this instructor from the course?",
      );

    if (!confirmed) {
      return;
    }

    setSuccessMessage("");

    try {
      const result =
        await closeInstructorAssignment({
          assignmentId,
          closingStatus: "inactive",
        });

      setSuccessMessage(
        result?.message ||
          "The instructor assignment was closed.",
      );
    } catch {
      // The mutation exposes the error.
    }
  }

  if (courseManagementLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading courses and instructors..." />
      </SuperAdminLayout>
    );
  }

  if (
    courseManagementError ||
    !courseManagement
  ) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            courseManagementError
              ?.message ||
            "Course management data could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  const {
    summary,
    courses,
    instructors,
  } = courseManagement;

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Academic Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              Learning Areas and Courses
            </h1>

            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Create courses and assign
              appointed instructors to
              their teaching areas.
            </p>
          </header>

          {successMessage ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Courses"
              value={
                summary.totalCourses
              }
              icon={BookOpen}
              tone="blue"
            />

            <SummaryCard
              label="Active Courses"
              value={
                summary.activeCourses
              }
              icon={GraduationCap}
              tone="green"
            />

            <SummaryCard
              label="Available Instructors"
              value={
                summary.activeInstructors
              }
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Active Assignments"
              value={
                summary.activeAssignments
              }
              icon={UserRoundCheck}
              tone="amber"
            />
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <CourseForm
              form={courseForm}
              onChange={
                handleCourseChange
              }
              onSubmit={
                handleCreateCourse
              }
              submitting={
                creatingCourse
              }
              error={
                createCourseError
              }
            />

            <AssignmentForm
              form={assignmentForm}
              courses={courses}
              instructors={
                instructors
              }
              onChange={
                handleAssignmentChange
              }
              onSubmit={
                handleAssignInstructor
              }
              submitting={
                assigningInstructor
              }
              error={
                assignInstructorError
              }
            />
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Course Directory
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Courses and their
                instructor assignments.
              </p>
            </div>

            {courses.length > 0 ? (
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                {courses.map(
                  (course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      closing={
                        closingInstructorAssignment
                      }
                      onClose={
                        handleCloseAssignment
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="p-10 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-4 font-bold text-slate-900">
                  No courses created
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Use the course form to
                  create the first learning
                  area.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function CourseForm({
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
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
          <Plus className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Create Course
          </h2>

          <p className="text-sm text-slate-500">
            Add a new subject or
            learning area.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="Course Code"
          name="code"
          value={form.code}
          onChange={onChange}
          placeholder="DF101"
          required
        />

        <Field
          label="Course Title"
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="Digital Foundations"
          required
        />
      </div>

      <div className="mt-4">
        <Field
          label="Learning Area"
          name="learningArea"
          value={
            form.learningArea
          }
          onChange={onChange}
          placeholder="Digital Literacy"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-700">
          Description
        </label>

        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows={4}
          placeholder="Describe the course purpose and competencies."
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Competency Bucket"
          name="competencyBucket"
          value={
            form.competencyBucket
          }
          onChange={onChange}
        >
          <option value="formation_and_guided_learning">
            Formation & Guided Learning
          </option>

          <option value="foundational_competencies">
            Foundational Competencies
          </option>

          <option value="applied_experiences">
            Applied Experiences
          </option>
        </SelectField>

        <SelectField
          label="Course Status"
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

          <option value="inactive">
            Inactive
          </option>

          <option value="archived">
            Archived
          </option>
        </SelectField>
      </div>

      {error ? (
        <ErrorMessage
          message={error.message}
        />
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Creating Course..."
          : "Create Course"}
      </button>
    </form>
  );
}

function AssignmentForm({
  form,
  courses,
  instructors,
  onChange,
  onSubmit,
  submitting,
  error,
}) {
  const availableCourses =
    courses.filter(
      (course) =>
        course.status !==
        "archived",
    );

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-100 p-3 text-purple-700">
          <UserRoundCheck className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Assign Instructor
          </h2>

          <p className="text-sm text-slate-500">
            Connect an instructor to a
            course.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SelectField
          label="Course"
          name="courseId"
          value={form.courseId}
          onChange={onChange}
          required
        >
          <option value="">
            Select a course
          </option>

          {availableCourses.map(
            (course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.code} —{" "}
                {course.title}
              </option>
            ),
          )}
        </SelectField>

        <SelectField
          label="Instructor"
          name="staffProfileId"
          value={
            form.staffProfileId
          }
          onChange={onChange}
          required
        >
          <option value="">
            Select an instructor
          </option>

          {instructors.map(
            (instructor) => (
              <option
                key={
                  instructor
                    .staff_profile_id
                }
                value={
                  instructor
                    .staff_profile_id
                }
              >
                {instructor.full_name ||
                  instructor.email}
                {" — "}
                {instructor.specialization ||
                  "General"}
              </option>
            ),
          )}
        </SelectField>

        <SelectField
          label="Assignment Role"
          name="assignmentRole"
          value={
            form.assignmentRole
          }
          onChange={onChange}
          required
        >
          <option value="lead_instructor">
            Lead Instructor
          </option>

          <option value="instructor">
            Instructor
          </option>

          <option value="assistant_instructor">
            Assistant Instructor
          </option>
        </SelectField>
      </div>

      {error ? (
        <ErrorMessage
          message={error.message}
        />
      ) : null}

      <button
        type="submit"
        disabled={
          submitting ||
          availableCourses.length ===
            0 ||
          instructors.length === 0
        }
        className="mt-6 w-full rounded-lg bg-purple-700 px-4 py-3 font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Assigning Instructor..."
          : "Assign Instructor"}
      </button>
    </form>
  );
}

function CourseCard({
  course,
  closing,
  onClose,
}) {
  const activeInstructors =
    Array.isArray(
      course.instructors,
    )
      ? course.instructors.filter(
          (instructor) =>
            instructor
              .assignment_status ===
            "active",
        )
      : [];

  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
            {course.code}
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-950">
            {course.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {course.learning_area ||
              "Learning area not specified"}
          </p>
        </div>

        <StatusBadge
          status={course.status}
        />
      </div>

      {course.description ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {course.description}
        </p>
      ) : null}

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Assigned Instructors
        </p>

        {activeInstructors.length >
        0 ? (
          <div className="mt-3 space-y-3">
            {activeInstructors.map(
              (instructor) => (
                <div
                  key={
                    instructor
                      .assignment_id
                  }
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {instructor.full_name ||
                        instructor.email}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatLabel(
                        instructor
                          .assignment_role,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={closing}
                    onClick={() =>
                      onClose(
                        instructor
                          .assignment_id,
                      )
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No active instructor
            assigned.
          </p>
        )}
      </div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}) {
  const tones = {
    blue:
      "bg-blue-100 text-blue-700",
    green:
      "bg-emerald-100 text-emerald-700",
    purple:
      "bg-purple-100 text-purple-700",
    amber:
      "bg-amber-100 text-amber-700",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${tones[tone]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

function Field({
  label,
  ...inputProps
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        {...inputProps}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({
  label,
  children,
  ...selectProps
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <select
        {...selectProps}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

function ErrorMessage({
  message,
}) {
  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const styles = {
    active:
      "bg-emerald-100 text-emerald-700",
    planned:
      "bg-blue-100 text-blue-700",
    inactive:
      "bg-slate-200 text-slate-700",
    archived:
      "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        styles[status] ||
        styles.inactive
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div
        className={`max-w-xl rounded-xl border px-6 py-5 text-center ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

function formatLabel(value) {
  if (!value) {
    return "Not specified";
  }

  return String(value)
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}