import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { useAdvisoryCheckin } from "../../hooks/useAdvisoryCheckin";

import {
  ADVISORY_WEEKLY_GUIDES,
  CORE_CHECKIN_QUESTIONS,
  FOLLOW_UP_QUESTIONS,
  WELLBEING_RATINGS,
  getAdvisoryWeekGuide,
} from "../../data/advisoryCheckinGuide";

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

function getNigeriaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function AdvisoryCheckinModal({ student, onClose, onSuccess }) {
  const dialogRef = useRef(null);

  const { submitCheckin, submittingCheckin, checkinError, resetCheckin } =
    useAdvisoryCheckin();

  const [form, setForm] = useState(() => ({
    reportType: "check_in",
    programmeWeek: "",
    conversationDate: getNigeriaDate(),
    conversationSummary: "",
    wellbeingRating: "",
    supportRecommended: "",
    followUpRequired: "",
    confidentialityLevel: "restricted",
  }));

  const [answers, setAnswers] = useState({});

  const guide = getAdvisoryWeekGuide(form.programmeWeek);
  const followUp = form.reportType === "follow_up";

  const rating = WELLBEING_RATINGS.find(
    (item) => item.value === Number(form.wellbeingRating),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function closeModal() {
    if (!submittingCheckin) onClose();
  }

  function changeForm(event) {
    const { name, value } = event.target;

    resetCheckin();

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function changeAnswer(id, value) {
    resetCheckin();

    setAnswers((current) => ({
      ...current,
      [id]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submittingCheckin) return;

    try {
      const result = await submitCheckin({
        assignmentId: student.assignment_id,
        ...form,
        answers,
      });

      onSuccess(result);
    } catch {
      // The mutation exposes the error below.
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="weekly-advisory-title"
      onCancel={(event) => {
        event.preventDefault();
        closeModal();
      }}
      className="fixed inset-0 m-auto max-h-[92vh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
            Advisory Conversation
          </p>

          <h2
            id="weekly-advisory-title"
            className="mt-2 text-2xl font-bold text-blue-950"
          >
            {student.full_name || student.preferred_name || "Student"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Record the conversation for Advisory Department review.
          </p>
        </div>

        <button
          type="button"
          autoFocus
          onClick={closeModal}
          disabled={submittingCheckin}
          aria-label="Close check-in form"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-60"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="p-6">
        <fieldset disabled={submittingCheckin} className="space-y-7">
          <legend className="text-lg font-bold text-blue-950">
            Conversation Information
          </legend>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Report type">
              <select
                name="reportType"
                value={form.reportType}
                onChange={changeForm}
                required
                className={inputClasses}
              >
                <option value="check_in">Check-In</option>
                <option value="follow_up">Follow-Up</option>
              </select>
            </Field>

            <Field label="Programme week">
              <select
                name="programmeWeek"
                value={form.programmeWeek}
                onChange={changeForm}
                required
                className={inputClasses}
              >
                <option value="">Select a week</option>

                {ADVISORY_WEEKLY_GUIDES.map((item) => (
                  <option key={item.week} value={item.week}>
                    Week {item.week}: {item.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Conversation date">
              <input
                type="date"
                name="conversationDate"
                value={form.conversationDate}
                onChange={changeForm}
                required
                className={inputClasses}
              />
            </Field>

            <Field label="Method">
              <input
                value="In Person"
                readOnly
                className={`${inputClasses} bg-slate-50`}
              />
            </Field>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            Use the GUIDE framework naturally. Select questions relevant to the
            student and allow the conversation to flow. Individual question
            responses are optional.
          </div>

          {guide ? (
            <>
              <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-700">
                  Week {guide.week}
                </p>

                <h3 className="mt-2 text-xl font-bold text-blue-950">
                  {guide.title}
                </h3>

                <p className="mt-2 font-semibold text-blue-900">
                  {guide.theme}
                </p>

                <p className="mt-3 text-sm leading-6 text-blue-800">
                  {guide.objective}
                </p>

                {guide.note && (
                  <p className="mt-3 text-sm font-semibold leading-6 text-blue-900">
                    {guide.note}
                  </p>
                )}

                <details className="mt-4 border-t border-blue-200 pt-4">
                  <summary className="cursor-pointer font-semibold text-blue-950">
                    Advisor guidance
                  </summary>

                  <p className="mt-3 text-sm leading-6 text-blue-800">
                    <strong>Focus: </strong>
                    {guide.advisorFocus}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-blue-800">
                    <strong>Suggested follow-up: </strong>
                    {guide.followUp}
                  </p>
                </details>
              </section>

              {followUp && (
                <QuestionGroup
                  title="Follow-Up Conversation"
                  description="Record progress, support received and unresolved needs."
                  questions={FOLLOW_UP_QUESTIONS}
                  answers={answers}
                  onChange={changeAnswer}
                />
              )}

              <QuestionGroup
                title={`Week ${guide.week} Questions`}
                description="Record only the responses relevant to this conversation."
                questions={guide.questions}
                answers={answers}
                onChange={changeAnswer}
              />

              <details className="rounded-xl border border-slate-200 p-5">
                <summary className="cursor-pointer font-bold text-blue-950">
                  Five Core Questions — available every week
                </summary>

                <div className="mt-5">
                  <QuestionGroup
                    title="Core Questions"
                    questions={CORE_CHECKIN_QUESTIONS}
                    answers={answers}
                    onChange={changeAnswer}
                  />
                </div>
              </details>
            </>
          ) : (
            <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-600">
              Select a programme week to display its questions.
            </p>
          )}

          <section className="space-y-4 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-blue-950">
              Overall Well-Being
            </h3>

            <Field label="Well-being rating — optional">
              <select
                name="wellbeingRating"
                value={form.wellbeingRating}
                onChange={changeForm}
                className={inputClasses}
              >
                <option value="">Not recorded</option>

                {WELLBEING_RATINGS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value} — {item.label}
                  </option>
                ))}
              </select>
            </Field>

            {rating && (
              <p className="text-sm text-slate-600">{rating.description}</p>
            )}

            <p className="text-sm leading-6 text-slate-500">
              The rating is a conversation aid, not a mental health diagnosis.
            </p>
          </section>

          <section className="space-y-5 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-blue-950">
              Summary and Next Steps
            </h3>

            <Field label="Brief conversation summary *">
              <textarea
                name="conversationSummary"
                value={form.conversationSummary}
                onChange={changeForm}
                required
                rows={4}
                maxLength={10000}
                placeholder={
                  followUp
                    ? "Summarize the earlier concern, progress made and any unresolved needs."
                    : "Summarize the relevant conversation, support needs and agreed next steps."
                }
                className={inputClasses}
              />
            </Field>

            <Field label="Support recommended — optional">
              <textarea
                name="supportRecommended"
                value={form.supportRecommended}
                onChange={changeForm}
                rows={3}
                maxLength={3000}
                placeholder="Record relevant support or the appropriate person or department to contact."
                className={inputClasses}
              />
            </Field>

            <Field label="Follow-up actions — optional">
              <textarea
                name="followUpRequired"
                value={form.followUpRequired}
                onChange={changeForm}
                rows={3}
                maxLength={3000}
                placeholder="Record agreed actions, who will act and when to follow up."
                className={inputClasses}
              />
            </Field>

            <p className="text-xs leading-5 text-slate-500">
              These notes document intended actions. They do not yet create or
              send a referral to another department.
            </p>

            <div className="space-y-3">
              <Field label="Confidentiality — how sensitive is this update?">
                <select
                  name="confidentialityLevel"
                  value={form.confidentialityLevel}
                  onChange={changeForm}
                  required
                  aria-describedby="confidentiality-help"
                  className={inputClasses}
                >
                  <option value="standard">
                    Standard — general progress and everyday updates
                  </option>

                  <option value="restricted">
                    Restricted — personal concerns needing careful handling
                  </option>

                  <option value="highly_restricted">
                    Highly Restricted — particularly sensitive information
                  </option>
                </select>
              </Field>

              <div
                id="confidentiality-help"
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              >
                <p className="font-semibold text-slate-800">
                  Choose the sensitivity of the information recorded.
                </p>

                <ul className="mt-2 list-disc space-y-2 pl-5">
                  <li>
                    <strong>Standard:</strong> General progress and everyday
                    updates.
                  </li>

                  <li>
                    <strong>Restricted:</strong> Personal well-being concerns
                    needing careful handling.
                  </li>

                  <li>
                    <strong>Highly Restricted:</strong> Particularly sensitive
                    information. Reports with this label cannot be approved for
                    student visibility.
                  </li>
                </ul>

                <p className="mt-3">
                  These labels describe sensitivity. They currently use the same
                  staff-access rules and do not further limit which authorised
                  staff can access the report.
                </p>

                <p className="mt-2">
                  All new updates start hidden from students.
                </p>
              </div>
            </div>

            {/* <Field label="Confidentiality">
              <select
                name="confidentialityLevel"
                value={form.confidentialityLevel}
                onChange={changeForm}
                required
                className={inputClasses}
              >
                <option value="standard">Standard</option>
                <option value="restricted">Restricted</option>
                <option value="highly_restricted">
                  Highly Restricted
                </option>
              </select>
            </Field> */}

            <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Record only necessary, relevant information. This update starts
              hidden from the student and goes to the Advisory Department for
              review.
            </p>
          </section>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!guide}
              className="rounded-lg bg-blue-950 px-6 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {submittingCheckin
                ? "Submitting..."
                : followUp
                  ? "Submit Follow-Up"
                  : "Submit Check-In"}
            </button>
          </footer>
        </fieldset>

        {checkinError && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {checkinError.message}
          </div>
        )}
      </form>
    </dialog>
  );
}

function QuestionGroup({ title, description, questions, answers, onChange }) {
  return (
    <section>
      <h3 className="text-lg font-bold text-blue-950">{title}</h3>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      )}

      <div className="mt-5 space-y-4">
        {questions.map((item, index) => (
          <label
            key={item.id}
            className="block rounded-xl border border-slate-200 p-4"
          >
            <span className="block text-sm font-semibold leading-6 text-slate-800">
              {index + 1}. {item.question}
            </span>

            <textarea
              value={answers[item.id] || ""}
              onChange={(event) => onChange(item.id, event.target.value)}
              rows={3}
              maxLength={5000}
              placeholder="Relevant response — optional"
              className={`${inputClasses} mt-3`}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
