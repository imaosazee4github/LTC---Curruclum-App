import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Target,
  UserRoundCheck,
  Users,
  XCircle,
} from "lucide-react";

import { useState } from "react";

import { useCoachingAssignments } from "../../hooks/useCoachingAssignments";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";

const initialAssignmentForm = {
  studentProfileId: "",
  coachStaffProfileId: "",
  developmentArea: "",
  goal: "",
  currentPosition: "",
  practicePlan: "",
  targetDate: "",
};

const initialClosingForm = {
  assignmentId: "",
  closingStatus: "completed",
  closingNotes: "",
};

export default function CoachingAssignmentsPage() {
  const {
    coaches,
    students,
    coachingAssignments,
    coachingAssignmentsLoading,
    coachingAssignmentsFetching,
    coachingAssignmentsError,
    refreshCoachingAssignments,
    assignStudent,
    assigningStudent,
    assignStudentError,
    resetAssignStudent,
    closeAssignment,
    closingAssignment,
    closeAssignmentError,
    resetCloseAssignment,
  } = useCoachingAssignments();

  const [assignmentForm, setAssignmentForm] = useState(initialAssignmentForm);

  const [closingForm, setClosingForm] = useState(initialClosingForm);

  const [successMessage, setSuccessMessage] = useState("");

  function handleAssignmentChange(event) {
    const { name, value } = event.target;

    setAssignmentForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    resetAssignStudent();
  }

  async function handleAssignmentSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");

    try {
      const result = await assignStudent(assignmentForm);

      setSuccessMessage(
        result?.message ||
          "The student was assigned to the coach successfully.",
      );

      setAssignmentForm(initialAssignmentForm);
    } catch {
      // Mutation error is displayed below.
    }
  }

  function beginClosing(assignmentId) {
    setClosingForm({
      assignmentId,
      closingStatus: "completed",
      closingNotes: "",
    });

    setSuccessMessage("");
    resetCloseAssignment();
  }

  function cancelClosing() {
    setClosingForm(initialClosingForm);

    resetCloseAssignment();
  }

  function handleClosingChange(event) {
    const { name, value } = event.target;

    setClosingForm((current) => ({
      ...current,
      [name]: value,
    }));

    resetCloseAssignment();
  }

  async function handleCloseSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");

    try {
      const result = await closeAssignment(closingForm);

      setSuccessMessage(
        result?.message || "The coaching assignment was closed successfully.",
      );

      setClosingForm(initialClosingForm);
    } catch {
      // Mutation error is displayed below.
    }
  }

  if (coachingAssignmentsLoading) {
    return (
      <SuperAdminLayout>
        <PageState message="Loading coaching assignments..." />
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <main className="px-5 py-8 md:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
                Student Development
              </p>

              <h1 className="mt-1 text-3xl font-bold text-blue-950">
                Coaching Assignments
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                Assign students to coaches for specific development areas and
                monitor their active coaching relationships.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshCoachingAssignments()}
              disabled={coachingAssignmentsFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={coachingAssignmentsFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {coachingAssignmentsError ? (
            <Alert type="error" message={coachingAssignmentsError.message} />
          ) : null}

          {successMessage ? (
            <Alert type="success" message={successMessage} />
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
           
            <SummaryCard
              title="Coaches"
              value={coaches.length}
              icon={UserRoundCheck}
              color="blue"
            />

            <SummaryCard
              title="Available Coaches"
              value={countAvailableCoaches(coaches)}
              icon={CheckCircle2}
              color="emerald"
            />

            <SummaryCard
              title="Students"
              value={students.length}
              icon={Users}
              color="amber"
            />

            <SummaryCard
              title="Active Assignments"
              value={countActiveAssignments(coachingAssignments)}
              icon={ClipboardList}
              color="violet"
            />
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-blue-950">
                  Assign a Student
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  A student can have different coaches for different development
                  areas.
                </p>
              </div>

              <form
                onSubmit={handleAssignmentSubmit}
                className="mt-6 space-y-5"
              >
                <FormField label="Student" required>
                  <select
                    name="studentProfileId"
                    value={assignmentForm.studentProfileId}
                    onChange={handleAssignmentChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select a student</option>

                    {students.map((student) => (
                      <option
                        key={student.student_profile_id || student.id}
                        value={student.student_profile_id || student.id}
                      >
                        {getStudentLabel(student)}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Coach" required>
                  <select
                    name="coachStaffProfileId"
                    value={assignmentForm.coachStaffProfileId}
                    onChange={handleAssignmentChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select a coach</option>

                    {coaches.map((coach) => (
                      <option
                        key={coach.staff_profile_id || coach.id}
                        value={coach.staff_profile_id || coach.id}
                      >
                        {getCoachLabel(coach)}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Development Area" required>
                  <input
                    type="text"
                    name="developmentArea"
                    value={assignmentForm.developmentArea}
                    onChange={handleAssignmentChange}
                    required
                    placeholder="Example: Public speaking"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Coaching Goal" required>
                  <textarea
                    name="goal"
                    value={assignmentForm.goal}
                    onChange={handleAssignmentChange}
                    required
                    rows={3}
                    placeholder="Describe the capability the student should develop."
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Current Position">
                  <textarea
                    name="currentPosition"
                    value={assignmentForm.currentPosition}
                    onChange={handleAssignmentChange}
                    rows={3}
                    placeholder="Describe the student's current capability."
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Practice Plan">
                  <textarea
                    name="practicePlan"
                    value={assignmentForm.practicePlan}
                    onChange={handleAssignmentChange}
                    rows={3}
                    placeholder="Describe the practice activities and support."
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Target Date">
                  <input
                    type="date"
                    name="targetDate"
                    value={assignmentForm.targetDate}
                    onChange={handleAssignmentChange}
                    className={inputClass}
                  />
                </FormField>

                {assignStudentError ? (
                  <Alert type="error" message={assignStudentError.message} />
                ) : null}

                <button
                  type="submit"
                  disabled={assigningStudent}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserRoundCheck size={18} />

                  {assigningStudent
                    ? "Assigning..."
                    : "Assign Student to Coach"}
                </button>
              </form>
            </section>

            <section>
              <div>
                <h2 className="text-xl font-bold text-blue-950">
                  Existing Assignments
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Review active, completed, and cancelled coaching assignments.
                </p>
              </div>

              {coachingAssignments.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <UserRoundCheck className="mx-auto h-10 w-10 text-slate-400" />

                  <h3 className="mt-4 font-bold text-slate-900">
                    No coaching assignments
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Use the form to assign the first student to a coach.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {coachingAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.assignment_id || assignment.id}
                      assignment={assignment}
                      closingForm={closingForm}
                      closingAssignment={closingAssignment}
                      closeAssignmentError={closeAssignmentError}
                      onBeginClosing={beginClosing}
                      onCancelClosing={cancelClosing}
                      onClosingChange={handleClosingChange}
                      onCloseSubmit={handleCloseSubmit}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </SuperAdminLayout>
  );
}

function AssignmentCard({
  assignment,
  closingForm,
  closingAssignment,
  closeAssignmentError,
  onBeginClosing,
  onCancelClosing,
  onClosingChange,
  onCloseSubmit,
}) {
  const assignmentId = assignment.assignment_id || assignment.id;

  const status = assignment.status || "active";

  const isClosing = closingForm.assignmentId === assignmentId;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-950">
              {getAssignmentStudentName(assignment)}
            </h3>

            <StatusBadge status={status} />
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Coach:{" "}
            <span className="font-semibold text-slate-700">
              {getAssignmentCoachName(assignment)}
            </span>
          </p>
        </div>

        {status === "active" && !isClosing ? (
          <button
            type="button"
            onClick={() => onBeginClosing(assignmentId)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close Assignment
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InformationItem
          label="Development Area"
          value={assignment.development_area || assignment.developmentArea}
          icon={Target}
        />

        <InformationItem
          label="Target Date"
          value={formatDate(assignment.target_date || assignment.targetDate)}
          icon={CalendarDays}
        />

        <InformationItem label="Goal" value={assignment.goal} />

        <InformationItem
          label="Current Position"
          value={assignment.current_position || assignment.currentPosition}
        />

        <InformationItem
          label="Practice Plan"
          value={assignment.practice_plan || assignment.practicePlan}
        />

        <InformationItem
          label="Closing Notes"
          value={assignment.closing_notes || assignment.closingNotes}
        />
      </div>

      {isClosing ? (
        <form
          onSubmit={onCloseSubmit}
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <h4 className="font-bold text-slate-900">Close this assignment</h4>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField label="Closing Status">
              <select
                name="closingStatus"
                value={closingForm.closingStatus}
                onChange={onClosingChange}
                className={inputClass}
              >
                <option value="completed">Completed</option>

                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>

            <FormField label="Closing Notes" required>
              <textarea
                name="closingNotes"
                value={closingForm.closingNotes}
                onChange={onClosingChange}
                required
                rows={3}
                placeholder="Explain the outcome or reason for closing."
                className={inputClass}
              />
            </FormField>
          </div>

          {closeAssignmentError ? (
            <Alert type="error" message={closeAssignmentError.message} />
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={closingAssignment}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <CheckCircle2 size={17} />

              {closingAssignment ? "Closing..." : "Confirm Close"}
            </button>

            <button
              type="button"
              onClick={onCancelClosing}
              disabled={closingAssignment}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              <XCircle size={17} />
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    emerald: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    violet: "bg-violet-100 text-violet-800",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>

        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={23} />
        </div>
      </div>
    </article>
  );
}

function InformationItem({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {Icon ? <Icon size={15} /> : null}

        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required ? <span className="text-red-600"> *</span> : null}
      </span>

      {children}
    </label>
  );
}

function Alert({ type, message }) {
  const success = type === "success";

  return (
    <div
      className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {message}
    </div>
  );
}

function PageState({ message }) {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5">
      <div className="text-center">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-900" />

        <p className="mt-4 font-semibold text-slate-700">{message}</p>
      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: "bg-emerald-100 text-emerald-800",
    paused: "bg-amber-100 text-amber-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
        styles[status] || styles.cancelled
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

function getStudentLabel(student) {
  const name =
    student.full_name ||
    student.student_name ||
    student.profile?.full_name ||
    "Unnamed student";

  const number = student.student_number;

  return number ? `${name} — ${number}` : name;
}

function getCoachLabel(coach) {
  const name =
    coach.full_name ||
    coach.coach_name ||
    coach.profile?.full_name ||
    "Unnamed coach";

  const number = coach.staff_number;

  return number ? `${name} — ${number}` : name;
}

function getAssignmentStudentName(assignment) {
  return (
    assignment.student?.full_name ||
    assignment.student_name ||
    assignment.full_name ||
    "Student"
  );
}

function getAssignmentCoachName(assignment) {
  return assignment.coach?.full_name || assignment.coach_name || "Coach";
}


function countAvailableCoaches(
  coaches,
) {
  return coaches.filter(
    (coach) =>
      coach.availability_status ===
        "available" ||
      coach.availabilityStatus ===
        "available",
  ).length;
}

function countActiveAssignments(
  assignments,
) {
  return assignments.filter(
    (assignment) =>
      assignment.status ===
      "active",
  ).length;
}

function formatDate(value) {
  if (!value) {
    return "Not provided";
  }

  const [year, month, day] = String(value).slice(0, 10).split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatLabel(value) {
  return String(value || "").replaceAll("_", " ");
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100";
