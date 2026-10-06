import {
  useEffect,
  useState,
} from "react";

import CloudinaryUploadButton from "../../components/uploads/CloudinaryUploadButton";
import { useAuth } from "../../hooks/useAuth";
import {
  useStudentProfile,
} from "../../hooks/useStudentProfile";
import StudentLayout from "../../layouts/StudentLayout";

const initialForm = {
  fullName: "",
  phone: "",
  preferredName: "",
  dateOfBirth: "",
  gender: "",
  residentialAddress: "",
  city: "",
  state: "",
  country: "Nigeria",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
};

export default function StudentProfilePage() {
  const {
    profile,
  } = useAuth();

  const {
    studentProfile,
    studentProfileLoading,
    studentProfileError,

    saveStudentProfile,
    savingStudentProfile,

    saveProfilePhoto,
    savingProfilePhoto,

    studentProfileSaveError,
    profilePhotoError,
  } = useStudentProfile();

  const [form, setForm] =
    useState(initialForm);

  const [formError, setFormError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [photoMessage, setPhotoMessage] =
    useState("");

  useEffect(() => {
    if (!profile || !studentProfile) {
      return;
    }

    setForm({
      fullName:
        profile.full_name || "",

      phone:
        profile.phone || "",

      preferredName:
        studentProfile.preferred_name ||
        "",

      dateOfBirth:
        studentProfile.date_of_birth ||
        "",

      gender:
        studentProfile.gender || "",

      residentialAddress:
        studentProfile
          .residential_address || "",

      city:
        studentProfile.city || "",

      state:
        studentProfile.state || "",

      country:
        studentProfile.country ||
        "Nigeria",

      emergencyContactName:
        studentProfile
          .emergency_contact_name ||
        "",

      emergencyContactRelationship:
        studentProfile
          .emergency_contact_relationship ||
        "",

      emergencyContactPhone:
        studentProfile
          .emergency_contact_phone ||
        "",
    });
  }, [profile, studentProfile]);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setFormError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!form.fullName.trim()) {
      setFormError(
        "Enter your full name.",
      );

      return;
    }

    if (!form.phone.trim()) {
      setFormError(
        "Enter your phone number.",
      );

      return;
    }

    try {
      const result =
        await saveStudentProfile(
          form,
        );

      setSuccessMessage(
        result?.message ||
          "Your student profile was updated successfully.",
      );
    } catch (error) {
      setFormError(
        error.message ||
          "Unable to update your profile.",
      );
    }
  }

  async function handlePhotoUpload(
    uploadResult,
  ) {
    setPhotoMessage("");
    setFormError("");

    try {
      const result =
        await saveProfilePhoto({
          secureUrl:
            uploadResult.secureUrl,

          publicId:
            uploadResult.publicId,
        });

      setPhotoMessage(
        result?.message ||
          "Your profile photo was updated successfully.",
      );
    } catch (error) {
      setFormError(
        error.message ||
          "Unable to save your profile photo.",
      );
    }
  }

  if (studentProfileLoading) {
    return (
      <StudentLayout>
        <PageMessage message="Loading your student profile..." />
      </StudentLayout>
    );
  }

  if (
    studentProfileError ||
    !studentProfile
  ) {
    return (
      <StudentLayout>
        <PageMessage
          error
          message={
            studentProfileError?.message ||
            "Your student profile could not be loaded."
          }
        />
      </StudentLayout>
    );
  }

  const displayedError =
    formError ||
    studentProfileSaveError?.message ||
    profilePhotoError?.message;

  return (
    <StudentLayout>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              My Profile
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-950">
              Student Profile
            </h1>

            <p className="mt-2 max-w-3xl leading-7 text-slate-600">
              Keep your personal and emergency
              contact information accurate.
              Programme assignments are managed
              by an authorized administrator.
            </p>
          </header>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Student number"
              value={
                studentProfile
                  .student_number ||
                "Pending assignment"
              }
            />

            <SummaryCard
              label="Cohort"
              value={
                studentProfile.cohort
                  ?.name ||
                "Pending assignment"
              }
            />

            <SummaryCard
              label="Enrollment status"
              value={formatValue(
                studentProfile
                  .enrollment_status,
              )}
            />

            <SummaryCard
              label="Profile completion"
              value={`${studentProfile.profile_completion_percentage}%`}
            />
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-950">
                Profile Picture
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Upload a clear, recent
                photograph for your student
                profile.
              </p>
            </div>

            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
              <ProfilePicture
                profile={profile}
              />

              <div>
                <CloudinaryUploadButton
                  buttonText={
                    profile
                      ?.profile_photo_url
                      ? "Change Profile Picture"
                      : "Upload Profile Picture"
                  }
                  onUploadComplete={
                    handlePhotoUpload
                  }
                />

                {savingProfilePhoto && (
                  <p className="mt-3 text-sm text-blue-700">
                    Saving profile picture...
                  </p>
                )}

                {photoMessage && (
                  <p
                    role="status"
                    className="mt-3 text-sm font-medium text-green-700"
                  >
                    {photoMessage}
                  </p>
                )}

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Accepted formats: JPG, PNG
                  and WebP. Maximum file size:
                  5 MB.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-blue-950">
                Personal Information
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Fields marked as required
                contribute to your profile
                completion.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              {displayedError && (
                <Message
                  error
                  message={
                    displayedError
                  }
                />
              )}

              {successMessage && (
                <Message
                  message={
                    successMessage
                  }
                />
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  label="Full name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />

                <FormField
                  label="Preferred name"
                  name="preferredName"
                  value={
                    form.preferredName
                  }
                  onChange={handleChange}
                  autoComplete="nickname"
                />

                <FormField
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />

                <FormField
                  label="Date of birth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  autoComplete="bday"
                  required
                />

                <SelectField
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  options={[
                    {
                      value: "",
                      label:
                        "Select gender",
                    },
                    {
                      value: "male",
                      label: "Male",
                    },
                    {
                      value: "female",
                      label: "Female",
                    }
                  ]}
                />

                <FormField
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  autoComplete="country-name"
                  required
                />

                <FormField
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  autoComplete="address-level1"
                  required
                />

                <FormField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  required
                />

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Residential address"
                    name="residentialAddress"
                    value={
                      form.residentialAddress
                    }
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="my-8 border-t border-slate-200" />

              <div>
                <h3 className="text-lg font-bold text-blue-950">
                  Emergency Contact
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Provide someone LTC may
                  contact in an emergency.
                </p>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <FormField
                  label="Contact full name"
                  name="emergencyContactName"
                  value={
                    form.emergencyContactName
                  }
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="Relationship"
                  name="emergencyContactRelationship"
                  value={
                    form
                      .emergencyContactRelationship
                  }
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="Contact phone number"
                  name="emergencyContactPhone"
                  type="tel"
                  value={
                    form.emergencyContactPhone
                  }
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Current completion:{" "}
                  <span className="font-semibold text-blue-950">
                    {
                      studentProfile
                        .profile_completion_percentage
                    }
                    %
                  </span>
                </p>

                <button
                  type="submit"
                  disabled={
                    savingStudentProfile
                  }
                  className="rounded-lg bg-blue-950 px-6 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingStudentProfile
                    ? "Saving profile..."
                    : "Save Profile"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </StudentLayout>
  );
}

function ProfilePicture({ profile }) {
  if (profile?.profile_photo_url) {
    return (
      <img
        src={profile.profile_photo_url}
        alt={`${profile.full_name || "Student"} profile`}
        className="h-32 w-32 rounded-full border-4 border-slate-100 object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-900">
      {getInitials(profile?.full_name)}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-blue-950">
        {value}
      </p>
    </article>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  autoComplete,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={3}
        className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Message({
  message,
  error = false,
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mb-6 rounded-lg border p-4 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      {message}
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
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function getInitials(fullName) {
  if (!fullName) {
    return "ST";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) =>
      name.charAt(0).toUpperCase(),
    )
    .join("");
}