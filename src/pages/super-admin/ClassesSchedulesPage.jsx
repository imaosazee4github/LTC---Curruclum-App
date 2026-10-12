import {
  BookOpen,
  CalendarDays,
  Clock3,
  ExternalLink,
  GraduationCap,
  Link2,
  RefreshCw,
  Users,
} from "lucide-react";

import { useState } from "react";

import { useClassManagement } from "../../hooks/useClassManagement";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";

const initialClassForm = {
  courseId: "",
  cohortId: "",
  code: "",
  name: "",
  description: "",
  deliveryMode: "in_person",
  location: "",
  startDate: "",
  endDate: "",
  enrollCohortStudents: true,
};

const initialScheduleForm = {
  classId: "",
  dayOfWeek: "monday",
  startTime: "",
  endTime: "",
  location: "",
  notes: "",
};

const initialSessionForm = {
  classId: "",
  title: "",
  sessionDate: "",
  startTime: "",
  endTime: "",
  sessionNumber: "",
  topic: "",
  learningObjectives: "",
  deliveryMode: "in_person",
  location: "",
  notes: "",
};

const initialClassroomForm = {
  classId: "",
  googleClassroomUrl: "",
  googleClassroomCode: "",
};

export default function ClassesSchedulesPage() {
  const {
    classManagement,
    classManagementLoading,
    classManagementError,
    createClass,
    creatingClass,
    createClassError,
    resetCreateClass,
    createSchedule,
    creatingSchedule,
    createScheduleError,
    resetCreateSchedule,
    createSession,
    creatingSession,
    createSessionError,
    resetCreateSession,
    syncEnrollments,
    syncingEnrollments,
    updateClassroom,
    updatingClassroom,
    updateClassroomError,
    resetUpdateClassroom,
  } = useClassManagement();

  const [classForm, setClassForm] =
    useState(initialClassForm);
  const [scheduleForm, setScheduleForm] =
    useState(initialScheduleForm);
  const [sessionForm, setSessionForm] =
    useState(initialSessionForm);
  const [classroomForm, setClassroomForm] =
    useState(initialClassroomForm);
  const [successMessage, setSuccessMessage] =
    useState("");

  function changeForm(setter, resetMutation) {
    return (event) => {
      const { name, value, type, checked } =
        event.target;

      setter((current) => ({
        ...current,
        [name]:
          type === "checkbox" ? checked : value,
      }));

      setSuccessMessage("");
      resetMutation();
    };
  }

  async function submitMutation({
    event,
    mutation,
    payload,
    resetForm,
    fallbackMessage,
  }) {
    event.preventDefault();
    setSuccessMessage("");

    try {
      const result = await mutation(payload);
      resetForm();
      setSuccessMessage(
        result?.message || fallbackMessage,
      );
    } catch {
      // React Query exposes the mutation error.
    }
  }

  if (classManagementLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading classes and schedules..." />
      </SuperAdminLayout>
    );
  }

  if (
    classManagementError ||
    !classManagement
  ) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            classManagementError?.message ||
            "Class management data could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  const {
    summary,
    courses,
    cohorts,
    classes,
  } = classManagement;

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Programme Delivery
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
              Classes &amp; Schedules
            </h1>
            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Connect courses to the Pioneer Cohort,
              publish weekly timetables and provide
              Google Classroom access.
            </p>
          </header>

          {successMessage ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Classes" value={summary.totalClasses} icon={BookOpen} tone="blue" />
            <SummaryCard label="Active Classes" value={summary.activeClasses} icon={GraduationCap} tone="green" />
            <SummaryCard label="Weekly Periods" value={summary.weeklySchedules} icon={Clock3} tone="purple" />
            <SummaryCard label="Dated Sessions" value={summary.scheduledSessions} icon={CalendarDays} tone="amber" />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-2">
            <Panel title="Create Cohort Class" description="Deliver an existing course to a programme cohort." icon={BookOpen}>
              <form
                onSubmit={(event) =>
                  submitMutation({
                    event,
                    mutation: createClass,
                    payload: classForm,
                    resetForm: () => setClassForm(initialClassForm),
                    fallbackMessage: "The class was created successfully.",
                  })
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Course" name="courseId" value={classForm.courseId} onChange={changeForm(setClassForm, resetCreateClass)} required>
                    <option value="">Select a course</option>
                    {courses.map((course) => <option key={course.id} value={course.id}>{course.code} — {course.title}</option>)}
                  </Select>
                  <Select label="Cohort" name="cohortId" value={classForm.cohortId} onChange={changeForm(setClassForm, resetCreateClass)} required>
                    <option value="">Select a cohort</option>
                    {cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}
                  </Select>
                  <Field label="Class Code" name="code" value={classForm.code} onChange={changeForm(setClassForm, resetCreateClass)} placeholder="PC01-DF101" required />
                  <Field label="Class Name" name="name" value={classForm.name} onChange={changeForm(setClassForm, resetCreateClass)} placeholder="Digital Foundations" required />
                  <Field label="Start Date" name="startDate" type="date" value={classForm.startDate} onChange={changeForm(setClassForm, resetCreateClass)} required />
                  <Field label="End Date" name="endDate" type="date" value={classForm.endDate} onChange={changeForm(setClassForm, resetCreateClass)} required />
                  <Select label="Delivery Mode" name="deliveryMode" value={classForm.deliveryMode} onChange={changeForm(setClassForm, resetCreateClass)}>
                    <option value="in_person">In Person</option><option value="online">Online</option><option value="hybrid">Hybrid</option>
                  </Select>
                  <Field label="Location" name="location" value={classForm.location} onChange={changeForm(setClassForm, resetCreateClass)} placeholder="Training room" />
                </div>
                <TextArea label="Description" name="description" value={classForm.description} onChange={changeForm(setClassForm, resetCreateClass)} />
                <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" name="enrollCohortStudents" checked={classForm.enrollCohortStudents} onChange={changeForm(setClassForm, resetCreateClass)} className="h-4 w-4" />
                  Enrol all active students in this cohort
                </label>
                <MutationFooter error={createClassError} submitting={creatingClass} idleLabel="Create Class" pendingLabel="Creating Class..." />
              </form>
            </Panel>

            <Panel title="Weekly Timetable" description="Add a recurring course period." icon={Clock3}>
              <form
                onSubmit={(event) =>
                  submitMutation({
                    event,
                    mutation: createSchedule,
                    payload: scheduleForm,
                    resetForm: () => setScheduleForm(initialScheduleForm),
                    fallbackMessage: "The timetable period was created.",
                  })
                }
              >
                <ClassSelect classes={classes} value={scheduleForm.classId} onChange={changeForm(setScheduleForm, resetCreateSchedule)} />
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Select label="Day" name="dayOfWeek" value={scheduleForm.dayOfWeek} onChange={changeForm(setScheduleForm, resetCreateSchedule)}>
                    {DAYS.map((day) => <option key={day} value={day}>{formatLabel(day)}</option>)}
                  </Select>
                  <Field label="Start Time" name="startTime" type="time" value={scheduleForm.startTime} onChange={changeForm(setScheduleForm, resetCreateSchedule)} required />
                  <Field label="End Time" name="endTime" type="time" value={scheduleForm.endTime} onChange={changeForm(setScheduleForm, resetCreateSchedule)} required />
                </div>
                <Field wrapperClass="mt-4" label="Location" name="location" value={scheduleForm.location} onChange={changeForm(setScheduleForm, resetCreateSchedule)} />
                <TextArea label="Notes" name="notes" value={scheduleForm.notes} onChange={changeForm(setScheduleForm, resetCreateSchedule)} />
                <MutationFooter error={createScheduleError} submitting={creatingSchedule} idleLabel="Add Timetable Period" pendingLabel="Adding Period..." />
              </form>
            </Panel>

            <Panel title="Dated Session" description="Schedule a specific lesson or activity." icon={CalendarDays}>
              <form
                onSubmit={(event) =>
                  submitMutation({
                    event,
                    mutation: createSession,
                    payload: sessionForm,
                    resetForm: () => setSessionForm(initialSessionForm),
                    fallbackMessage: "The class session was scheduled.",
                  })
                }
              >
                <ClassSelect classes={classes} value={sessionForm.classId} onChange={changeForm(setSessionForm, resetCreateSession)} />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Session Title" name="title" value={sessionForm.title} onChange={changeForm(setSessionForm, resetCreateSession)} required />
                  <Field label="Session Number" name="sessionNumber" type="number" value={sessionForm.sessionNumber} onChange={changeForm(setSessionForm, resetCreateSession)} />
                  <Field label="Session Date" name="sessionDate" type="date" value={sessionForm.sessionDate} onChange={changeForm(setSessionForm, resetCreateSession)} required />
                  <Select label="Delivery Mode" name="deliveryMode" value={sessionForm.deliveryMode} onChange={changeForm(setSessionForm, resetCreateSession)}>
                    <option value="in_person">In Person</option><option value="online">Online</option><option value="hybrid">Hybrid</option>
                  </Select>
                  <Field label="Start Time" name="startTime" type="time" value={sessionForm.startTime} onChange={changeForm(setSessionForm, resetCreateSession)} required />
                  <Field label="End Time" name="endTime" type="time" value={sessionForm.endTime} onChange={changeForm(setSessionForm, resetCreateSession)} required />
                  <Field label="Topic" name="topic" value={sessionForm.topic} onChange={changeForm(setSessionForm, resetCreateSession)} />
                  <Field label="Location" name="location" value={sessionForm.location} onChange={changeForm(setSessionForm, resetCreateSession)} />
                </div>
                <TextArea label="Learning Objectives" name="learningObjectives" value={sessionForm.learningObjectives} onChange={changeForm(setSessionForm, resetCreateSession)} />
                <TextArea label="Notes" name="notes" value={sessionForm.notes} onChange={changeForm(setSessionForm, resetCreateSession)} />
                <MutationFooter error={createSessionError} submitting={creatingSession} idleLabel="Schedule Session" pendingLabel="Scheduling Session..." />
              </form>
            </Panel>

            <Panel title="Google Classroom" description="Publish the link and joining code." icon={Link2}>
              <form
                onSubmit={(event) =>
                  submitMutation({
                    event,
                    mutation: updateClassroom,
                    payload: classroomForm,
                    resetForm: () => setClassroomForm(initialClassroomForm),
                    fallbackMessage: "Google Classroom access was updated.",
                  })
                }
              >
                <ClassSelect classes={classes} value={classroomForm.classId} onChange={changeForm(setClassroomForm, resetUpdateClassroom)} />
                <Field wrapperClass="mt-4" label="Google Classroom URL" name="googleClassroomUrl" type="url" value={classroomForm.googleClassroomUrl} onChange={changeForm(setClassroomForm, resetUpdateClassroom)} placeholder="https://classroom.google.com/..." />
                <Field wrapperClass="mt-4" label="Class Code" name="googleClassroomCode" value={classroomForm.googleClassroomCode} onChange={changeForm(setClassroomForm, resetUpdateClassroom)} />
                <MutationFooter error={updateClassroomError} submitting={updatingClassroom} idleLabel="Save Classroom Access" pendingLabel="Saving Access..." />
              </form>
            </Panel>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-slate-950">Class Directory</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {classes.length ? classes.map((item) => (
                <ClassCard key={item.id} item={item} syncing={syncingEnrollments} onSync={async () => {
                  setSuccessMessage("");
                  try {
                    const result = await syncEnrollments({ classId: item.id });
                    setSuccessMessage(result?.message || "Class enrolments were synchronized.");
                  } catch {
                    // React Query exposes the mutation error.
                  }
                }} />
              )) : <EmptyState />}
            </div>
          </section>
        </div>
      </main>
    </SuperAdminLayout>
  );
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function Panel({ title, description, icon: Icon, children }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-3 text-blue-700"><Icon className="h-5 w-5" /></div><div><h2 className="text-xl font-bold text-slate-950">{title}</h2><p className="text-sm text-slate-500">{description}</p></div></div><div className="mt-6">{children}</div></article>;
}

