import { useState } from "react";

import {
  BookOpen,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import WeeklyPlanningPanel from "../../components/common/WeeklyPlanningPanel";
import { useClassManagement } from "../../hooks/useClassManagement";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";

const initialClassForm = {
  courseId: "",
  cohortId: "",
  name: "Class A",
  description: "",
  deliveryMode: "in_person",
  location: "",
  startDate: "",
  endDate: "",
  enrollCohortStudents: true,
};

const initialClassroomForm = {
  classId: "",
  googleClassroomUrl: "",
  googleClassroomCode: "",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

const buttonClass =
  "rounded-lg bg-blue-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50";

export default function ClassesSchedulesPage() {
  const management = useClassManagement();

  const [tab, setTab] = useState("planning");
  const [classForm, setClassForm] = useState(initialClassForm);
  const [classroomForm, setClassroomForm] = useState(
    initialClassroomForm,
  );
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const data = management.classManagement;
  const courses = data?.courses || [];
  const cohorts = data?.cohorts || [];
  const classes = data?.classes || [];
  const summary = data?.summary || {};

  async function runAction(action, fallback) {
    setMessage("");
    setActionError("");

    try {
      const result = await action();
      setMessage(result?.message || fallback);
      return true;
    } catch (error) {
      setActionError(error.message || "The action could not be completed.");
      return false;
    }
  }

  function changeClass(event) {
    const { name, value } = event.target;

    setClassForm((current) => {
      const next = { ...current, [name]: value };

      if (name === "cohortId") {
        const cohort = cohorts.find((item) => item.id === value);
        next.startDate = cohort?.start_date || "";
        next.endDate = cohort?.expected_completion_date || "";
      }

      return next;
    });

    setMessage("");
    setActionError("");
  }

  function changeClassroom(event) {
    const { name, value } = event.target;

    if (name === "classId") {
      const selected = classes.find((item) => item.id === value);

      setClassroomForm({
        classId: value,
        googleClassroomUrl: selected?.google_classroom_url || "",
        googleClassroomCode: selected?.google_classroom_code || "",
      });
    } else {
      setClassroomForm((current) => ({
        ...current,
        [name]: value,
      }));
    }

    setMessage("");
    setActionError("");
  }

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Programme Delivery
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Classes &amp; Schedules
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Keep students in programme Class A or B. Enter each
                week’s lessons through Saturday and allocate instructors,
                facilitators and coaches by week or individual session.
              </p>
            </div>

            <button
              type="button"
              disabled={management.classManagementFetching}
              onClick={() =>
                runAction(async () => {
                  const result =
                    await management.refreshClassManagement();

                  if (result.error) throw result.error;
                  return { message: "Class directory refreshed." };
                })
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  management.classManagementFetching
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh Directory
            </button>
          </header>

          {message && <Message>{message}</Message>}
          {actionError && <Message error>{actionError}</Message>}

          {management.classManagementLoading ? (
            <Message>Loading classes and cohorts...</Message>
          ) : management.classManagementError || !data ? (
            <Message error>
              {management.classManagementError?.message ||
                "Class management data could not be loaded."}
            </Message>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-3">
                <Stat label="Course Classes" value={summary.totalClasses} />
                <Stat label="Active Classes" value={summary.activeClasses} />
                <Stat
                  label="Scheduled Sessions"
                  value={summary.scheduledSessions}
                />
              </section>

              <nav
                aria-label="Class management sections"
                className="flex flex-wrap gap-2"
              >
                {[
                  ["planning", "Weekly Planning"],
                  ["classes", "Create Classes"],
                  ["classroom", "Google Classroom"],
                  ["directory", "Class Directory"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={tab === id}
                    onClick={() => {
                      setTab(id);
                      setMessage("");
                      setActionError("");
                    }}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                      tab === id
                        ? "bg-blue-950 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              {/* Keep planning mounted so switching sections preserves drafts. */}
              <div hidden={tab !== "planning"}>
                <WeeklyPlanningPanel cohorts={cohorts} />
              </div>

              <div hidden={tab !== "classes"}>
                <Panel
                  title="Create a Course Class"
                  description="Create Class A and Class B for each course in the cohort. Students join the class matching their permanent programme group."
                >
                  <form
                    onSubmit={async (event) => {
                      event.preventDefault();

                      const saved = await runAction(
                        () => management.createClass(classForm),
                        "The course class was created.",
                      );

                      if (saved) setClassForm(initialClassForm);
                    }}
                  >
                    <fieldset
                      disabled={management.creatingClass}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      <Select
                        label="Course"
                        name="courseId"
                        value={classForm.courseId}
                        onChange={changeClass}
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.code} — {course.title}
                          </option>
                        ))}
                      </Select>

                      <Select
                        label="Programme cohort"
                        name="cohortId"
                        value={classForm.cohortId}
                        onChange={changeClass}
                        required
                      >
                        <option value="">Select a cohort</option>
                        {cohorts.map((cohort) => (
                          <option key={cohort.id} value={cohort.id}>
                            {cohort.name}
                          </option>
                        ))}
                      </Select>

                      <Select
                        label="Programme class"
                        name="name"
                        value={classForm.name}
                        onChange={changeClass}
                        required
                      >
                        <option value="Class A">Class A</option>
                        <option value="Class B">Class B</option>
                      </Select>

                      {/* <Field
                        label="Unique class code"
                        name="code"
                        value={classForm.code}
                        onChange={changeClass}
                        placeholder="For example: PC01-DF-A"
                        required
                      /> */}

                      <Field
                        label="Class start date"
                        name="startDate"
                        type="date"
                        value={classForm.startDate}
                        onChange={changeClass}
                        required
                      />

                      <Field
                        label="Class end date"
                        name="endDate"
                        type="date"
                        value={classForm.endDate}
                        onChange={changeClass}
                        min={classForm.startDate || undefined}
                        required
                      />

                      <Select
                        label="Delivery mode"
                        name="deliveryMode"
                        value={classForm.deliveryMode}
                        onChange={changeClass}
                      >
                        <option value="in_person">In person</option>
                        <option value="online">Online</option>
                        <option value="hybrid">Hybrid</option>
                      </Select>

                      <Field
                        label="Default location"
                        name="location"
                        value={classForm.location}
                        onChange={changeClass}
                      />

                      <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                        Description
                        <textarea
                          name="description"
                          value={classForm.description}
                          onChange={changeClass}
                          rows={3}
                          className={inputClass}
                        />
                      </label>

                      <p className="text-sm leading-6 text-slate-500 sm:col-span-2">
                        Active students with a matching permanent programme
                        group are enrolled automatically. Students without a
                        group must first be assigned in Weekly Planning.
                      </p>

                      <button className={`${buttonClass} sm:col-span-2`}>
                        {management.creatingClass
                          ? "Creating Class..."
                          : "Create Course Class"}
                      </button>
                    </fieldset>
                  </form>
                </Panel>
              </div>

              <div hidden={tab !== "classroom"}>
                <Panel
                  title="Google Classroom Access"
                  description="Save the joining link and code for the selected course class."
                >
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void runAction(
                        () => management.updateClassroom(classroomForm),
                        "Google Classroom access was updated.",
                      );
                    }}
                  >
                    <fieldset
                      disabled={management.updatingClassroom}
                      className="space-y-4"
                    >
                      <Select
                        label="Course class"
                        name="classId"
                        value={classroomForm.classId}
                        onChange={changeClassroom}
                        required
                      >
                        <option value="">Select a course class</option>
                        {classes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.course?.title} — {item.name} —{" "}
                            {item.cohort?.name}
                          </option>
                        ))}
                      </Select>

                      <Field
                        label="Google Classroom URL"
                        name="googleClassroomUrl"
                        type="url"
                        value={classroomForm.googleClassroomUrl}
                        onChange={changeClassroom}
                        placeholder="https://classroom.google.com/..."
                      />

                      <Field
                        label="Joining code"
                        name="googleClassroomCode"
                        value={classroomForm.googleClassroomCode}
                        onChange={changeClassroom}
                      />

                      <button className={buttonClass}>
                        {management.updatingClassroom
                          ? "Saving..."
                          : "Save Classroom Access"}
                      </button>
                    </fieldset>
                  </form>
                </Panel>
              </div>

              <section hidden={tab !== "directory"}>
                <h2 className="text-2xl font-bold text-slate-950">
                  Class Directory
                </h2>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  {classes.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-blue-700">
                            {item.course?.code}
                          </p>
                          <h3 className="mt-1 text-lg font-bold">
                            {item.course?.title} — {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.cohort?.name}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-4 text-sm text-slate-600">
                        {item.active_student_count || 0} active students ·{" "}
                        {item.sessions?.length || 0} dated sessions
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {item.start_date} to {item.end_date}
                      </p>

                      {item.google_classroom_code && (
                        <p className="mt-4 text-sm">
                          Classroom code:{" "}
                          <strong>{item.google_classroom_code}</strong>
                        </p>
                      )}

                      {safeClassroomUrl(item.google_classroom_url) && (
                        <a
                          href={safeClassroomUrl(item.google_classroom_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
                        >
                          Open Google Classroom
                          <ExternalLink size={15} />
                        </a>
                      )}

                      <button
                        type="button"
                        disabled={
                          management.syncingEnrollments ||
                          !["planned", "active"].includes(item.status)
                        }
                        onClick={() =>
                          runAction(
                            () =>
                              management.syncEnrollments({
                                classId: item.id,
                              }),
                            "Matching programme-group students synchronized.",
                          )
                        }
                        className="mt-5 block rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50"
                      >
                        {management.syncingEnrollments
                          ? "Synchronizing..."
                          : "Synchronize Matching Students"}
                      </button>
                    </article>
                  ))}

                  {classes.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center lg:col-span-2">
                      <BookOpen className="mx-auto text-slate-400" />
                      <p className="mt-3 font-semibold">
                        No course classes created yet.
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Open Create Classes to add Class A and B for a course.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input {...props} className={inputClass} />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <select {...props} className={inputClass}>
        {children}
      </select>
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">
        {value ?? 0}
      </p>
    </article>
  );
}

function Message({ children, error = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-xl border p-4 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {children}
    </div>
  );
}

function safeClassroomUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}