import { Link } from "react-router-dom";

import PublicFooter from "../../components/layout/PublicFooter";
import PublicHeader from "../../components/layout/PublicHeader";

const DEVELOPMENT_AREAS = [
  {
    number: "01",
    title: "Spiritual Development",
    description:
      "Support devotional participation, reflection, application and appropriate follow-up.",
  },
  {
    number: "02",
    title: "Character Development",
    description:
      "Develop integrity, accountability, discipline, respect and dependable conduct.",
  },
  {
    number: "03",
    title: "Learning & Competency",
    description:
      "Track classroom instruction, practical learning, assignments and competency evidence.",
  },
  {
    number: "04",
    title: "Work & Responsibility",
    description:
      "Record campus service, practical responsibilities, work quality and increasing responsibility.",
  },
  {
    number: "05",
    title: "Social & Community",
    description:
      "Encourage teamwork, collaboration, communication, service and community participation.",
  },
  {
    number: "06",
    title: "Personal Readiness",
    description:
      "Help students develop habits and capabilities that support future education, work and service.",
  },
];

const PROCESS_STEPS = [
  {
    number: "1",
    title: "Participate",
    description:
      "Students take part in scheduled learning, coaching, devotional, practical and service activities.",
  },
  {
    number: "2",
    title: "Record",
    description:
      "Authorized educators document what was delivered, participation, evidence and observations.",
  },
  {
    number: "3",
    title: "Reflect",
    description:
      "Students and educators identify learning, growth, challenges and areas needing support.",
  },
  {
    number: "4",
    title: "Follow Up",
    description:
      "Mentors and administrators coordinate the appropriate next activity, support or intervention.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <PublicHeader />

      <main>
        <HeroSection />

        <ProgrammeSection />

        <DevelopmentSection />

        <HowItWorksSection />

        <TrackingSection />

        <CallToActionSection />
      </main>

      <PublicFooter />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-28">
        <div>
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            LTC Pioneer Programme
          </span>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-blue-950 sm:text-5xl lg:text-6xl">
            Supporting every student’s
            journey toward learning, growth
            and readiness.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A secure student tracking system
            that connects learning activities,
            mentoring, reflection, spiritual
            formation and meaningful
            follow-up across the LTC Pioneer
            experience.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="rounded-lg bg-blue-950 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-900"
            >
              Sign In to the Portal
            </Link>

            <a
              href="#programme"
              className="rounded-lg border border-blue-900 px-6 py-3 text-center font-semibold text-blue-950 transition hover:bg-blue-50"
            >
              Explore the Programme
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
            <HeroStat
              value="Daily"
              label="Learning records"
            />

            <HeroStat
              value="Ongoing"
              label="Mentor follow-up"
            />

            <HeroStat
              value="Holistic"
              label="Student development"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-blue-950/10 md:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-600">
            One connected record
          </p>

          <h2 className="mt-3 text-2xl font-bold text-blue-950">
            From daily participation to
            meaningful student support
          </h2>

          <div className="mt-7 space-y-4">
            <FeatureItem
              title="Learning activities"
              description="Record what was planned, delivered and completed."
            />

            <FeatureItem
              title="Student participation"
              description="Document attendance, engagement, teamwork and support needs."
            />

            <FeatureItem
              title="Reflection and evidence"
              description="Preserve learning evidence and student reflection."
            />

            <FeatureItem
              title="Coordinated follow-up"
              description="Help mentors and educators respond to emerging needs."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgrammeSection() {
  return (
    <section
      id="programme"
      className="scroll-mt-24 bg-white py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <SectionLabel>
            Pioneer Programme
          </SectionLabel>

          <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
            A complete view of the student
            learning experience
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            The portal records the learning
            experiences that take place while
            helping authorized educators,
            mentors and administrators
            coordinate student support.
          </p>

          <p className="mt-4 leading-8 text-slate-600">
            It does not reduce student growth
            to one score. It provides
            structured evidence that helps LTC
            understand participation,
            development, challenges and
            readiness.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InformationCard
            title="Daily Activities"
            description="Instruction, discussion, coaching, practical work and campus service."
          />

          <InformationCard
            title="Devotional Formation"
            description="Experience, participation, reflection, application and follow-up."
          />

          <InformationCard
            title="Mentoring"
            description="Student check-ins, case notes, support needs and agreed actions."
          />

          <InformationCard
            title="Readiness"
            description="Development indicators supported by evidence and professional judgment."
          />
        </div>
      </div>
    </section>
  );
}

function DevelopmentSection() {
  return (
    <section
      id="development"
      className="scroll-mt-24 bg-slate-50 py-20"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <SectionLabel>
            Whole-Student Development
          </SectionLabel>

          <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
            Six connected areas of student
            growth
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            Each area contributes to a fuller
            understanding of the student’s
            development without replacing
            professional observation,
            mentoring or assessment.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {DEVELOPMENT_AREAS.map(
            (area) => (
              <article
                key={area.number}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-sm font-bold text-amber-600">
                  {area.number}
                </span>

                <h3 className="mt-3 text-xl font-bold text-blue-950">
                  {area.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {area.description}
                </p>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>
            How It Works
          </SectionLabel>

          <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
            A clear cycle of participation,
            evidence and follow-up
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step) => (
            <article
              key={step.number}
              className="relative rounded-xl border border-slate-200 bg-slate-50 p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-950 font-bold text-white">
                {step.number}
              </div>

              <h3 className="mt-5 text-xl font-bold text-blue-950">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrackingSection() {
  return (
    <section className="bg-blue-950 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-2 lg:px-8">
        <TrackingCard
          label="Daily Learning"
          title="Daily Learning Activity Reports"
          description="Educators record what was planned, what happened, student participation, evidence produced, challenges and the recommended next activity."
          items={[
            "Instruction and facilitated learning",
            "Coaching and practical experiences",
            "Participation and engagement",
            "Evidence and follow-up needs",
          ]}
        />

        <TrackingCard
          label="Spiritual Formation"
          title="Devotional Records"
          description="Devotional experiences are documented descriptively through participation, reflection, application and appropriate follow-up—not through a spiritual score."
          items={[
            "Topics, themes and scriptures",
            "Attendance and responsibilities",
            "Student reflection",
            "Application and follow-up",
          ]}
        />
      </div>
    </section>
  );
}

function CallToActionSection() {
  return (
    <section className="bg-amber-50 py-20">
      <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
        <SectionLabel>
          LTC Pioneer Portal
        </SectionLabel>

        <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
          Continue your learning and
          development journey
        </h2>

        <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
          Sign in to view your schedule,
          learning records, reflections,
          development indicators and assigned
          support.
        </p>

        <Link
          to="/login"
          className="mt-8 inline-flex rounded-lg bg-blue-950 px-7 py-3 font-semibold text-white transition hover:bg-blue-900"
        >
          Access the Portal
        </Link>
      </div>
    </section>
  );
}

function HeroStat({ value, label }) {
  return (
    <div className="rounded-lg border border-white/80 bg-white/70 p-4">
      <p className="font-bold text-blue-950">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-600">
        {label}
      </p>
    </div>
  );
}

function FeatureItem({
  title,
  description,
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
        ✓
      </div>

      <div>
        <h3 className="font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function InformationCard({
  title,
  description,
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="font-bold text-blue-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function TrackingCard({
  label,
  title,
  description,
  items,
}) {
  return (
    <article className="rounded-2xl border border-blue-800 bg-blue-900/70 p-7 md:p-8">
      <p className="text-sm font-bold uppercase tracking-wider text-amber-300">
        {label}
      </p>

      <h2 className="mt-3 text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-blue-100">
        {description}
      </p>

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-blue-50"
          >
            <span className="text-amber-300">
              •
            </span>

            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-sm font-bold uppercase tracking-wider text-amber-600">
      {children}
    </p>
  );
}