function ClassSelect({ classes, value, onChange }) {
  return <Select label="Class" name="classId" value={value} onChange={onChange} required><option value="">Select a class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</Select>;
}

function ClassCard({ item, syncing, onSync }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-blue-700">{item.code}</p><h3 className="mt-1 text-lg font-bold text-slate-950">{item.name}</h3><p className="mt-1 text-sm text-slate-500">{item.course?.title} · {item.cohort?.name}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">{formatLabel(item.status)}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><MiniStat label="Students" value={item.active_student_count} icon={Users} /><MiniStat label="Weekly" value={item.schedules?.length || 0} icon={Clock3} /><MiniStat label="Sessions" value={item.sessions?.length || 0} icon={CalendarDays} /></div>{item.schedules?.length ? <div className="mt-5 border-t border-slate-200 pt-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Weekly Timetable</p><div className="mt-3 space-y-2">{item.schedules.map((schedule) => <p key={schedule.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"><strong>{formatLabel(schedule.day_of_week)}</strong> · {formatTime(schedule.start_time)}–{formatTime(schedule.end_time)} {schedule.location ? `· ${schedule.location}` : ""}</p>)}</div></div> : null}{item.google_classroom_url || item.google_classroom_code ? <div className="mt-5 rounded-lg bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Google Classroom</p>{item.google_classroom_code ? <p className="mt-2 text-sm text-blue-950">Code: <strong>{item.google_classroom_code}</strong></p> : null}{item.google_classroom_url ? <a href={item.google_classroom_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">Open Classroom <ExternalLink className="h-4 w-4" /></a> : null}</div> : null}<button type="button" onClick={onSync} disabled={syncing} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className="h-4 w-4" />{syncing ? "Synchronizing..." : "Synchronize Students"}</button></article>;
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  const tones = { blue: "bg-blue-100 text-blue-700", green: "bg-emerald-100 text-emerald-700", purple: "bg-purple-100 text-purple-700", amber: "bg-amber-100 text-amber-700" };
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-slate-950">{value}</p></div><div className={`rounded-xl p-3 ${tones[tone]}`}><Icon className="h-6 w-6" /></div></div></article>;
}

