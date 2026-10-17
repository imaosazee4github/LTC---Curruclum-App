import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSuperAdminStudents } from "../../hooks/useSuperAdminStudents";
const PAGE_SIZE = 10;
export default function StudentOverviewTable() {
  const {
    students,
    studentsLoading,
    studentsFetching,
    studentsError,
    refreshStudents,
  } = useSuperAdminStudents();
  const [search, setSearch] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [facilitatorId, setFacilitatorId] = useState("");
  const [page, setPage] = useState(1);
  const staffOptions = useMemo(() => {
    const collect = (field) => {
      const people = new Map();
      students.forEach((student) => {
        (Array.isArray(student[field]) ? student[field] : []).forEach((person) => {
          if (person.profile_id) people.set(person.profile_id, person.full_name || "Name not provided");
        });
      });
      return [...people.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    };
    return {
      instructors: collect("instructors"),
      coaches: collect("coaches"),
      facilitators: collect("facilitators"),
    };
  }, [students]);
  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = [
        student.full_name,
        student.email,
        student.phone,
        student.student_number,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term),
      );
      return (
        matchesSearch &&
        matchesStaff(student.instructors, instructorId) &&
        matchesStaff(student.coaches, coachId) &&
        matchesStaff(student.facilitators, facilitatorId)
      );
    });
  }, [students, search, instructorId, coachId, facilitatorId]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleStudents = filteredStudents.slice(start, start + PAGE_SIZE);
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100";
  return (
    <section
      aria-labelledby="student-overview-title"
      className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
        <div>
          <h2
            id="student-overview-title"
            className="text-lg font-bold text-slate-950"
          >
            Overall Students
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View student contacts and filter by assigned support staff.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refreshStudents()}
          disabled={studentsFetching}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
        >
          {studentsFetching ? "Refreshing..." : "Refresh students"}
        </button>
      </header>
      <div className="grid gap-4 border-b border-slate-200 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Search students</span>
          <input
            type="search"
            value={search}
            placeholder="Name, email, phone or student number"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className={inputClass}
          />
        </label>
        {[
          ["Instructor", "All instructors", instructorId, setInstructorId, staffOptions.instructors],
          ["Coach", "All coaches", coachId, setCoachId, staffOptions.coaches],
          ["Facilitator", "All facilitators", facilitatorId, setFacilitatorId, staffOptions.facilitators],
        ].map(([label, allLabel, value, setValue, options]) => (
          <label key={label} className="space-y-2 text-sm font-medium text-slate-700">
            <span>{label}</span>
            <select value={value} onChange={(event) => {
              setValue(event.target.value);
              setPage(1);
            }} className={inputClass}>
              <option value="">{allLabel}</option>
              {options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
        ))}
        <div className="sm:col-span-2 xl:col-span-4 flex items-center justify-between gap-4">
          <p role="status" className="text-sm text-slate-500">
            {filteredStudents.length} of {students.length} students
          </p>
          <button type="button" onClick={() => {
            setSearch("");
            setInstructorId("");
            setCoachId("");
            setFacilitatorId("");
            setPage(1);
          }} className="text-sm font-semibold text-blue-700 hover:underline">
            Clear filters
          </button>
        </div>
      </div>
      {studentsError && (
        <div role="alert" className="bg-red-50 p-5 text-sm text-red-700">
          {studentsError.message || "Students could not be loaded."}
        </div>
      )}
      {studentsLoading ? (
        <p role="status" className="p-10 text-center text-slate-500">
          Loading students...
        </p>
      ) : visibleStudents.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <caption className="sr-only">
                Students and their contact and assigned support details
              </caption>
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  {[
                    "Student",
                    "Phone number",
                    "Student number",
                    "Advisor",
                    "Instructors",
                    "Coaches",
                    "Facilitators",
                  ].map((heading) => (
                    <th key={heading} scope="col" className="px-5 py-4">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {visibleStudents.map((student) => (
                  <tr key={student.profile_id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        to={`/super-admin/students/${student.profile_id}`}
                        className="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900 focus-visible:outline focus-visible:outline-2"
                      >
                        {student.full_name || "Unnamed student"}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {student.email || "Email not provided"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                      {student.phone || "Not provided"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {student.student_number || "Not assigned"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {student.mentor_name || "Not assigned"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <AssignedStaffList people={student.instructors} />
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <AssignedStaffList people={student.coaches} />
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <AssignedStaffList people={student.facilitators} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 p-5 text-sm text-slate-600">
            <p>
              Showing {start + 1}–{Math.min(start + PAGE_SIZE, filteredStudents.length)}
              {" "}of {filteredStudents.length} students
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </footer>
        </>
      ) : !studentsError ? (
        <p className="p-10 text-center text-slate-500">
          {students.length
            ? "No students match your search or filters."
            : "No student accounts found."}
        </p>
      ) : null}
    </section>
  );
}

function AssignedStaffList({ people }) {
  if (!Array.isArray(people) || people.length === 0) {
    return <span className="text-slate-400">Not assigned</span>;
  }

  return (
    <ul className="min-w-[150px] space-y-2">
      {people.map((person) => (
        <li key={person.profile_id}>
          {person.full_name || "Name not provided"}
        </li>
      ))}
    </ul>
  );
}

function matchesStaff(people, profileId) {
  return !profileId || (Array.isArray(people) && people.some((person) => person.profile_id === profileId));
}
