import { useState } from "react";
import { RefreshCw, Users, UserRoundCheck } from "lucide-react";

import { useAdvisoryCouples } from "../../hooks/useAdvisoryCouples";
import MentoringLayout from "../../layouts/MentoringLayout";

const initialCoupleForm = {
  displayName: "",
  firstMentorProfileId: "",
  secondMentorProfileId: "",
};

const initialAssignmentForm = {
  studentProfileId: "",
  coupleId: "",
  assignmentReason: "",
  nextCheckInAt: "",
};

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:opacity-70";

const buttonClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60";

export default function MentorAssignmentsPage() {
  const {
    couples,
    availableAdvisors,
    students,
    loading,
    fetching,
    error,
    refresh,
    createCouple,
    creatingCouple,
    createCoupleError,
    resetCreateCouple,
    assignStudent,
    assigningStudent,
    assignStudentError,
    resetAssignStudent,
  } = useAdvisoryCouples();

  const [coupleForm, setCoupleForm] = useState(initialCoupleForm);
  const [assignmentForm, setAssignmentForm] = useState(
    initialAssignmentForm,
  );

  const [coupleSuccess, setCoupleSuccess] = useState("");
  const [assignmentSuccess, setAssignmentSuccess] = useState("");

  const busy = creatingCouple || assigningStudent;
  const readyCouples = couples.filter(
    (couple) => couple.ready_for_assignment,
  );

  const selectedCouple = couples.find(
    (couple) => couple.id === assignmentForm.coupleId,
  );

  function changeCoupleForm(event) {
    const { name, value } = event.target;

    setCoupleForm((current) => ({
      ...current,
      [name]: value,
    }));

    setCoupleSuccess("");
    resetCreateCouple();
  }

  function changeAssignmentForm(event) {
    const { name, value } = event.target;

    setAssignmentForm((current) => ({
      ...current,
      [name]: value,
    }));

    setAssignmentSuccess("");
    resetAssignStudent();
  }

  async function handleCreateCouple(event) {
    event.preventDefault();

    setCoupleSuccess("");
    resetCreateCouple();

    try {
      const result = await createCouple(coupleForm);

      setCoupleSuccess(
        result.message || "The advisory couple was created.",
      );

      setCoupleForm(initialCoupleForm);

      setAssignmentForm((current) => ({
        ...current,
        coupleId: result.couple_id,
      }));

      setAssignmentSuccess("");
      resetAssignStudent();
    } catch {
      // The mutation exposes the error below.
    }
  }

  async function handleAssignStudent(event) {
    event.preventDefault();

    setAssignmentSuccess("");
    resetAssignStudent();

    try {
      const result = await assignStudent(assignmentForm);

      setAssignmentSuccess(
        result.message || "The student was assigned to the couple.",
      );

      setAssignmentForm(initialAssignmentForm);
    } catch {
      // The mutation exposes the error below.
    }
  }

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Advisory Department
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                Advisory Couples & Assignments
              </h1>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Form advisory couples and assign students to their shared
                care. Each spouse uses their own account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refresh()}
              disabled={fetching || busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={fetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {loading ? (
            <Message>Loading couples and assignment options...</Message>
          ) : error ? (
            <Message error>
              {error.message || "Assignment options could not be loaded."}
              {" "}Use Refresh to try again.
            </Message>
          ) : (
            <>
              <section
                aria-label="Assignment summary"
                className="grid gap-4 sm:grid-cols-3"
              >
                <SummaryCard
                  label="Couples Accepting Students"
                  value={readyCouples.length}
                />

                <SummaryCard
                  label="Students Awaiting Assignment"
                  value={students.length}
                />

                <SummaryCard
                  label="Advisors Available to Pair"
                  value={availableAdvisors.length}
                />
              </section>

              {fetching && (
                <p role="status" className="text-sm text-slate-500">
                  Updating assignment options...
                </p>
              )}

              <div className="grid items-start gap-8 xl:grid-cols-2">
                <Panel
                  title="Create an Advisory Couple"
                  description="Select two appointed Advisors who are not already in a couple."
                >
                  <form
                    onSubmit={handleCreateCouple}
                    className="space-y-5"
                  >
                    <fieldset disabled={busy} className="space-y-5">
                      <Field
                        label="Couple name"
                        htmlFor="displayName"
                      >
                        <input
                          id="displayName"
                          name="displayName"
                          value={coupleForm.displayName}
                          onChange={changeCoupleForm}
                          required
                          maxLength={200}
                          placeholder="For example: Osazee and Blessing"
                          className={inputClasses}
                        />
                      </Field>

                      <Field
                        label="First Advisor"
                        htmlFor="firstMentorProfileId"
                      >
                        <select
                          id="firstMentorProfileId"
                          name="firstMentorProfileId"
                          value={coupleForm.firstMentorProfileId}
                          onChange={changeCoupleForm}
                          required
                          className={inputClasses}
                        >
                          <option value="">Select an Advisor</option>

                          {availableAdvisors.map((advisor) => (
                            <option
                              key={advisor.mentor_profile_id}
                              value={advisor.mentor_profile_id}
                              disabled={
                                advisor.mentor_profile_id ===
                                coupleForm.secondMentorProfileId
                              }
                            >
                              {advisor.full_name}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field
                        label="Second Advisor"
                        htmlFor="secondMentorProfileId"
                      >
                        <select
                          id="secondMentorProfileId"
                          name="secondMentorProfileId"
                          value={coupleForm.secondMentorProfileId}
                          onChange={changeCoupleForm}
                          required
                          className={inputClasses}
                        >
                          <option value="">Select an Advisor</option>

                          {availableAdvisors.map((advisor) => (
                            <option
                              key={advisor.mentor_profile_id}
                              value={advisor.mentor_profile_id}
                              disabled={
                                advisor.mentor_profile_id ===
                                coupleForm.firstMentorProfileId
                              }
                            >
                              {advisor.full_name}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <p className="text-sm leading-6 text-slate-500">
                        Both Advisors share responsibility. Each couple
                        can have up to three active students.
                      </p>

                      {availableAdvisors.length < 2 && (
                        <Message>
                          At least two active, available Advisors without
                          a current couple are needed.
                        </Message>
                      )}

                      <button
                        type="submit"
                        disabled={
                          fetching ||
                          availableAdvisors.length < 2 ||
                          !coupleForm.displayName.trim() ||
                          !coupleForm.firstMentorProfileId ||
                          !coupleForm.secondMentorProfileId ||
                          coupleForm.firstMentorProfileId ===
                            coupleForm.secondMentorProfileId
                        }
                        className={`${buttonClasses} w-full`}
                      >
                        <Users size={18} aria-hidden="true" />
                        {creatingCouple
                          ? "Creating Couple..."
                          : "Create Couple"}
                      </button>
                    </fieldset>

                    {coupleSuccess && (
                      <Message success>{coupleSuccess}</Message>
                    )}

                    {createCoupleError && (
                      <Message error>
                        {createCoupleError.message}
                      </Message>
                    )}
                  </form>
                </Panel>

                <Panel
                  title="Assign a Student"
                  description="Choose a student and a couple with available capacity."
                >
                  <form
                    onSubmit={handleAssignStudent}
                    className="space-y-5"
                  >
                    <fieldset disabled={busy} className="space-y-5">
                      <Field
                        label="Student"
                        htmlFor="studentProfileId"
                      >
                        <select
                          id="studentProfileId"
                          name="studentProfileId"
                          value={assignmentForm.studentProfileId}
                          onChange={changeAssignmentForm}
                          required
                          className={inputClasses}
                        >
                          <option value="">Select a student</option>

                          {students.map((student) => (
                            <option
                              key={student.student_profile_id}
                              value={student.student_profile_id}
                            >
                              {student.full_name}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field
                        label="Advisory couple"
                        htmlFor="coupleId"
                      >
                        <select
                          id="coupleId"
                          name="coupleId"
                          value={assignmentForm.coupleId}
                          onChange={changeAssignmentForm}
                          required
                          className={inputClasses}
                        >
                          <option value="">Select a couple</option>

                          {couples.map((couple) => (
                            <option
                              key={couple.id}
                              value={couple.id}
                              disabled={!couple.ready_for_assignment}
                            >
                              {couple.display_name}
                              {" — "}
                              {couple.ready_for_assignment
                                ? `${couple.remaining_capacity} spaces`
                                : "Currently unavailable"}
                            </option>
                          ))}
                        </select>
                      </Field>

                      {selectedCouple && (
                        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                          <p className="font-semibold">
                            {selectedCouple.members
                              .map((member) => member.full_name)
                              .join(" & ")}
                          </p>

                          <p className="mt-2">
                            {selectedCouple.active_student_count}/
                            {selectedCouple.max_active_students} students
                            assigned
                          </p>
                        </div>
                      )}

                      <Field
                        label="Next check-in — optional (Nigeria time, WAT)"
                        htmlFor="nextCheckInAt"
                      >
                        <input
                          id="nextCheckInAt"
                          name="nextCheckInAt"
                          type="datetime-local"
                          value={assignmentForm.nextCheckInAt}
                          onChange={changeAssignmentForm}
                          className={inputClasses}
                        />
                      </Field>

                      <Field
                        label="Assignment reason — optional"
                        htmlFor="assignmentReason"
                      >
                        <textarea
                          id="assignmentReason"
                          name="assignmentReason"
                          value={assignmentForm.assignmentReason}
                          onChange={changeAssignmentForm}
                          rows={3}
                          maxLength={1000}
                          className={inputClasses}
                          placeholder="Enter relevant assignment context."
                        />
                      </Field>

                      {students.length === 0 && (
                        <Message>
                          No eligible students are currently awaiting
                          assignment.
                        </Message>
                      )}

                      {readyCouples.length === 0 && (
                        <Message>
                          No couples are currently accepting students.
                          Create a couple or review existing capacity.
                        </Message>
                      )}

                      <button
                        type="submit"
                        disabled={
                          fetching ||
                          !assignmentForm.studentProfileId ||
                          !selectedCouple?.ready_for_assignment
                        }
                        className={`${buttonClasses} w-full`}
                      >
                        <UserRoundCheck size={18} aria-hidden="true" />
                        {assigningStudent
                          ? "Assigning Student..."
                          : "Assign Student"}
                      </button>
                    </fieldset>

                    {assignmentSuccess && (
                      <Message success>{assignmentSuccess}</Message>
                    )}

                    {assignStudentError && (
                      <Message error>
                        {assignStudentError.message}
                      </Message>
                    )}
                  </form>
                </Panel>
              </div>

              <Panel
                title="Advisory Couples"
                description="Current members, assignment totals and available capacity."
              >
                {couples.length === 0 ? (
                  <p className="py-6 text-center text-slate-500">
                    No advisory couples have been created yet.
                  </p>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {couples.map((couple) => (
                      <article
                        key={couple.id}
                        className="rounded-xl border border-slate-200 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-blue-950">
                            {couple.display_name}
                          </h3>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                              couple.ready_for_assignment
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {couple.ready_for_assignment
                              ? "Accepting students"
                              : couple.status !== "active"
                                ? "Inactive"
                                : couple.active_student_count >=
                                    couple.max_active_students
                                  ? "At capacity"
                                  : "Needs review"}
                          </span>
                        </div>

                        <ul className="mt-4 space-y-2">
                          {couple.members.map((member) => (
                            <li
                              key={member.mentor_profile_id}
                              className="text-sm text-slate-700"
                            >
                              {member.full_name}

                              {(member.account_status !== "active" ||
                                !["available", "limited"].includes(
                                  member.availability_status,
                                )) && (
                                <span className="ml-2 text-amber-700">
                                  (Currently unavailable)
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-5 flex justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
                          <span className="text-slate-600">
                            {couple.active_student_count}/
                            {couple.max_active_students} students
                          </span>

                          <span className="font-semibold text-blue-900">
                            {couple.remaining_capacity} remaining spaces
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel
                title="Students Awaiting Assignment"
                description="Active students who do not have a current Advisor assignment."
              >
                {students.length === 0 ? (
                  <p className="py-6 text-center text-slate-500">
                    No eligible students are awaiting assignment.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {students.map((student) => (
                      <li
                        key={student.student_profile_id}
                        className="flex items-center justify-between gap-4 py-4"
                      >
                        <p className="font-medium text-slate-800">
                          {student.full_name}
                        </p>

                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Awaiting assignment
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </>
          )}
        </div>
      </main>
    </MentoringLayout>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-bold text-blue-950">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-xl border border-blue-100 bg-blue-50 p-5">
      <p className="text-sm font-semibold text-blue-800">{label}</p>
      <p className="mt-3 text-3xl font-bold text-blue-950">{value}</p>
    </article>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function Message({ children, error = false, success = false }) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-lg border p-4 text-sm leading-6 ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : success
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-blue-200 bg-blue-50 text-blue-800"
      }`}
    >
      {children}
    </div>
  );
}