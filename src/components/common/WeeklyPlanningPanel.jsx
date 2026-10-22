import { useEffect, useRef, useState } from "react";

import { useCourseTeachingTeam } from "../../hooks/useCourseTeachingTeam";
import { useWeeklyPlanning } from "../../hooks/useWeeklyPlanning";

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100";

const buttonClass =
  "rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryClass =
  "rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50";

export default function WeeklyPlanningPanel({ cohorts = [] }) {
  const [cohortId, setCohortId] = useState("");

  return (
    <section className="space-y-5">
      <Card title="Class Schedule">
        <p className="mb-4 text-sm text-slate-600">
          Choose a cohort and week, then add lessons and their teaching teams.
        </p>

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
        <CohortSchedule key={cohortId} cohortId={cohortId} />
      )}
    </section>
  );
}

function CohortSchedule({ cohortId }) {
  const [weekId, setWeekId] = useState("");

  const planning = useWeeklyPlanning({
    cohortId,
    teachingWeekId: weekId,
  });

  if (!planning.enabled) {
    return <Message error>You do not have access to weekly planning.</Message>;
  }

  return (
    <div className="space-y-5">
      {planning.error && (
        <Message error>{planning.error.message}</Message>
      )}

      <Card title="Teaching Week">
        <label className="block text-sm font-semibold">
          Select a week
          <select
            value={weekId}
            onChange={(event) => setWeekId(event.target.value)}
            disabled={planning.weeksQuery.isLoading}
            className={inputClass}
          >
            <option value="">Select a teaching week</option>
            {planning.weeks.map((week) => (
              <option key={week.id} value={week.id}>
                {week.week_start} to {week.week_end} — {week.status}
              </option>
            ))}
          </select>
        </label>

        <details className="mt-5 border-t border-slate-200 pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-blue-900">
            Add a new week
          </summary>

          <div className="mt-4">
            <ActionForm
              pending={planning.createWeek.isPending}
              onSubmit={async (data) => {
                const result = await planning.createWeek.mutateAsync({
                  cohortId,
                  weekStart: data.get("weekStart"),
                  notes: data.get("notes"),
                });

                if (!result?.week?.id) {
                  throw new Error(
                    "The week could not be opened. Refresh the week list.",
                  );
                }

                setWeekId(result.week.id);
              }}
              success="Teaching week is ready."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Monday starting the week"
                  name="weekStart"
                  type="date"
                  required
                />
                <Field label="Week notes (optional)" name="notes" />
              </div>

              <p className="mt-3 text-sm text-slate-500">
                The teaching week runs from Monday through Saturday.
              </p>

              <button className={`${buttonClass} mt-4`}>
                Create / Open Week
              </button>
            </ActionForm>
          </div>
        </details>
      </Card>

      {planning.detailsQuery.isLoading && weekId && (
        <Message>Loading the schedule...</Message>
      )}

      {planning.selectedWeek && (
        <WeekSchedule
          key={planning.selectedWeek.id}
          planning={planning}
        />
      )}

      <details className="rounded-xl border border-slate-200 bg-white p-5">
        <summary className="cursor-pointer font-semibold text-blue-900">
          Manage student Class A / B groups
        </summary>

        <p className="mt-3 text-sm text-slate-500">
          Assign students once. Their programme group applies across courses.
        </p>

        <div className="mt-4 divide-y divide-slate-100">
          {planning.students.map((student) => (
            <div
              key={student.student_profile_id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="text-sm font-semibold">{student.full_name}</p>
                <p className="text-xs text-slate-500">
                  {student.student_number}
                </p>
              </div>

              {student.programme_group ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                  Class {student.programme_group}
                </span>
              ) : (
                <ActionForm
                  pending={planning.assignGroup.isPending}
                  onSubmit={(data) =>
                    planning.assignGroup.mutateAsync({
                      studentProfileId: student.student_profile_id,
                      programmeGroup: data.get("programmeGroup"),
                    })
                  }
                  success="Student group assigned."
                >
                  <div className="flex flex-wrap gap-2">
                    <select
                      name="programmeGroup"
                      defaultValue=""
                      required
                      aria-label={`Class for ${student.full_name}`}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Choose class</option>
                      <option value="A">Class A</option>
                      <option value="B">Class B</option>
                    </select>
                    <button className={buttonClass}>Assign</button>
                  </div>
                </ActionForm>
              )}
            </div>
          ))}

          {!planning.optionsQuery.isLoading &&
            planning.students.length === 0 && (
              <p className="py-4 text-sm text-slate-500">
                No enrolled students were found.
              </p>
            )}
        </div>
      </details>
    </div>
  );
}