function MiniStat({ label, value, icon: Icon }) { return <div className="rounded-lg bg-slate-50 p-3"><Icon className="h-4 w-4 text-slate-500" /><p className="mt-2 text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>; }

function Field({ label, name, value, onChange, type = "text", placeholder, required = false, wrapperClass = "" }) { return <label className={`block text-sm font-semibold text-slate-700 ${wrapperClass}`}>{label}<input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label>; }

function Select({ label, name, value, onChange, children, required = false }) { return <label className="block text-sm font-semibold text-slate-700">{label}<select name={name} value={value} onChange={onChange} required={required} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">{children}</select></label>; }

function TextArea({ label, name, value, onChange }) { return <label className="mt-4 block text-sm font-semibold text-slate-700">{label}<textarea name={name} value={value} onChange={onChange} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label>; }

function MutationFooter({ error, submitting, idleLabel, pendingLabel }) { return <>{error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</div> : null}<button type="submit" disabled={submitting} className="mt-5 w-full rounded-lg bg-blue-950 px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60">{submitting ? pendingLabel : idleLabel}</button></>; }

function EmptyState() { return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center lg:col-span-2"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-4 font-bold text-slate-900">No cohort classes created</p><p className="mt-2 text-sm text-slate-500">Create the first class using an existing course.</p></div>; }

function PageMessage({ message, error = false }) { return <main className="p-5 md:p-8"><div className={`mx-auto max-w-3xl rounded-xl border px-5 py-6 ${error ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600"}`}>{message}</div></main>; }

function formatLabel(value) { return String(value || "Not specified").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatTime(value) { return value ? String(value).slice(0, 5) : "—"; }