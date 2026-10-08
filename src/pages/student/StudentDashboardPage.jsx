import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useStudentProfile } from "../../hooks/useStudentProfile";
import StudentLayout from "../../layouts/StudentLayout";

export default function StudentDashboardPage() {
  const { profile } = useAuth();

  const {
    studentProfile,
    studentProfileLoading,
    studentProfileError,

    assignedMentor,
    assignedMentorLoading,
    assignedMentorError,

    approvedMentorFeedback,
    approvedMentorFeedbackCount,
    mentorFeedbackLoading,
    mentorFeedbackError,
  } = useStudentProfile();

  if (studentProfileLoading || assignedMentorLoading) {
    return (
      <StudentLayout>
        <PageMessage message="Preparing your student dashboard..." />
      </StudentLayout>
    );
  }

  if (studentProfileError || !studentProfile) {
    return (
      <StudentLayout>
        <PageMessage
          error
          message={
            studentProfileError?.message ||
            "Your student dashboard could not be loaded."
          }
        />
      </StudentLayout>
    );
  }

  const completion = studentProfile.profile_completion_percentage || 0;

  const displayName =
    studentProfile.preferred_name ||
    profile?.full_name?.split(" ")[0] ||
    "Student";

  const mentor = assignedMentor?.mentor || null;

  const hasAssignedMentor = Boolean(assignedMentor?.assigned && mentor);

  return (
    <StudentLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Student Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">
                Welcome, {displayName}
              </h1>

              <p className="mt-2 max-w-2xl leading-7 text-slate-600">
                Review your learning, responsibilities, progress and required
                next actions.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              {formatLongDate(new Date())}
            </p>
          </header>

          {completion < 100 && (
            <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 md:flex md:items-center md:justify-between md:gap-6">
              <div>
                <h2 className="font-bold text-amber-900">
                  Complete your student profile
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Your profile is {completion}% complete. Add the remaining
                  personal and emergency contact information.
                </p>
              </div>

              <Link
                to="/student/profile"
                className="mt-4 inline-flex rounded-lg bg-amber-700 px-5 py-3 text-sm font-semibold text-white md:mt-0"
              >
                Complete Profile
              </Link>
            </section>
          )}

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewCard
              label="Profile Completion"
              value={`${completion}%`}
              detail={
                completion === 100 ? "Profile complete" : "Information required"
              }
              tone={completion === 100 ? "green" : "amber"}
            />

            <OverviewCard
              label="Cohort"
              value={studentProfile.cohort?.code || "Pending"}
              detail={studentProfile.cohort?.name || "Awaiting assignment"}
              tone="blue"
            />

            <OverviewCard
              label="Assigned Mentor"
              value={
                hasAssignedMentor ? mentor.full_name || "Assigned" : "Pending"
              }
              detail={
                hasAssignedMentor
                  ? mentor.specialization || "Student Development"
                  : "Awaiting assignment"
              }
              tone="purple"
            />

            {/* <OverviewCard
              label="Assigned Mentor"
              value={
                studentProfile
                  .assigned_mentor_id
                  ? "Assigned"
                  : "Pending"
              }
              detail={
                studentProfile
                  .assigned_mentor_id
                  ? "View mentor details"
                  : "Awaiting assignment"
              }
              tone="purple"
            /> */}

            <OverviewCard
              label="Enrollment"
              value={formatValue(studentProfile.enrollment_status)}
              detail={studentProfile.student_number || "Student number pending"}
              tone="slate"
            />
          </section>
          {assignedMentorError ? (
            <section
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
            >
              {assignedMentorError.message ||
                "Your assigned mentor details could not be loaded."}
            </section>
          ) : null}

          {hasAssignedMentor ? <AssignedMentorCard mentor={mentor} /> : null}

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-8">
              <DashboardSection
                title="Today’s Learning"
                description="Your scheduled learning activities will appear here."
                actionLabel="View Learning"
              >
                <EmptyState
                  title="No learning activities scheduled"
                  description="Activities assigned by instructors and facilitators will appear here."
                />
              </DashboardSection>

              <DashboardSection
                title="My Progress"
                description="Your development across the Pioneer programme."
                actionLabel="View Progress"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <ProgressArea label="Learning" />

                  <ProgressArea label="Competencies" />

                  <ProgressArea label="Development" />

                  <ProgressArea label="Engagement" />

                  <ProgressArea label="Responsibility" />

                  <ProgressArea label="Readiness" />
                </div>
              </DashboardSection>

              {/* <DashboardSection
                title="Recent Feedback"
                description="Published feedback from your educators and support team."
                actionLabel="View Feedback"
              >
                <EmptyState
                  title="No feedback available"
                  description="Feedback authorized for student viewing will appear here."
                />
              </DashboardSection> */}

              <DashboardSection
                title="Recent Feedback"
                description={`${approvedMentorFeedbackCount} approved ${
                  approvedMentorFeedbackCount === 1
                    ? "feedback item"
                    : "feedback items"
                } from your mentor.`}
              >
                {mentorFeedbackLoading ? (
                  <div
                    role="status"
                    className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600"
                  >
                    Loading approved mentor feedback...
                  </div>
                ) : mentorFeedbackError ? (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700"
                  >
                    {mentorFeedbackError.message ||
                      "Your approved mentor feedback could not be loaded."}
                  </div>
                ) : approvedMentorFeedback.length > 0 ? (
                  <div className="space-y-4">
                    {approvedMentorFeedback.slice(0, 3).map((feedback) => (
                      <ApprovedMentorFeedbackCard
                        key={feedback.report_id}
                        feedback={feedback}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No approved feedback yet"
                    description="Feedback will appear here after review and approval by the Mentor Department."
                  />
                )}
              </DashboardSection>
            </div>

            <div className="space-y-8">
              <DashboardSection
                title="My To Do"
                description="Your priority actions and deadlines."
              >
                <div className="space-y-3">
                  {completion < 100 ? (
                    <TaskItem
                      title="Complete your profile"
                      description={`${completion}% completed`}
                      link="/student/profile"
                    />
                  ) : (
                    <EmptyState
                      compact
                      title="Nothing due"
                      description="New assignments and actions will appear here."
                    />
                  )}
                </div>
              </DashboardSection>

              <DashboardSection
                title="My Responsibilities"
                description="Current campus and programme responsibilities."
              >
                <EmptyState
                  compact
                  title="No current responsibilities"
                  description="Assigned campus-service tasks and responsibilities will appear here."
                />
              </DashboardSection>

              <DashboardSection
                title="Upcoming"
                description="Important dates and activities."
              >
                <EmptyState
                  compact
                  title="No upcoming activities"
                  description="Scheduled activities and deadlines will appear here."
                />
              </DashboardSection>

              <DashboardSection
                title="My Support"
                description="Mentor and student-support follow-up."
              >
                <EmptyState
                  compact
                  title="No support actions"
                  description="Authorized follow-up and support actions will appear here."
                />
              </DashboardSection>
            </div>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}

function AssignedMentorCard({ mentor }) {
  const initials = String(mentor.full_name || "Mentor")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-purple-200 bg-white shadow-sm">
      <div className="border-b border-purple-100 bg-purple-50 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">
          My Mentor
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Your assigned development mentor
        </h2>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
        {mentor.profile_photo_url ? (
          <img
            src={mentor.profile_photo_url}
            alt={`${mentor.full_name} profile`}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-purple-100"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-800 ring-4 ring-purple-50">
            {initials || "M"}
          </div>
        )}

        <div>
          <h3 className="text-2xl font-bold text-blue-950">
            {mentor.full_name || "Assigned Mentor"}
          </h3>

          <p className="mt-1 font-medium text-purple-700">
            {mentor.specialization || "Student Development"}
          </p>

          {mentor.biography ? (
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              {mentor.biography}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <MentorDetail
              label="Assignment status"
              value={formatValue(mentor.assignment_status)}
            />

            <MentorDetail
              label="Mentoring started"
              value={formatDateValue(mentor.start_date)}
            />

            <MentorDetail
              label="Next check-in"
              value={formatDateValue(mentor.next_check_in_at)}
            />

            <MentorDetail
              label="Feedback"
              value="Visible after department approval"
            />
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            Mentor feedback will appear in your student record only after review
            and approval by the Mentor Department. No student response is
            required.
          </p>
        </div>
      </div>
    </section>
  );
}

function ApprovedMentorFeedbackCard({ feedback }) {
  const mentorName = feedback.mentor?.full_name || "Your mentor";

  return (
    <article className="rounded-xl border border-purple-200 bg-purple-50/50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              {formatValue(feedback.report_type)}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Approved
            </span>
          </div>

          <p className="mt-3 text-sm font-semibold text-blue-950">
            Feedback from {mentorName}
          </p>
        </div>

        <p className="shrink-0 text-xs text-slate-500">
          {formatDateValue(feedback.approved_at)}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-purple-100 bg-white p-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {feedback.student_visible_summary}
        </p>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        This feedback was reviewed and approved for you by the Mentor
        Department. No response is required.
      </p>
    </article>
  );
}

function MentorDetail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-900">
        {value || "Not scheduled"}
      </p>
    </div>
  );
}

function OverviewCard({ label, value, detail, tone }) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    green: "border-green-200 bg-green-50 text-green-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    purple: "border-purple-200 bg-purple-50 text-purple-800",
    slate: "border-slate-200 bg-white text-slate-800",
  };

  return (
    <article
      className={`rounded-xl border p-5 shadow-sm ${
        tones[tone] || tones.slate
      }`}
    >
      <p className="text-sm opacity-75">{label}</p>

      <p className="mt-3 text-2xl font-bold">{value}</p>

      <p className="mt-2 text-xs opacity-75">{detail}</p>
    </article>
  );
}

function DashboardSection({ title, description, actionLabel, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
        <div>
          <h2 className="text-lg font-bold text-blue-950">{title}</h2>

          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        {actionLabel && (
          <span className="shrink-0 text-xs font-semibold text-slate-400">
            Coming soon
          </span>
        )}
      </header>

      <div className="p-5">{children}</div>
    </section>
  );
}

function ProgressArea({ label }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-800">{label}</p>

        <span className="h-3 w-3 rounded-full bg-slate-300" />
      </div>

      <p className="mt-3 text-xs text-slate-500">No evidence recorded yet</p>
    </article>
  );
}

function TaskItem({ title, description, link }) {
  return (
    <Link
      to={link}
      className="block rounded-lg border border-amber-200 bg-amber-50 p-4 transition hover:border-amber-300"
    >
      <p className="font-semibold text-amber-900">{title}</p>

      <p className="mt-1 text-sm text-amber-700">{description}</p>
    </Link>
  );
}

function EmptyState({ title, description, compact = false }) {
  return (
    <div
      className={`rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center ${
        compact ? "p-5" : "p-8"
      }`}
    >
      <p className="font-semibold text-slate-700">{title}</p>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PageMessage({ message, error = false }) {
  return (
    <main className="p-5 md:p-8">
      <div
        role={error ? "alert" : "status"}
        className={`mx-auto max-w-3xl rounded-xl border p-6 text-center ${
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

function formatValue(value) {
  if (!value) {
    return "Not available";
  }

  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateValue(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: String(value).includes("T") ? "numeric" : undefined,
    minute: String(value).includes("T") ? "2-digit" : undefined,
  }).format(new Date(value));
}
