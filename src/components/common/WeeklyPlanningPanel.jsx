import { useState } from "react";

import { useCourseTeachingTeam } from "../../hooks/useCourseTeachingTeam";
import { useWeeklyPlanning } from "../../hooks/useWeeklyPlanning";

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900";

const buttonClass =
  "rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50";

export default function WeeklyPlanningPanel({ cohorts = [] }) {
  const [cohortId, setCohortId] = useState("");

  return (
    <section className="space-y-6">
      <Card
        title="Weekly Planning"
        description="Students keep one programme group. Teaching staff can change by week or individual lesson. Each teaching week ends on Saturday."
      >
        <label className="block max-w-xl text-sm font-semibold">
          Programme cohort
          <select
            value={cohortId}
            onChange={(event) => setCohortId(event.target.value)}
            className={inputClass}
          >
            <option value="">Select a cohort</option>
            {cohorts.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.name}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {cohortId && (
        <CohortPlanning key={cohortId} cohortId={cohortId} />
      )}
    </section>
  );
}

function CohortPlanning({ cohortId }) {
  const [weekId, setWeekId] = useState("");

  const planning = useWeeklyPlanning({
    cohortId,
    teachingWeekId: weekId,
  });

  if (!planning.enabled) {
    return (
      <Message error>
        You do not have access to weekly planning.
      </Message>
    );
  }

  return (
    <div className="space-y-6">
      {planning.error && (
        <Message error>{planning.error.message}</Message>
      )}

      {planning.loading && (
        <Message>Loading planning data...</Message>
      )}

      <Card
        title="1. Permanent Student Groups"
        description="Assign each student once to Class A or B for the whole programme. The same group applies across all courses."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th scope="col" className="p-3">
                  Student
                </th>
                <th scope="col" className="p-3">
                  Programme group
                </th>
              </tr>
            </thead>

            <tbody>
              {planning.students.map((student) => (
                <tr
                  key={student.student_profile_id}
                  className="border-b border-slate-100"
                >
                  <td className="p-3">
                    <p className="font-semibold">
                      {student.full_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.student_number}
                    </p>
                  </td>

                  <td className="p-3">
                    {student.programme_group ? (
                      <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-800">
                        Class {student.programme_group}
                      </span>
                    ) : (
                      <ActionForm
                        pending={planning.assignGroup.isPending}
                        onSubmit={(data) =>
                          planning.assignGroup.mutateAsync({
                            studentProfileId:
                              student.student_profile_id,
                            programmeGroup:
                              data.get("programmeGroup"),
                          })
                        }
                        success="Permanent programme group assigned."
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            name="programmeGroup"
                            defaultValue=""
                            required
                            aria-label={`Programme group for ${student.full_name}`}
                            className="rounded-lg border border-slate-300 p-2"
                          >
                            <option value="">Choose group</option>
                            <option value="A">Class A</option>
                            <option value="B">Class B</option>
                          </select>

                          <button className={buttonClass}>
                            Assign Permanently
                          </button>
                        </div>
                      </ActionForm>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!planning.optionsQuery.isLoading &&
          !planning.optionsQuery.error &&
          planning.students.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">
              No active enrolled students were found in this cohort.
            </p>
          )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="2. Create a Teaching Week"
          description="Choose Monday as the start date. Saturday is calculated automatically. Lessons do not repeat into another week."
        >
          <ActionForm
            pending={planning.createWeek.isPending}
            onSubmit={async (data) => {
              const result = await planning.createWeek.mutateAsync({
                cohortId,
                weekStart: data.get("weekStart"),
                notes: data.get("notes"),
              });

              if (result?.week?.id) {
                setWeekId(result.week.id);
              }
            }}
            success="Teaching week is ready."
          >
            <Field
              label="Monday starting the week"
              name="weekStart"
              type="date"
              required
            />
            <Field label="Week notes" name="notes" />

            <button className={`${buttonClass} mt-4`}>
              Create / Open Week
            </button>
          </ActionForm>
        </Card>

        <Card
          title="3. Select a Teaching Week"
          description="Open an existing week to enter lessons, allocate staff or review the timetable."
        >
          <label className="block text-sm font-semibold">
            Teaching week
            <select
              value={weekId}
              onChange={(event) => setWeekId(event.target.value)}
              className={inputClass}
            >
              <option value="">Select a week</option>
              {planning.weeks.map((week) => (
                <option key={week.id} value={week.id}>
                  {week.week_start} to {week.week_end} — {week.status}
                </option>
              ))}
            </select>
          </label>
        </Card>
      </div>

      {planning.selectedWeek && (
        <WeekEditor
          key={planning.selectedWeek.id}
          planning={planning}
        />
      )}
    </div>
  );
}

function WeekEditor({ planning }) {
  const week = planning.selectedWeek;

  const availableClasses = planning.classes.filter(
    (item) =>
      !planning.plans.some((plan) => plan.class_id === item.id),
  );

  return (
    <div className="space-y-6">
      <Card
        title={`Timetable: ${week.week_start} to ${week.week_end}`}
        description={`Status: ${week.status}. Weekly staff allocations apply to every lesson unless a session override is saved.`}
      >
        {!planning.isDraft && (
          <Message>This week is read-only.</Message>
        )}

        {planning.isDraft && (
          <ActionForm
            pending={planning.saveClassPlan.isPending}
            disabled={
              planning.optionsQuery.isLoading ||
              Boolean(planning.optionsQuery.error) ||
              availableClasses.length === 0
            }
            onSubmit={(data) =>
              planning.saveClassPlan.mutateAsync({
                teachingWeekId: week.id,
                classId: data.get("classId"),
              })
            }
            success="Course class added to this week."
          >
            <label className="block text-sm font-semibold">
              Add a course class
              <select
                name="classId"
                defaultValue=""
                required
                className={inputClass}
              >
                <option value="">Select course and class</option>
                {availableClasses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.course_title} — {item.name}
                  </option>
                ))}
              </select>
            </label>

            <button className={`${buttonClass} mt-4`}>
              Add to Week
            </button>
          </ActionForm>
        )}

        {planning.isDraft &&
          !planning.optionsQuery.isLoading &&
          !planning.optionsQuery.error &&
          availableClasses.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">
              No additional course classes are available for this week.
            </p>
          )}
      </Card>

      {planning.plans.map((plan) => (
        <ClassPlan
          key={plan.id}
          plan={plan}
          planning={planning}
        />
      ))}

      <Card
        title="Review Timetable"
        description="Check lesson entries, required teaching teams and overlapping lessons for programme groups and staff."
      >
        <ActionForm
          pending={planning.reviewWeek.isPending}
          onSubmit={() =>
            planning.reviewWeek.mutateAsync({
              teachingWeekId: week.id,
            })
          }
        >
          <button className={buttonClass}>
            Check Timetable
          </button>
        </ActionForm>

        {planning.reviewResult && (
          <div className="mt-5 space-y-3">
            <Message error={!planning.reviewResult.review_passed}>
              {planning.reviewResult.error_count} errors ·{" "}
              {planning.reviewResult.warning_count} warnings
            </Message>

            {(planning.reviewResult.issues || []).map(
              (issue, index) => (
                <div
                  key={`${issue.code}-${index}`}
                  className={`rounded-lg border p-4 text-sm ${
                    issue.severity === "error"
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <p className="font-semibold">
                    {issue.message}
                  </p>
                  <p className="mt-1 text-slate-600">
                    {[
                      issue.details?.course,
                      issue.details?.class,
                      issue.details?.title,
                      issue.details?.date,
                      issue.details?.first_lesson,
                      issue.details?.second_lesson,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ),
            )}

            {planning.reviewResult.review_passed && (
              <p className="text-sm text-emerald-700">
                No blocking conflicts were found by this review.
              </p>
            )}
          </div>
        )}

        <p className="mt-5 text-sm text-slate-500">
          Publishing will be available after the publication
          workflow is connected and tested.
        </p>
      </Card>
    </div>
  );
}

function ClassPlan({ plan, planning }) {
  const [editingLesson, setEditingLesson] = useState(null);

  const teamQuery = useCourseTeachingTeam(plan.class_id);

  const courseRoles = teamQuery.data?.roles || [];
  const courseStaff = teamQuery.data?.staff || [];

  const teamUnavailable =
    teamQuery.isLoading || Boolean(teamQuery.error);

  return (
    <Card
      title={`${plan.course_title} — ${plan.class_name}`}
      description="Choose from staff appointed to this course. The weekly team applies to all lessons unless a session override is saved."
    >
      {teamQuery.isLoading && (
        <Message>
          Loading staff appointed to this course...
        </Message>
      )}

      {teamQuery.error && (
        <Message error>{teamQuery.error.message}</Message>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {courseRoles.length > 0 &&
            `Teaching team: ${courseRoles.map(roleLabel).join(" + ")}`}
        </p>

        <ActionForm
          pending={teamQuery.isFetching}
          onSubmit={async () => {
            const result = await teamQuery.refetch();
            if (result.error) throw result.error;
          }}
          success="Course staff list refreshed."
        >
          <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">
            Refresh Course Staff
          </button>
        </ActionForm>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {courseRoles.map((role) => (
          <StaffAllocation
            key={`weekly-${role}-${staffKey(plan.staff_allocations, role)}`}
            role={role}
            staff={courseStaff}
            selected={staffIds(plan.staff_allocations, role)}
            savedAllocations={plan.staff_allocations}
            disabled={!planning.isDraft || teamUnavailable}
            pending={planning.saveClassStaff.isPending}
            onSave={(ids) =>
              planning.saveClassStaff.mutateAsync({
                weeklyClassPlanId: plan.id,
                assignmentRole: role,
                staffProfileIds: ids,
              })
            }
          />
        ))}
      </div>

      {planning.isDraft && (
        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <h4 className="font-bold">
            {editingLesson ? "Edit Lesson" : "Add Lesson"}
          </h4>

          <ActionForm
            key={editingLesson?.id || "new-lesson"}
            pending={planning.saveLesson.isPending}
            onSubmit={async (data, form) => {
              await planning.saveLesson.mutateAsync({
                weeklyClassPlanId: plan.id,
                lessonId: editingLesson?.id || null,
                title: data.get("title"),
                lessonDate: data.get("lessonDate"),
                startTime: data.get("startTime"),
                endTime: data.get("endTime"),
                topic: data.get("topic"),
                deliveryMode: data.get("deliveryMode"),
                location: data.get("location"),
                learningObjectives:
                  data.get("learningObjectives"),
                notes: data.get("notes"),
              });

              form.reset();
              setEditingLesson(null);
            }}
            success="Lesson saved."
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Lesson title"
                name="title"
                value={editingLesson?.title}
                required
              />
              <Field
                label="Topic"
                name="topic"
                value={editingLesson?.topic}
              />
              <Field
                label="Lesson date"
                name="lessonDate"
                type="date"
                value={editingLesson?.lesson_date}
                min={planning.selectedWeek.week_start}
                max={planning.selectedWeek.week_end}
                required
              />

              <label className="block text-sm font-semibold">
                Delivery mode
                <select
                  name="deliveryMode"
                  defaultValue={
                    editingLesson?.delivery_mode || "in_person"
                  }
                  className={inputClass}
                >
                  <option value="in_person">In person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label>

              <Field
                label="Start time"
                name="startTime"
                type="time"
                value={time(editingLesson?.start_time)}
                required
              />
              <Field
                label="End time"
                name="endTime"
                type="time"
                value={time(editingLesson?.end_time)}
                required
              />
              <Field
                label="Location"
                name="location"
                value={editingLesson?.location}
              />
              <Field
                label="Learning objectives"
                name="learningObjectives"
                value={editingLesson?.learning_objectives}
              />
              <Field
                label="Notes"
                name="notes"
                value={editingLesson?.notes}
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button className={buttonClass}>
                Save Lesson
              </button>

              {editingLesson && (
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </ActionForm>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {(plan.lessons || []).map((lesson) => (
          <article
            key={lesson.id}
            className="rounded-xl border border-slate-200 p-4"
          >
            <h4 className="font-bold">{lesson.title}</h4>
            <p className="mt-1 text-sm text-slate-600">
              {lesson.lesson_date} · {time(lesson.start_time)}–
              {time(lesson.end_time)}
              {lesson.location ? ` · ${lesson.location}` : ""}
            </p>

            {lesson.topic && (
              <p className="mt-2 text-sm">{lesson.topic}</p>
            )}

            {planning.isDraft && (
              <div className="mt-3 flex flex-wrap items-start gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLesson(lesson)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  Edit Lesson
                </button>

                <ActionForm
                  pending={planning.removeLesson.isPending}
                  onSubmit={async () => {
                    await planning.removeLesson.mutateAsync({
                      lessonId: lesson.id,
                    });

                    if (editingLesson?.id === lesson.id) {
                      setEditingLesson(null);
                    }
                  }}
                >
                  <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
                    Remove Lesson
                  </button>
                </ActionForm>
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-blue-900">
                Staff for This Session
              </summary>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Choose other staff appointed to the same course
                for this lesson only. Use Weekly Team removes
                the override for that role.
              </p>

              {teamQuery.error && (
                <p className="mt-3 text-sm text-red-700">
                  Course staff could not be loaded. Use Refresh
                  Course Staff above to try again.
                </p>
              )}

              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {courseRoles.map((role) => (
                  <StaffAllocation
                    key={`session-${role}-${staffKey(
                      lesson.effective_staff,
                      role,
                    )}-${(lesson.override_roles || []).includes(role)}`}
                    role={role}
                    staff={courseStaff}
                    selected={staffIds(
                      lesson.effective_staff,
                      role,
                    )}
                    savedAllocations={lesson.effective_staff}
                    disabled={
                      !planning.isDraft || teamUnavailable
                    }
                    pending={
                      planning.saveLessonStaff.isPending
                    }
                    override={(
                      lesson.override_roles || []
                    ).includes(role)}
                    onSave={(ids) =>
                      planning.saveLessonStaff.mutateAsync({
                        lessonId: lesson.id,
                        assignmentRole: role,
                        staffProfileIds: ids,
                      })
                    }
                    onRestore={() =>
                      planning.saveLessonStaff.mutateAsync({
                        lessonId: lesson.id,
                        assignmentRole: role,
                        useWeeklyDefault: true,
                      })
                    }
                  />
                ))}
              </div>
            </details>
          </article>
        ))}

        {!plan.lessons?.length && (
          <p className="text-sm text-slate-500">
            No lessons entered for this class yet.
          </p>
        )}
      </div>
    </Card>
  );
}

function StaffAllocation({
  role,
  staff = [],
  selected = [],
  savedAllocations = [],
  disabled,
  pending,
  override,
  onSave,
  onRestore,
}) {
  const eligible = staff.filter((person) =>
    person.roles?.includes(role),
  );

  const eligibleIds = new Set(
    eligible.map((person) => person.staff_profile_id),
  );

  const unavailableIds = selected.filter(
    (id) => !eligibleIds.has(id),
  );

  function savedName(id) {
    return (
      savedAllocations.find(
        (item) =>
          item.staff_profile_id === id &&
          item.assignment_role === role,
      )?.full_name || "Previously selected staff member"
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <ActionForm
        pending={pending}
        disabled={disabled}
        onSubmit={(data) => {
          const ids = data.getAll("staffIds");

          if (ids.some((id) => !eligibleIds.has(id))) {
            throw new Error(
              "Deselect staff who are no longer available or appointed to this course.",
            );
          }

          return onSave(ids);
        }}
        success="Staff allocation saved."
      >
        <label className="block text-sm font-semibold">
          {roleLabel(role)}

          {onRestore && (
            <span className="ml-2 text-xs font-normal text-slate-500">
              {override ? "Session override" : "Weekly team"}
            </span>
          )}

          <select
            name="staffIds"
            multiple
            size={4}
            defaultValue={selected}
            className={inputClass}
          >
            {eligible.map((person) => (
              <option
                key={person.staff_profile_id}
                value={person.staff_profile_id}
              >
                {person.full_name || "Unnamed staff member"}
              </option>
            ))}

            {unavailableIds.map((id) => (
              <option key={id} value={id}>
                {savedName(id)} — no longer eligible
              </option>
            ))}
          </select>
        </label>

        {eligible.length === 0 && (
          <p className="mt-2 text-sm leading-6 text-amber-700">
            No available {role} is appointed to this course.
            Assign the staff member to this course in Staff
            Management, then click Refresh Course Staff.
          </p>
        )}

        {unavailableIds.length > 0 && (
          <p className="mt-2 text-sm text-amber-700">
            A saved selection is no longer eligible. Deselect it
            before saving a replacement team.
          </p>
        )}

        {!disabled && (
          <>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Hold Ctrl on Windows to select multiple people
              or deselect a person.
            </p>

            <button className={`${buttonClass} mt-3`}>
              {onRestore
                ? "Save Session Override"
                : "Save Weekly Team"}
            </button>
          </>
        )}
      </ActionForm>

      {!disabled && onRestore && (
        <ActionForm
          pending={pending}
          onSubmit={() => onRestore()}
          success="Weekly team restored."
        >
          <button className="mt-3 text-sm font-semibold text-blue-800 underline">
            Use Weekly Team
          </button>
        </ActionForm>
      )}
    </div>
  );
}

function ActionForm({
  children,
  onSubmit,
  pending = false,
  disabled = false,
  success = "",
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();

    if (busy || pending || disabled) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await onSubmit(data, form);
      setMessage(success);
    } catch (caught) {
      setError(
        caught?.message ||
          "The action could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <fieldset
        disabled={disabled || pending || busy}
        className="min-w-0 space-y-2 disabled:opacity-60"
      >
        {children}
      </fieldset>

      {busy && (
        <p role="status" className="mt-2 text-xs text-slate-500">
          Working...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="mt-2 text-sm text-emerald-700"
        >
          {message}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  ...props
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value ?? ""}
        className={inputClass}
        {...props}
      />
    </label>
  );
}

function Card({ title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-bold text-slate-950">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      )}

      <div className="mt-5">{children}</div>
    </section>
  );
}

function Message({ children, error = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-lg border p-4 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-blue-200 bg-blue-50 text-blue-800"
      }`}
    >
      {children}
    </div>
  );
}

function staffIds(allocations = [], role) {
  return allocations
    .filter((item) => item.assignment_role === role)
    .map((item) => item.staff_profile_id);
}

function staffKey(allocations, role) {
  return staffIds(allocations, role).sort().join(",");
}

function roleLabel(role) {
  return role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "";
}

function time(value) {
  return value ? String(value).slice(0, 5) : "";
}