import {
  BookOpen,
  Plus,
} from "lucide-react";

import { useState } from "react";

import { useCourseManagement } from "../../hooks/useCourseManagement";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";

const initialCourseForm = {
  code: "",
  title: "",
  description: "",
  learningArea: "",
  competencyBucket:
    "foundational_competencies",
  status: "active",
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
  } = useCourseManagement();

  const [courseForm, setCourseForm] =
    useState(initialCourseForm);

  const [successMessage, setSuccessMessage] =
    useState("");

  function handleCourseChange(event) {
    const { name, value } = event.target;

    setCourseForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    resetCreateCourse();
  }

  async function handleCreateCourse(event) {
    event.preventDefault();
    setSuccessMessage("");

    try {
      const result = await createCourse(
        courseForm,
      );

      setCourseForm(initialCourseForm);

      setSuccessMessage(
        result?.message ||
          "The course was created successfully.",
      );
    } catch {
      // The mutation exposes the error.
    }
  }

  if (courseManagementLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading courses..." />
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
            courseManagementError?.message ||
            "Course management data could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  const { summary, courses } =
    courseManagement;

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
              Create and manage the course
              catalogue for the LTC Pioneer
              Programme.
            </p>
          </header>

          {successMessage ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <section className="mt-8 max-w-sm">
            <SummaryCard
              label="Total Courses"
              value={summary.totalCourses}
              icon={BookOpen}
            />
          </section>

          <div className="mt-8 max-w-3xl">
            <CourseForm
              form={courseForm}
              onChange={handleCourseChange}
              onSubmit={handleCreateCourse}
              submitting={creatingCourse}
              error={createCourseError}
            />
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Course Catalogue
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Courses available for classes
                and cohort scheduling.
              </p>
            </div>

            {courses.length > 0 ? (
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                  />
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-4 font-bold text-slate-900">
                  No courses created
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Use the form to create the
                  first course.
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
            Add a subject or learning area to
            the course catalogue.
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
          value={form.learningArea}
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

      <div className="mt-4">
        <SelectField
          label="Competency Bucket"
          name="competencyBucket"
          value={form.competencyBucket}
          onChange={onChange}
        >
          <option value="formation_and_guided_learning">
            Formation &amp; Guided Learning
          </option>

          <option value="foundational_competencies">
            Foundational Competencies
          </option>

          <option value="applied_experiences">
            Applied Experiences
          </option>
        </SelectField>
      </div>

      {error ? (
        <ErrorMessage message={error.message} />
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

function CourseCard({ course }) {
  return (
    <article className="rounded-xl border border-slate-200 p-5">
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

      {course.description ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {course.description}
        </p>
      ) : null}

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Competency Bucket
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-800">
          {formatLabel(
            course.competency_bucket,
          )}
        </p>
      </div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
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

        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </article>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
        className={`mx-auto max-w-3xl rounded-xl border px-5 py-6 ${
          error
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        {message}
      </div>
    </main>
  );
}

function formatLabel(value) {
  if (!value) {
    return "Not specified";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}
