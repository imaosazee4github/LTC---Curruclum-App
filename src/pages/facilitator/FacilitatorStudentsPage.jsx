import { useState } from "react";

import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  Mail,
  RefreshCw,
  Users,
} from "lucide-react";

import { useFacilitatorStudents } from "../../hooks/useFacilitatorStudents";
import FacilitatorLayout from "../../layouts/FacilitatorLayout";

export default function FacilitatorStudentsPage() {
  const [learningExperienceId, setLearningExperienceId] = useState("");

  const {
    facilitatorExperiences,
    facilitatorStudents,
    facilitatorStudentsLoading,
    facilitatorStudentsFetching,
    facilitatorStudentsError,
    refreshFacilitatorStudents,
  } = useFacilitatorStudents({
    learningExperienceId: learningExperienceId || null,
  });

  if (facilitatorStudentsLoading) {
    return (
      <FacilitatorLayout>
        <PageMessage message="Loading your students..." />
      </FacilitatorLayout>
    );
  }

  if (facilitatorStudentsError) {
    return (
      <FacilitatorLayout>
        <PageMessage
          error
          message={
            facilitatorStudentsError.message ||
            "Your students could not be loaded."
          }
        />
      </FacilitatorLayout>
    );
  }

  const studentCount = new Set(
    facilitatorStudents.map(
      (student) => student.student_profile_id || student.profile_id,
    ),
  ).size;

  const totalEngagementRecords = facilitatorStudents.reduce(
    (total, student) =>
      total + Number(student.engagement_record_count || 0),
    0,
  );

  const totalFollowUps = facilitatorStudents.reduce(
    (total, student) => total + Number(student.follow_up_count || 0),
    0,
  );

  return (
    <FacilitatorLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Facilitation
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                My Students
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review students taking your assigned courses and monitor
                their engagement and follow-up needs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshFacilitatorStudents()}
              disabled={facilitatorStudentsFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={
                  facilitatorStudentsFetching ? "animate-spin" : ""
                }
              />
              {facilitatorStudentsFetching ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          <section
            aria-label="Student summary"
            className="mt-8 grid gap-5 sm:grid-cols-3"
          >
            <SummaryCard
              label="Students"
              value={studentCount}
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Engagement Records"
              value={totalEngagementRecords}
              icon={ClipboardCheck}
              tone="green"
            />

            <SummaryCard
              label="Open Follow-Ups"
              value={totalFollowUps}
              icon={AlertCircle}
              tone={totalFollowUps > 0 ? "red" : "amber"}
            />
          </section>

          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block max-w-xl">
              <span className="text-sm font-semibold text-slate-700">
                Filter by course
              </span>

              <select
                value={learningExperienceId}
                onChange={(event) =>
                  setLearningExperienceId(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All assigned courses</option>

                {facilitatorExperiences.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title || "Untitled course"}
                  </option>
                ))}
              </select>
            </label>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Each card shows a student’s engagement for one course.
              A student taking several assigned courses can appear
              on more than one card.
            </p>
          </section>

          <section className="mt-6" aria-label="Students by course">
            {facilitatorStudents.length > 0 ? (
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {facilitatorStudents.map((student) => (
                  <StudentCard
                    key={student.enrollment_id}
                    student={student}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <BookOpen
                  size={30}
                  aria-hidden="true"
                  className="mx-auto text-blue-700"
                />
                <h2 className="mt-4 text-xl font-bold text-slate-950">
                  No assigned students
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-slate-600">
                  Students enrolled in your assigned courses will
                  appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </FacilitatorLayout>
  );
}

function StudentCard({ student }) {
  const latest = student.latest_engagement;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ProfilePhoto student={student} />

          <div className="min-w-0 flex-1">
            <h2 className="break-words text-lg font-bold text-slate-950">
              {student.full_name || "Student"}
            </h2>

            {student.student_number && (
              <p className="mt-1 text-sm font-semibold text-blue-700">
                {student.student_number}
              </p>
            )}

            <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
              <Mail
                size={15}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              <span className="break-all">
                {student.email || "Email not provided"}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Course
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {student.experience_title || "Untitled course"}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SmallStat
            label="Engagements"
            value={student.engagement_record_count}
          />

          <SmallStat
            label="Follow-Ups"
            value={student.follow_up_count}
            warning={Number(student.follow_up_count || 0) > 0}
          />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Latest Engagement
        </p>

        {latest ? (
          <div className="mt-3 space-y-2 text-sm">
            <p className="font-semibold text-slate-900">
              {latest.session_title || "Recorded engagement"}
            </p>

            <p className="text-slate-600">
              Attendance:{" "}
              <span className="font-semibold">
                {formatLabel(latest.attendance_status)}
              </span>
            </p>

            <p className="text-slate-600">
              Engagement:{" "}
              <span className="font-semibold">
                {formatLabel(latest.engagement_level)}
              </span>
            </p>

            {latest.follow_up_required && (
              <p className="font-semibold text-red-700">
                Follow-up required
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            No engagement has been recorded.
          </p>
        )}
      </div>
    </article>
  );
}

function ProfilePhoto({ student }) {
  if (student.profile_photo_url) {
    return (
      <img
        src={student.profile_photo_url}
        alt={`${student.full_name || "Student"} profile`}
        className="h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow"
      />
    );
  }

  const initials = String(student.full_name || "Student")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
      {initials}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
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

        <div className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon size={23} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

function SmallStat({ label, value, warning = false }) {
  return (
    <div
      className={`rounded-lg p-3 ${
        warning ? "bg-red-50" : "bg-slate-50"
      }`}
    >
      <p
        className={`text-xl font-bold ${
          warning ? "text-red-700" : "text-slate-950"
        }`}
      >
        {Number(value) || 0}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

function PageMessage({ message, error = false }) {
  return (
    <main className="p-5 md:p-8">
      <div
        role={error ? "alert" : "status"}
        className={`mx-auto max-w-3xl rounded-xl border px-5 py-10 text-center ${
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
  return String(value || "Not recorded")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}