function WeekSchedule({ planning }) {
  const [editor, setEditor] = useState(null);
  const [group, setGroup] = useState("all");
  const [message, setMessage] = useState("");
  const week = planning.selectedWeek;

  const lessons = planning.plans
    .flatMap((plan) =>
      (plan.lessons || []).map((lesson) => ({ plan, lesson })),
    )
    .filter(({ plan }) => group === "all" || plan.class_name === group)
    .sort((first, second) =>
      `${first.lesson.lesson_date} ${first.lesson.start_time}`.localeCompare(
        `${second.lesson.lesson_date} ${second.lesson.start_time}`,
      ),
    );

  return (
    <>
      <Card title={`Schedule: ${week.week_start} to ${week.week_end}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-semibold">
            Programme class
            <select
              value={group}
              onChange={(event) => setGroup(event.target.value)}
              className={inputClass}
            >
              <option value="all">All classes</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
            </select>
          </label>

          {planning.isDraft && (
            <button
              type="button"
              disabled={
                planning.optionsQuery.isLoading ||
                Boolean(planning.optionsQuery.error) ||
                planning.classes.length === 0
              }
              onClick={() => {
                setMessage("");
                setEditor({ plan: null, lesson: null });
              }}
              className={buttonClass}
            >
              + Add Lesson
            </button>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Status: {week.status}.
          {planning.isDraft
            ? " Lessons are saved as drafts."
            : " This week is read-only."}
        </p>

        {message && (
          <div className="mt-4">
            <Message>{message}</Message>
          </div>
        )}

        {planning.classes.length === 0 &&
          !planning.optionsQuery.isLoading && (
            <p className="mt-4 text-sm text-amber-800">
              Create course classes for this cohort before adding lessons.
            </p>
          )}

        <div className="mt-5 divide-y divide-slate-200">
          {lessons.map(({ plan, lesson }) => (
            <article key={lesson.id} className="py-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-blue-700">
                    {plan.course_title} · {plan.class_name}
                  </p>

                  <h4 className="mt-1 font-bold text-slate-900">
                    {lesson.title}
                  </h4>

                  <p className="mt-2 text-sm text-slate-600">
                    {lesson.lesson_date} · {time(lesson.start_time)}–
                    {time(lesson.end_time)}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {lesson.location || "Location not specified"}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    {staffSummary(lesson.effective_staff)}
                  </p>
                </div>

                {planning.isDraft && (
                  <div className="flex flex-wrap items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setEditor({ plan, lesson })}
                      className={secondaryClass}
                    >
                      Edit
                    </button>

                    <ActionForm
                      pending={planning.removeLesson.isPending}
                      onSubmit={() => {
                        if (!window.confirm(`Remove "${lesson.title}"?`)) {
                          return;
                        }

                        return planning.removeLesson.mutateAsync({
                          lessonId: lesson.id,
                        });
                      }}
                    >
                      <button className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700">
                        Remove
                      </button>
                    </ActionForm>
                  </div>
                )}
              </div>
            </article>
          ))}

          {lessons.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              No lessons match this class and week.
            </p>
          )}
        </div>

        <details className="mt-5 border-t border-slate-200 pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-blue-900">
            Check timetable conflicts
          </summary>

          <div className="mt-4">
            <ActionForm
              pending={planning.reviewWeek.isPending}
              onSubmit={() =>
                planning.reviewWeek.mutateAsync({
                  teachingWeekId: week.id,
                })
              }
            >
              <button className={secondaryClass}>Check Timetable</button>
            </ActionForm>

            {planning.reviewResult && (
              <div className="mt-4 space-y-3">
                <Message error={!planning.reviewResult.review_passed}>
                  {planning.reviewResult.error_count} errors ·{" "}
                  {planning.reviewResult.warning_count} warnings
                </Message>

                {(planning.reviewResult.issues || []).map((issue, index) => (
                  <div
                    key={`${issue.code}-${index}`}
                    className="rounded-lg border border-slate-200 p-3 text-sm"
                  >
                    <p className="font-semibold">{issue.message}</p>
                    <p className="mt-1 text-slate-500">
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
                ))}
              </div>
            )}
          </div>
        </details>
      </Card>

      {editor && (
        <LessonModal
          planning={planning}
          editor={editor}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setMessage("Lesson and teaching team saved.");
          }}
        />
      )}
    </>
  );
}

function LessonModal({ planning, editor, onClose, onSaved }) {
  const dialogRef = useRef(null);
  const [classId, setClassId] = useState(editor.plan?.class_id || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialog.showModal();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, []);

  const selectedPlan =
    editor.plan ||
    planning.plans.find((plan) => plan.class_id === classId);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="lesson-editor-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl border-0 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/60"
    >
      <div className="flex max-h-[90dvh] flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 p-5">
          <h3 id="lesson-editor-title" className="text-xl font-bold">
            {editor.lesson ? "Edit Lesson" : "Add Lesson"}
          </h3>

          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className={secondaryClass}
          >
            Close
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
          <label className="block text-sm font-semibold">
            Course and class
            <select
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              disabled={busy || Boolean(editor.lesson)}
              className={inputClass}
            >
              <option value="">Select course and class</option>

              {editor.plan &&
                !planning.classes.some(
                  (item) => item.id === editor.plan.class_id,
                ) && (
                  <option value={editor.plan.class_id}>
                    {editor.plan.course_title} — {editor.plan.class_name}
                  </option>
                )}

              {planning.classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.course_title} — {item.name}
                </option>
              ))}
            </select>
          </label>

          {classId && (
            <LessonForm
              key={classId}
              classId={classId}
              plan={selectedPlan}
              lesson={editor.lesson}
              planning={planning}
              busy={busy}
              setBusy={setBusy}
              onSaved={onSaved}
            />
          )}
        </div>
      </div>
    </dialog>
  );
}

function LessonForm({
  classId,
  plan,
  lesson,
  planning,
  busy,
  setBusy,
  onSaved,
}) {
  const teamQuery = useCourseTeachingTeam(classId);
  const [error, setError] = useState("");

  const [staff, setStaff] = useState(() => {
    const selections = {};

    const allocations = lesson
      ? lesson.effective_staff || []
      : plan?.staff_allocations || [];

    for (const allocation of allocations) {
      const role = allocation.assignment_role;

      selections[role] = [
        ...(selections[role] || []),
        allocation.staff_profile_id,
      ];
    }

    return selections;
  });

  const roles = teamQuery.data?.roles || [];
  const people = teamQuery.data?.staff || [];

  function toggleStaff(role, id) {
    setStaff((current) => {
      const selected = current[role] || [];

      return {
        ...current,
        [role]: selected.includes(id)
          ? selected.filter((value) => value !== id)
          : [...selected, id],
      };
    });
    setError("");
  }

  async function submit(event) {
    event.preventDefault();

    if (busy) return;

    setError("");

    if (!planning.isDraft) {
      setError("This week is no longer editable.");
      return;
    }

    if (teamQuery.isLoading || teamQuery.error || roles.length === 0) {
      setError("Load the course teaching team before saving.");
      return;
    }

    const selectedStaff = {};

    for (const role of roles) {
      const ids = staff[role] || [];
      const eligibleIds = new Set(
        people
          .filter((person) => person.roles?.includes(role))
          .map((person) => person.staff_profile_id),
      );

      if (ids.length === 0) {
        setError(`Select at least one ${role}.`);
        return;
      }

      if (ids.some((id) => !eligibleIds.has(id))) {
        setError(
          `Remove unavailable ${role} selections and choose eligible staff.`,
        );
        return;
      }

      selectedStaff[role] = ids;
    }

    const data = new FormData(event.currentTarget);

    setBusy(true);

    try {
      await planning.saveLessonWithTeam.mutateAsync({
        teachingWeekId: planning.selectedWeek.id,
        classId,
        lesson: {
          lessonId: lesson?.id || null,
          title: data.get("title"),
          lessonDate: data.get("lessonDate"),
          startTime: data.get("startTime"),
          endTime: data.get("endTime"),
          location: data.get("location"),
          topic: data.get("topic"),
          deliveryMode: data.get("deliveryMode"),
          learningObjectives: data.get("learningObjectives"),
          notes: data.get("notes"),
        },
        staff: selectedStaff,
      });

      onSaved();
    } catch (caught) {
      setError(caught?.message || "The lesson could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-5">
      <fieldset disabled={busy} className="min-w-0 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Lesson title"
            name="title"
            value={lesson?.title}
            required
          />
          <Field
            label="Lesson date"
            name="lessonDate"
            type="date"
            value={lesson?.lesson_date}
            min={planning.selectedWeek.week_start}
            max={planning.selectedWeek.week_end}
            required
          />
          <Field
            label="Start time"
            name="startTime"
            type="time"
            value={time(lesson?.start_time)}
            required
          />
          <Field
            label="End time"
            name="endTime"
            type="time"
            value={time(lesson?.end_time)}
            required
          />
          <div className="sm:col-span-2">
            <Field
              label="Location"
              name="location"
              value={lesson?.location}
              placeholder="For example: Computer Room"
            />
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-bold">Teaching Team</h4>

            <button
              type="button"
              disabled={teamQuery.isFetching}
              onClick={() => {
                setError("");
                void teamQuery.refetch();
              }}
              className="text-sm font-semibold text-blue-800 underline"
            >
              {teamQuery.isFetching ? "Refreshing..." : "Refresh staff"}
            </button>
          </div>

          {teamQuery.isLoading && (
            <p className="mt-3 text-sm text-slate-500">
              Loading eligible staff...
            </p>
          )}

          {teamQuery.error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {teamQuery.error.message}
            </p>
          )}

          {!teamQuery.isLoading &&
            !teamQuery.error &&
            roles.length === 0 && (
              <p className="mt-3 text-sm text-amber-800">
                Teaching roles are not configured for this course.
              </p>
            )}

          {roles.map((role) => {
            const eligible = people.filter((person) =>
              person.roles?.includes(role),
            );

            const eligibleIds = new Set(
              eligible.map((person) => person.staff_profile_id),
            );

            const unavailable = (staff[role] || []).filter(
              (id) => !eligibleIds.has(id),
            );

            return (
              <fieldset
                key={role}
                className="mt-4 rounded-lg border border-slate-200 p-3"
              >
                <legend className="px-1 text-sm font-semibold capitalize">
                  {role}
                </legend>

                <div className="space-y-3">
                  {eligible.map((person) => (
                    <label
                      key={person.staff_profile_id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={(staff[role] || []).includes(
                          person.staff_profile_id,
                        )}
                        onChange={() =>
                          toggleStaff(role, person.staff_profile_id)
                        }
                        className="h-4 w-4"
                      />
                      {person.full_name || "Unnamed staff member"}
                    </label>
                  ))}

                  {!teamQuery.isLoading &&
                    !teamQuery.error &&
                    eligible.length === 0 && (
                      <p className="text-sm text-amber-800">
                        No eligible {role} is appointed to this course.
                        Add the course appointment in Staff Management,
                        then refresh staff.
                      </p>
                    )}

                  {!teamQuery.isLoading &&
                    !teamQuery.error &&
                    unavailable.map((id) => {
                      const allocations = lesson
                        ? lesson.effective_staff || []
                        : plan?.staff_allocations || [];

                      const name = allocations.find(
                        (item) =>
                          item.staff_profile_id === id &&
                          item.assignment_role === role,
                      )?.full_name;

                      return (
                        <label
                          key={id}
                          className="flex items-center gap-3 text-sm text-amber-800"
                        >
                          <input
                            type="checkbox"
                            checked
                            onChange={() => toggleStaff(role, id)}
                            className="h-4 w-4"
                          />
                          {name || "Previously selected staff"} — unavailable;
                          uncheck to replace
                        </label>
                      );
                    })}
                </div>
              </fieldset>
            );
          })}
        </section>

        <details className="rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-blue-900">
            More details
          </summary>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Topic" name="topic" value={lesson?.topic} />

            <label className="block text-sm font-semibold">
              Delivery mode
              <select
                name="deliveryMode"
                defaultValue={lesson?.delivery_mode || "in_person"}
                className={inputClass}
              >
                <option value="in_person">In person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>

            <Field
              label="Learning objectives"
              name="learningObjectives"
              value={lesson?.learning_objectives}
            />

            <label className="block text-sm font-semibold">
              Notes
              <textarea
                name="notes"
                defaultValue={lesson?.notes || ""}
                rows={3}
                className={inputClass}
              />
            </label>
          </div>
        </details>
      </fieldset>

      {error && <Message error>{error}</Message>}

      <div className="border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={
            busy ||
            teamQuery.isLoading ||
            Boolean(teamQuery.error) ||
            roles.length === 0 ||
            !planning.isDraft
          }
          className={`${buttonClass} w-full sm:w-auto`}
        >
          {busy ? "Saving..." : "Save Lesson and Team"}
        </button>
      </div>
    </form>
  );
}

function ActionForm({
  children,
  onSubmit,
  pending = false,
  success = "",
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();

    if (busy || pending) return;

    const data = new FormData(event.currentTarget);

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await onSubmit(data);
      setMessage(success);
    } catch (caught) {
      setError(caught?.message || "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <fieldset disabled={busy || pending} className="min-w-0">
        {children}
      </fieldset>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-2 text-sm text-emerald-700">
          {message}
        </p>
      )}
    </form>
  );
}

function Field({ label, value, ...props }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        {...props}
        defaultValue={value ?? ""}
        className={inputClass}
      />
    </label>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-bold text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
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

function staffSummary(allocations = []) {
  return allocations.length
    ? allocations
        .map(
          (item) =>
            `${item.full_name || "Staff member"} (${item.assignment_role})`,
        )
        .join(" · ")
    : "No teaching team recorded";
}

function time(value) {
  return value ? String(value).slice(0, 5) : "";
}