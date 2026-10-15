import { Link, useParams } from "react-router-dom";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import {
  useSuperAdminStudentDetails,
} from "../../hooks/useSuperAdminStudentDetails";

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? "Not provided"
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

export default function SuperAdminStudentDetailsPage() {
  const { profileId } = useParams();

  const {
    studentDetails,
    studentDetailsLoading,
    studentDetailsError,
    refreshStudentDetails,
  } = useSuperAdminStudentDetails(profileId);

  const account = studentDetails?.account;
  const student = studentDetails?.studentProfile;

  return (
    <SuperAdminLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/super-admin/dashboard"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            ← Back to dashboard
          </Link>

          {studentDetailsLoading ? (
            <p role="status" className="mt-8 text-slate-600">
              Loading student details...
            </p>
          ) : studentDetailsError ? (
            <div
              role="alert"
              className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
            >
              <p>{studentDetailsError.message}</p>
              <button
                type="button"
                onClick={() => refreshStudentDetails()}
                className="mt-4 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : !account ? (
            <p className="mt-8 rounded-xl border bg-white p-6 text-slate-600">
              Student not found or unavailable.
            </p>
          ) : (
            <>
              <header className="mt-6 flex flex-wrap items-center gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                {account.profile_photo_url && (
                  <img
                    src={account.profile_photo_url}
                    alt={`${account.full_name || "Student"} profile`}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                )}

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                    Student details
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-slate-950">
                    {account.full_name || "Unnamed student"}
                  </h1>
                  <p className="mt-2 text-slate-500">
                    Student number: {student?.student_number || "Not assigned"}
                  </p>
                </div>
              </header>

              {!student && (
                <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  This student has an account but has not created their
                  extended student profile.
                </p>
              )}

              <div className="mt-6 grid gap-6">
                <DetailsSection
                  title="Personal and contact information"
                  fields={[
                    ["Full name", account.full_name],
                    ["Preferred name", student?.preferred_name],
                    ["Email", account.email],
                    ["Phone number", account.phone],
                    ["Date of birth", formatDate(student?.date_of_birth)],
                    ["Gender", student?.gender],
                  ]}
                />

                <DetailsSection
                  title="Residential address"
                  fields={[
                    ["Address", student?.residential_address],
                    ["City", student?.city],
                    ["State", student?.state],
                    ["Country", student?.country],
                  ]}
                />

                <DetailsSection
                  title="Emergency contact"
                  fields={[
                    ["Name", student?.emergency_contact_name],
                    ["Relationship", student?.emergency_contact_relationship],
                    ["Phone number", student?.emergency_contact_phone],
                  ]}
                />

                <DetailsSection
                  title="Programme dates"
                  fields={[
                    ["Entry date", formatDate(student?.entry_date)],
                    [
                      "Expected completion date",
                      formatDate(student?.expected_completion_date),
                    ],
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </SuperAdminLayout>
  );
}

function DetailsSection({ title, fields }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 px-6 py-5 text-lg font-bold text-slate-900">
        {title}
      </h2>

      <dl className="grid gap-6 p-6 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="mt-2 whitespace-pre-wrap break-words font-medium text-slate-900">
              {value || "Not provided"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}