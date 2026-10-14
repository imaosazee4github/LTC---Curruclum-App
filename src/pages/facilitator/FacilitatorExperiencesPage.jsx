import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";

import { useFacilitatorDashboard } from "../../hooks/useFacilitatorDashboard";
import FacilitatorLayout from "../../layouts/FacilitatorLayout";

export default function FacilitatorExperiencesPage() {
  const {
    facilitatorDashboard,
    facilitatorDashboardLoading,
    facilitatorDashboardFetching,
    facilitatorDashboardError,
    refreshFacilitatorDashboard,
  } = useFacilitatorDashboard();

  if (facilitatorDashboardLoading) {
    return (
      <FacilitatorLayout>
        <PageMessage message="Loading your learning experiences..." />
      </FacilitatorLayout>
    );
  }

  if (
    facilitatorDashboardError ||
    !facilitatorDashboard
  ) {
    return (
      <FacilitatorLayout>
        <PageMessage
          error
          message={
            facilitatorDashboardError?.message ||
            "Your learning experiences could not be loaded."
          }
        />
      </FacilitatorLayout>
    );
  }

  const experiences =
    facilitatorDashboard.experiences || [];

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
                My Learning Experiences
              </h1>

              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                Review your assigned learning experiences, students,
                sessions, resources, activities and follow-up needs.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshFacilitatorDashboard()
              }
              disabled={
                facilitatorDashboardFetching
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  facilitatorDashboardFetching
                    ? "animate-spin"
                    : ""
                }
              />

              {facilitatorDashboardFetching
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Experiences"
              value={experiences.length}
              icon={BookOpen}
              tone="blue"
            />

            <SummaryCard
              label="Students"
              value={sumField(
                experiences,
                "student_count",
              )}
              icon={Users}
              tone="purple"
            />

            <SummaryCard
              label="Sessions"
              value={sumField(
                experiences,
                "session_count",
              )}
              icon={CalendarDays}
              tone="green"
            />

            <SummaryCard
              label="Follow-Ups"
              value={sumField(
                experiences,
                "open_follow_up_count",
              )}
              icon={ClipboardList}
              tone="amber"
            />
          </section>

          <section className="mt-8">
            {experiences.length > 0 ? (
              <div className="grid gap-6 xl:grid-cols-2">
                {experiences.map(
                  (experience) => (
                    <ExperienceCard
                      key={
                        experience.assignment_id
                      }
                      experience={experience}
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </main>
    </FacilitatorLayout>
  );
}

function ExperienceCard({
  experience,
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
              {experience.code ||
                "Learning Experience"}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {experience.title}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {formatLabel(
                experience.assignment_role,
              )}
            </p>
          </div>

          <StatusBadge
            status={experience.status}
          />
        </div>

        {experience.description ? (
          <p className="mt-4 leading-7 text-slate-600">
            {experience.description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <Detail
          icon={CalendarDays}
          label="Dates"
          value={formatDateRange(
            experience.start_date,
            experience.end_date,
          )}
        />

        <Detail
          icon={MapPin}
          label="Location"
          value={
            experience.location ||
            "Not specified"
          }
        />

        <Detail
          icon={BookOpen}
          label="Delivery"
          value={formatLabel(
            experience.delivery_mode,
          )}
        />

        <Detail
          icon={Users}
          label="Students"
          value={
            experience.student_count || 0
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-4">
        <ExperienceStat
          label="Sessions"
          value={
            experience.session_count || 0
          }
        />

        <ExperienceStat
          label="Resources"
          value={
            experience.resource_count || 0
          }
        />

        <ExperienceStat
          label="Activities"
          value={
            experience.activity_count || 0
          }
        />

        <ExperienceStat
          label="Follow-Ups"
          value={
            experience
              .open_follow_up_count || 0
          }
        />
      </div>
    </article>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
      <Icon
        size={19}
        className="mt-0.5 shrink-0 text-blue-700"
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function ExperienceStat({
  label,
  value,
}) {
  return (
    <div className="bg-white p-4 text-center">
      <p className="text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}) {
  const tones = {
    blue: "bg-blue-100 text-blue-700",
    purple:
      "bg-purple-100 text-purple-700",
    green:
      "bg-emerald-100 text-emerald-700",
    amber:
      "bg-amber-100 text-amber-700",
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

        <div
          className={`rounded-xl p-3 ${tones[tone]}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}) {
  const normalized =
    status || "unknown";

  const tone =
    normalized === "active"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "planned"
        ? "bg-blue-100 text-blue-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${tone}`}
    >
      {formatLabel(normalized)}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        <FileText size={26} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-950">
        No assigned learning experiences
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-slate-600">
        Learning experiences assigned to you by the
        administrator will appear here.
      </p>
    </div>
  );
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="p-5 md:p-8">
      <div
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

function sumField(
  items,
  field,
) {
  return items.reduce(
    (total, item) =>
      total + Number(item[field] || 0),
    0,
  );
}

function formatLabel(value) {
  if (!value) {
    return "Not specified";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDateRange(
  startDate,
  endDate,
) {
  if (!startDate && !endDate) {
    return "Dates not specified";
  }

  if (!endDate) {
    return startDate;
  }

  if (!startDate) {
    return endDate;
  }

  return `${startDate} – ${endDate}`;
}