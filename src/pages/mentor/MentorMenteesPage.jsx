import {
  ClipboardPlus,
  Eye,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import AdvisoryCheckinModal from "../../components/common/AdvisoryCheckinModal";
import AdvisoryReportHistoryModal from "../../components/common/AdvisoryReportHistoryModal";
import { useMentorDashboard } from "../../hooks/useMentorDashboard";
import MentoringLayout from "../../layouts/MentoringLayout";

export default function MentorMenteesPage() {
  const {
    mentorDashboard,
    mentorDashboardLoading,
    mentorDashboardFetching,
    mentorDashboardError,
    refreshMentorDashboard,
  } = useMentorDashboard();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const students = mentorDashboard?.mentees || [];
  const couple = mentorDashboard?.advisoryCouple;

  const coupleStudents = couple
    ? students.filter(
        (student) => student.advisory_couple_id === couple.id,
      )
    : [];

  const individualStudents = students.filter(
    (student) => !student.advisory_couple_id,
  );

  const remaining = couple
    ? Math.max(couple.maxActiveStudents - coupleStudents.length, 0)
    : 0;

  function openCheckin(student) {
    setSuccessMessage("");
    setHistoryStudent(null);
    setSelectedStudent(student);
  }

  function openHistory(student) {
    setSelectedStudent(null);
    setHistoryStudent(student);
  }

  function handleSuccess(result) {
    setSelectedStudent(null);
    setSuccessMessage(
      result?.message || "Your advisory update was submitted.",
    );
  }

  return (
    <MentoringLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-7">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Student Development
              </p>

              <h1 className="mt-2 text-3xl font-bold text-blue-950">
                My Students
              </h1>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Support your assigned students, record weekly
                conversations and read submitted reports with
                Advisory Department review notes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refreshMentorDashboard()}
              disabled={mentorDashboardFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={
                  mentorDashboardFetching ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          </header>

          {successMessage && (
            <Message success>{successMessage}</Message>
          )}

          {mentorDashboardLoading && !mentorDashboard ? (
            <Message>Loading your assigned students...</Message>
          ) : !mentorDashboard ? (
            <Message error>
              {mentorDashboardError?.message ||
                "Your assigned students could not be loaded."}
            </Message>
          ) : (
            <>
              {mentorDashboardError && (
                <Message error>
                  Refresh failed. Previously loaded information is
                  shown. Please try Refresh again.
                </Message>
              )}

              {couple ? (
                <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                  <p className="text-sm font-semibold text-blue-700">
                    Your Advisory Couple
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-blue-950">
                    {(couple.members || [])
                      .map((member) => member.full_name)
                      .filter(Boolean)
                      .join(" & ") || couple.displayName}
                  </h2>

                  {couple.displayName && (
                    <p className="mt-2 text-sm text-blue-800">
                      {couple.displayName}
                    </p>
                  )}

                  <p className="mt-3 text-sm leading-6 text-blue-800">
                    Both advisors can record updates and read reports
                    for the couple’s assigned students. Each report
                    identifies who submitted it.
                  </p>
                </section>
              ) : (
                <Message>
                  You are not currently part of an active advisory
                  couple. Contact the Advisory Department to arrange
                  pairing.
                </Message>
              )}

              <section className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                  label="Couple Students"
                  value={
                    couple
                      ? `${coupleStudents.length}/${couple.maxActiveStudents}`
                      : "Not paired"
                  }
                  detail="Shared assignments for both advisors"
                />

                <SummaryCard
                  label="Couple Spaces Available"
                  value={couple ? remaining : "—"}
                  detail={
                    couple
                      ? "Students are assigned by the Advisory Department"
                      : "A couple must be created before assigning students"
                  }
                />

                <SummaryCard
                  label="Earlier Individual Assignments"
                  value={individualStudents.length}
                  detail="Retained separately from the couple’s capacity"
                />
              </section>

              {couple && (
                <StudentSection
                  title="Couple’s Assigned Students"
                  description="Either advisor can record conversations and read reports for these students."
                  students={coupleStudents}
                  onRecord={openCheckin}
                  onViewReports={openHistory}
                />
              )}

              {(individualStudents.length > 0 || !couple) && (
                <StudentSection
                  title="Earlier Individual Assignments"
                  description="Existing assignments remain linked to you until the Advisory Department arranges a transfer."
                  students={individualStudents}
                  onRecord={openCheckin}
                  onViewReports={openHistory}
                />
              )}
            </>
          )}
        </div>
      </main>

      {selectedStudent && (
        <AdvisoryCheckinModal
          key={selectedStudent.assignment_id}
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSuccess={handleSuccess}
        />
      )}

      {historyStudent && (
        <AdvisoryReportHistoryModal
          key={historyStudent.assignment_id}
          student={historyStudent}
          onClose={() => setHistoryStudent(null)}
        />
      )}
    </MentoringLayout>
  );
}

function StudentSection({
  title,
  description,
  students,
  onRecord,
  onViewReports,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-blue-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </header>

      {students.length > 0 ? (
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          {students.map((student) => (
            <StudentCard
              key={student.assignment_id}
              student={student}
              onRecord={() => onRecord(student)}
              onViewReports={() => onViewReports(student)}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-slate-500">
          <UserRound
            size={32}
            aria-hidden="true"
            className="mx-auto mb-3 text-slate-300"
          />
          No students assigned here.
        </div>
      )}
    </section>
  );
}

function StudentCard({ student, onRecord, onViewReports }) {
  const name =
    student.full_name || student.preferred_name || "Student";

  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-4">
        {student.profile_photo_url ? (
          <img
            src={student.profile_photo_url}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900">
            {getInitials(name)}
          </div>
        )}

        <h3 className="text-lg font-bold text-blue-950">{name}</h3>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Detail
          label="Next check-in"
          value={formatDateTime(student.next_check_in_at)}
        />
        <Detail
          label="Open follow-ups"
          value={student.open_follow_ups || 0}
        />
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Latest Update
        </p>

        {student.last_report ? (
          <>
            <p className="mt-2 font-semibold text-slate-800">
              {formatLabel(student.last_report.report_type)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Status: {formatLabel(student.last_report.status)}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            No advisory update recorded yet.
          </p>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={onRecord}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900"
        >
          <ClipboardPlus size={18} aria-hidden="true" />
          Record Check-In / Follow-Up
        </button>

        <button
          type="button"
          onClick={onViewReports}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-950 hover:bg-blue-50"
        >
          <Eye size={18} aria-hidden="true" />
          View Reports
        </button>
      </div>
    </article>
  );
}

function SummaryCard({ label, value, detail }) {
  return (
    <article className="rounded-xl border border-blue-200 bg-blue-50 p-6">
      <p className="font-semibold text-blue-800">{label}</p>
      <p className="mt-4 text-3xl font-bold text-blue-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-blue-800">{detail}</p>
    </article>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-semibold text-slate-800">{value}</p>
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

function getInitials(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

function formatDateTime(value) {
  if (!value) return "Not scheduled";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function formatLabel(value) {
  if (!value) return "Not available";
  if (value === "check_in") return "Check-In";
  if (value === "follow_up") return "Follow-Up";

  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}