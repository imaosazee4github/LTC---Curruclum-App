import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  RefreshCw,
  Search,
  UserRoundCheck,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useFacilitatorOversight,
} from "../../hooks/useFacilitatorOversight";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";

export default function FacilitatorOversightPage() {
  const {
    facilitatorSummary,
    facilitators,
    learningExperiences,
    engagementRecords,
    facilitatorFollowUps,
    facilitatorOversightLoading,
    facilitatorOversightFetching,
    facilitatorOversightError,
    refreshFacilitatorOversight,
  } = useFacilitatorOversight();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [activeSection, setActiveSection] =
    useState("experiences");

  const search =
    searchTerm.trim().toLowerCase();

  const filteredFacilitators =
    useMemo(() => {
      if (!search) {
        return facilitators;
      }

      return facilitators.filter(
        (facilitator) =>
          createSearchText([
            facilitator.full_name,
            facilitator.email,
            facilitator.staff_number,
            facilitator.job_title,
            facilitator.specialization,
          ]).includes(search),
      );
    }, [facilitators, search]);

  const filteredExperiences =
    useMemo(() => {
      if (!search) {
        return learningExperiences;
      }

      return learningExperiences.filter(
        (experience) =>
          createSearchText([
            experience.code,
            experience.title,
            experience.description,
            experience.mode,
            experience.location,
            experience.status,
            experience.cohort_name,
            experience.cohort_code,
          ]).includes(search),
      );
    }, [learningExperiences, search]);

  const filteredEngagementRecords =
    useMemo(() => {
      if (!search) {
        return engagementRecords;
      }

      return engagementRecords.filter(
        (record) =>
          createSearchText([
            record.student?.full_name,
            record.student?.email,
            record.student?.student_number,
            record.experience?.title,
            record.experience?.code,
            record.session?.title,
            record.attendance_status,
            record.observations,
            record.concern,
            record.support_required,
          ]).includes(search),
      );
    }, [engagementRecords, search]);

  const filteredFollowUps =
    useMemo(() => {
      if (!search) {
        return facilitatorFollowUps;
      }

      return facilitatorFollowUps.filter(
        (followUp) =>
          createSearchText([
            followUp.student?.full_name,
            followUp.student?.email,
            followUp.student?.student_number,
            followUp.experience?.title,
            followUp.experience?.code,
            followUp.session?.title,
            followUp.concern,
            followUp.support_required,
            followUp.action_required,
            followUp.outcome,
            followUp.status,
          ]).includes(search),
      );
    }, [facilitatorFollowUps, search]);

  if (facilitatorOversightLoading) {
    return (
      <SuperAdminLayout>
        <PageMessage message="Loading facilitator oversight..." />
      </SuperAdminLayout>
    );
  }

  if (
    facilitatorOversightError ||
    !facilitatorSummary
  ) {
    return (
      <SuperAdminLayout>
        <PageMessage
          error
          message={
            facilitatorOversightError
              ?.message ||
            "Facilitator oversight data could not be loaded."
          }
        />
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Programme Oversight
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">
                Facilitator Oversight
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Inspect learning experiences,
                facilitator assignments, student
                engagement and required follow-up
                actions.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshFacilitatorOversight()
              }
              disabled={
                facilitatorOversightFetching
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  facilitatorOversightFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <SummaryCard
              label="Facilitators"
              value={
                facilitatorSummary
                  .totalFacilitators
              }
              icon={Users}
              tone="blue"
            />

            <SummaryCard
              label="Active Experiences"
              value={
                facilitatorSummary
                  .activeExperiences
              }
              icon={BookOpen}
              tone="green"
            />

            <SummaryCard
              label="Active Students"
              value={
                facilitatorSummary
                  .activeStudents
              }
              icon={UserRoundCheck}
              tone="purple"
            />

            <SummaryCard
              label="Scheduled Sessions"
              value={
                facilitatorSummary
                  .scheduledSessions
              }
              icon={CalendarDays}
              tone="amber"
            />

            <SummaryCard
              label="Completed Sessions"
              value={
                facilitatorSummary
                  .completedSessions
              }
              icon={CheckCircle2}
              tone="green"
            />

            <SummaryCard
              label="Engagement Recorded"
              value={
                facilitatorSummary
                  .engagementRecorded
              }
              icon={Activity}
              tone="blue"
            />

            <SummaryCard
              label="Engagement Pending"
              value={
                facilitatorSummary
                  .engagementPending
              }
              icon={Clock3}
              tone="amber"
            />

            <SummaryCard
              label="Follow-Ups Required"
              value={
                facilitatorSummary
                  .followUpsRequired
              }
              icon={ClipboardList}
              tone="purple"
            />

            <SummaryCard
              label="Open Follow-Ups"
              value={
                facilitatorSummary
                  .openFollowUps
              }
              icon={AlertTriangle}
              tone="red"
            />

            <SummaryCard
              label="Overdue Follow-Ups"
              value={
                facilitatorSummary
                  .overdueFollowUps
              }
              icon={AlertTriangle}
              tone="red"
            />
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <SectionButton
                  active={
                    activeSection ===
                    "experiences"
                  }
                  label="Learning Experiences"
                  count={
                    learningExperiences.length
                  }
                  onClick={() =>
                    setActiveSection(
                      "experiences",
                    )
                  }
                />

                <SectionButton
                  active={
                    activeSection ===
                    "facilitators"
                  }
                  label="Facilitators"
                  count={facilitators.length}
                  onClick={() =>
                    setActiveSection(
                      "facilitators",
                    )
                  }
                />

                <SectionButton
                  active={
                    activeSection ===
                    "engagement"
                  }
                  label="Engagement"
                  count={
                    engagementRecords.length
                  }
                  onClick={() =>
                    setActiveSection(
                      "engagement",
                    )
                  }
                />

                <SectionButton
                  active={
                    activeSection ===
                    "follow-ups"
                  }
                  label="Follow-Ups"
                  count={
                    facilitatorFollowUps.length
                  }
                  onClick={() =>
                    setActiveSection(
                      "follow-ups",
                    )
                  }
                />
              </div>

              <label className="relative block w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  placeholder="Search oversight records"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </section>

          {activeSection ===
          "experiences" ? (
            <ExperiencesSection
              experiences={
                filteredExperiences
              }
            />
          ) : null}

          {activeSection ===
          "facilitators" ? (
            <FacilitatorsSection
              facilitators={
                filteredFacilitators
              }
            />
          ) : null}

          {activeSection ===
          "engagement" ? (
            <EngagementSection
              records={
                filteredEngagementRecords
              }
            />
          ) : null}

          {activeSection ===
          "follow-ups" ? (
            <FollowUpsSection
              followUps={
                filteredFollowUps
              }
            />
          ) : null}
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function ExperiencesSection({
  experiences,
}) {
  if (!experiences.length) {
    return (
      <EmptyState message="No learning experiences match the current search." />
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {experiences.map((experience) => {
        const facilitators =
          arrayValue(
            experience.facilitators,
          );

        const students =
          arrayValue(experience.students);

        const sessions =
          arrayValue(experience.sessions);

        const activities =
          arrayValue(experience.activities);

        const resources =
          arrayValue(experience.resources);

        return (
          <article
            key={
              experience.experience_id ||
              experience.id
            }
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-950">
                    {experience.title ||
                      "Learning Experience"}
                  </h2>

                  <StatusBadge
                    status={
                      experience.status
                    }
                  />
                </div>

                <p className="mt-1 text-sm font-semibold text-blue-800">
                  {experience.code ||
                    "No experience code"}
                </p>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  {experience.description ||
                    "No description has been provided."}
                </p>
              </div>

              <div className="text-sm text-slate-600 lg:text-right">
                <p>
                  {formatDate(
                    experience.start_date,
                  )}
                  {experience.end_date
                    ? ` – ${formatDate(
                        experience.end_date,
                      )}`
                    : ""}
                </p>

                <p className="mt-1">
                  {experience.location ||
                    experience.mode ||
                    "Location not specified"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
              <CountCard
                label="Facilitators"
                value={facilitators.length}
              />

              <CountCard
                label="Students"
                value={students.length}
              />

              <CountCard
                label="Sessions"
                value={sessions.length}
              />

              <CountCard
                label="Activities"
                value={activities.length}
              />

              <CountCard
                label="Resources"
                value={resources.length}
              />
            </div>

            <details className="border-t border-slate-200">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-blue-950">
                Inspect experience details
              </summary>

              <div className="grid gap-5 border-t border-slate-100 bg-slate-50 p-5 lg:grid-cols-2">
                <DetailList
                  title="Assigned Facilitators"
                  emptyMessage="No facilitators assigned."
                  items={facilitators.map(
                    (facilitator) => ({
                      key:
                        facilitator.staff_profile_id ||
                        facilitator.profile_id,
                      title:
                        facilitator.full_name ||
                        facilitator.email ||
                        "Unnamed facilitator",
                      detail: formatLabel(
                        facilitator.assignment_role,
                      ),
                    }),
                  )}
                />

                <DetailList
                  title="Enrolled Students"
                  emptyMessage="No students enrolled."
                  items={students.map(
                    (student) => ({
                      key:
                        student.student_profile_id ||
                        student.profile_id,
                      title:
                        student.full_name ||
                        student.email ||
                        "Unnamed student",
                      detail:
                        student.student_number ||
                        formatLabel(
                          student.status,
                        ),
                    }),
                  )}
                />

                <DetailList
                  title="Sessions"
                  emptyMessage="No sessions scheduled."
                  items={sessions.map(
                    (session) => ({
                      key:
                        session.session_id ||
                        session.id,
                      title:
                        session.title ||
                        session.topic ||
                        "Session",
                      detail: [
                        formatDate(
                          session.session_date,
                        ),
                        formatTimeRange(
                          session.start_time,
                          session.end_time,
                        ),
                        formatLabel(
                          session.status,
                        ),
                      ]
                        .filter(Boolean)
                        .join(" • "),
                    }),
                  )}
                />

                <DetailList
                  title="Activities and Resources"
                  emptyMessage="No activities or resources."
                  items={[
                    ...activities.map(
                      (activity) => ({
                        key:
                          activity.activity_id ||
                          activity.id,
                        title:
                          activity.title ||
                          "Activity",
                        detail: formatLabel(
                          activity.activity_type,
                        ),
                      }),
                    ),
                    ...resources.map(
                      (resource) => ({
                        key:
                          resource.resource_id ||
                          resource.id,
                        title:
                          resource.title ||
                          "Resource",
                        detail: formatLabel(
                          resource.resource_type,
                        ),
                      }),
                    ),
                  ]}
                />
              </div>
            </details>
          </article>
        );
      })}
    </section>
  );
}

function FacilitatorsSection({
  facilitators,
}) {
  if (!facilitators.length) {
    return (
      <EmptyState message="No facilitators match the current search." />
    );
  }

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {facilitators.map(
        (facilitator) => (
          <article
            key={
              facilitator.staff_profile_id ||
              facilitator.profile_id
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <ProfileAvatar
                person={facilitator}
              />

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-950">
                  {facilitator.full_name ||
                    "Unnamed facilitator"}
                </h2>

                <p className="truncate text-sm text-slate-600">
                  {facilitator.email ||
                    "No email"}
                </p>

                <p className="mt-2 text-sm font-semibold text-blue-800">
                  {facilitator.staff_number ||
                    "No staff number"}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
              <DetailRow
                label="Job title"
                value={
                  facilitator.job_title ||
                  "Not provided"
                }
              />

              <DetailRow
                label="Specialization"
                value={
                  facilitator.specialization ||
                  "Not provided"
                }
              />

              <DetailRow
                label="Experiences"
                value={
                  facilitator
                    .active_experience_count ??
                  facilitator
                    .experience_count ??
                  0
                }
              />

              <DetailRow
                label="Sessions"
                value={
                  facilitator.session_count ??
                  0
                }
              />
            </dl>
          </article>
        ),
      )}
    </section>
  );
}

function EngagementSection({
  records,
}) {
  if (!records.length) {
    return (
      <EmptyState message="No engagement records match the current search." />
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {records.map((record) => (
        <article
          key={
            record.engagement_record_id ||
            record.id
          }
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {record.student?.full_name ||
                  "Unnamed student"}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {record.experience?.title ||
                  "Learning experience"}
                {record.session?.title
                  ? ` • ${record.session.title}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                status={
                  record.attendance_status
                }
              />

              {record.follow_up_required ? (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                  Follow-up required
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <RatingCard
              label="Preparation"
              value={record.preparation}
            />

            <RatingCard
              label="Participation"
              value={record.participation}
            />

            <RatingCard
              label="Engagement"
              value={record.engagement}
            />

            <RatingCard
              label="Contribution"
              value={record.contribution}
            />
          </div>

          {record.observations ||
          record.concern ||
          record.support_required ? (
            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-3">
              <TextDetail
                label="Observations"
                value={record.observations}
              />

              <TextDetail
                label="Concern"
                value={record.concern}
              />

              <TextDetail
                label="Support Required"
                value={
                  record.support_required
                }
              />
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function FollowUpsSection({
  followUps,
}) {
  if (!followUps.length) {
    return (
      <EmptyState message="No facilitator follow-ups match the current search." />
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {followUps.map((followUp) => (
        <article
          key={
            followUp.follow_up_id ||
            followUp.id
          }
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {followUp.student?.full_name ||
                  "Unnamed student"}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {followUp.experience?.title ||
                  "Learning experience"}
                {followUp.session?.title
                  ? ` • ${followUp.session.title}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                status={followUp.status}
              />

              {followUp.due_date ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Due{" "}
                  {formatDate(
                    followUp.due_date,
                  )}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextDetail
              label="Concern"
              value={followUp.concern}
            />

            <TextDetail
              label="Support Required"
              value={
                followUp.support_required
              }
            />

            <TextDetail
              label="Action Required"
              value={
                followUp.action_required
              }
            />

            <TextDetail
              label="Outcome"
              value={followUp.outcome}
            />
          </div>
        </article>
      ))}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}) {
  const tones = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    purple: "bg-violet-100 text-violet-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          tones[tone] || tones.blue
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-600">
        {label}
      </p>
    </article>
  );
}

function SectionButton({
  active,
  label,
  count,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-blue-950 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label} ({count})
    </button>
  );
}

function CountCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-600">
        {label}
      </p>
    </div>
  );
}

function DetailList({
  title,
  items,
  emptyMessage,
}) {
  return (
    <div>
      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      {items.length ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <p className="font-semibold text-slate-900">
                {item.title}
              </p>

              {item.detail ? (
                <p className="mt-1 text-sm text-slate-500">
                  {item.detail}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

function RatingCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-900">
        {formatLabel(
          value || "not_observed",
        )}
      </p>
    </div>
  );
}

function TextDetail({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">
        {label}
      </dt>

      <dd className="text-right font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function ProfileAvatar({
  person,
}) {
  if (person.profile_photo_url) {
    return (
      <img
        src={person.profile_photo_url}
        alt={`${
          person.full_name ||
          "Facilitator"
        } profile`}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">
      {getInitials(
        person.full_name ||
          person.email,
      )}
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const value =
    status || "unknown";

  const color =
    value === "active" ||
    value === "completed" ||
    value === "present"
      ? "bg-emerald-100 text-emerald-800"
      : value === "planned" ||
          value === "scheduled" ||
          value === "in_progress" ||
          value === "late"
        ? "bg-amber-100 text-amber-800"
        : value === "cancelled" ||
            value === "inactive" ||
            value === "absent"
          ? "bg-red-100 text-red-800"
          : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {formatLabel(value)}
    </span>
  );
}

function EmptyState({
  message,
}) {
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <ClipboardList className="mx-auto h-10 w-10 text-slate-400" />

      <p className="mt-4 font-semibold text-slate-700">
        {message}
      </p>
    </section>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
        className={`mx-auto max-w-4xl rounded-2xl border p-8 text-center ${
          error
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        {message}
      </div>
    </main>
  );
}

function arrayValue(value) {
  return Array.isArray(value)
    ? value
    : [];
}

function createSearchText(values) {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(value) {
  if (!value) {
    return "Date not provided";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatTimeRange(
  startTime,
  endTime,
) {
  if (!startTime && !endTime) {
    return "";
  }

  return [startTime, endTime]
    .filter(Boolean)
    .map((time) =>
      String(time).slice(0, 5),
    )
    .join(" – ");
}

function getInitials(value) {
  return String(value || "FA")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .toUpperCase();
}