import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";

import SupervisorDashboardPage from "../pages/supervisor/SupervisorDashboardPage";
import ServiceStudentAssignmentsPage from "../pages/supervisor/ServiceStudentAssignmentsPage";
import ServiceAttendancePage from "../pages/supervisor/ServiceAttendancePage";
import StudentServiceWorkRecordsPage from "../pages/supervisor/StudentServiceWorkRecordsPage";
import ServiceProjectsPage from "../pages/supervisor/ServiceProjectsPage";

import CourseManagementPage from "../pages/super-admin/CourseManagementPage";
import StaffManagementPage from "../pages/super-admin/StaffManagementPage";
import SuperAdminDashboardPage from "../pages/super-admin/SuperAdminDashboardPage";
import ClassesSchedulesPage from "../pages/super-admin/ClassesSchedulesPage";
import StaffAllocationsPage from "../pages/super-admin/StaffAllocationsPage";
import ServiceOversightPage from "../pages/super-admin/ServiceOversightPage";
import InstructorOversightPage from "../pages/super-admin/InstructorOversightPage";
import FacilitatorOversightPage from "../pages/super-admin/FacilitatorOversightPage";
import CoachOversightPage from "../pages/super-admin/CoachOversightPage";
import CoachingAssignmentsPage from "../pages/super-admin/CoachingAssignmentsPage";
import LearningExperienceManagementPage from "../pages/super-admin/LearningExperienceManagementPage";
import SuperAdminStudentDetailsPage from "../pages/super-admin/SuperAdminStudentDetailsPage";

import MentorAssignmentsPage from "../pages/mentor-department/MentorAssignmentsPage";
import MentorDepartmentDashboardPage from "../pages/mentor-department/MentorDepartmentDashboardPage";
import MentorReportsPage from "../pages/mentor-department/MentorReportsPage";
import DevotionsPage from "../pages/mentor-department/DevotionsPage";
import MentorDashboardPage from "../pages/mentor/MentorDashboardPage";
import MentorMenteesPage from "../pages/mentor/MentorMenteesPage";
import MentorActionsPage from "../pages/mentor/MentorActionsPage";
import MentorDepartmentFollowUpsPage from "../pages/mentor-department/MentorDepartmentFollowUpsPage";

import AuthCallbackPage from "../pages/auth/AuthCallbackPage";
import AuthRedirectPage from "../pages/auth/AuthRedirectPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import StudentRegistrationPage from "../pages/auth/StudentRegistrationPage";
import LandingPage from "../pages/public/LandingPage";

import InstructorDashboardPage from "../pages/instructor/InstructorDashboardPage";
import InstructorClassesPage from "../pages/instructor/InstructorClassesPage";
import InstructorStudentsPage from "../pages/instructor/InstructorStudentsPage";
import InstructorAttendancePage from "../pages/instructor/InstructorAttendancePage";
import InstructorLearningPage from "../pages/instructor/InstructorLearningPage";
import InstructorAssignmentsPage from "../pages/instructor/InstructorAssignmentsPage";
import InstructorFollowUpsPage from "../pages/instructor/InstructorFollowUpsPage";

import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import StudentProfilePage from "../pages/student/StudentProfilePage";
import StudentDailySchedulePage from "../pages/student/StudentDailySchedulePage";
import StudentCoachingPage from "../pages/student/StudentCoachingPage";
import StudentLearningPage from "../pages/student/StudentLearningPage";
import StudentServicePage from "../pages/student/StudentServicePage";
import StudentConcernsPage from "../pages/mentor/StudentConcernsPage";

import CoachDashboardPage from "../pages/coach/CoachDashboardPage";
import CoachAssignmentsPage from "../pages/coach/CoachAssignmentsPage";
import CoachFollowUpsPage from "../pages/coach/CoachFollowUpsPage";
import RecordCoachingPage from "../pages/coach/RecordCoachingPage";
import StudentCoachingRecordPage from "../pages/coach/StudentCoachingRecordPage";

import FacilitatorAdvisoryUpdatesPage from "../pages/facilitator/FacilitatorAdvisoryUpdatesPage";
import FacilitatorDashboardPage from "../pages/facilitator/FacilitatorDashboardPage";
import FacilitatorExperiencesPage from "../pages/facilitator/FacilitatorExperiencesPage";
import FacilitatorStudentsPage from "../pages/facilitator/FacilitatorStudentsPage";
import FacilitatorEngagementPage from "../pages/facilitator/FacilitatorEngagementPage";
import FacilitatorFollowUpsPage from "../pages/facilitator/FacilitatorFollowUpsPage";

const protectedPages = [
  {
    path: "/student/dashboard",
    role: "student",
    element: <StudentDashboardPage />,
  },
  {
    path: "/student/profile",
    role: "student",
    element: <StudentProfilePage />,
  },
  {
    path: "/student/schedule",
    role: "student",
    element: <StudentDailySchedulePage />,
  },
  {
    path: "/student/coaching",
    role: "student",
    element: <StudentCoachingPage />,
  },
  {
    path: "/mentor/concerns",
    role: "mentor",
    element: <StudentConcernsPage />,
  },
  {
    path: "/mentor-department/concerns",
    role: "mentor_department",
    element: <StudentConcernsPage />,
  },
  {
    path: "/mentor/reports",
    role: "mentor",
    element: <MentorMenteesPage />,
  },
  {
    path: "/student/learning",
    role: "student",
    element: <StudentLearningPage />,
  },
  {
    path: "/student/service",
    role: "student",
    element: <StudentServicePage />,
  },
  {
    path: "/instructor/dashboard",
    role: "instructor",
    element: <InstructorDashboardPage />,
  },
  {
    path: "/instructor/classes",
    role: "instructor",
    element: <InstructorClassesPage />,
  },
  {
    path: "/instructor/students",
    role: "instructor",
    element: <InstructorStudentsPage />,
  },
  {
    path: "/instructor/attendance",
    role: "instructor",
    element: <InstructorAttendancePage />,
  },
  {
    path: "/instructor/learning",
    role: "instructor",
    element: <InstructorLearningPage />,
  },
  {
    path: "/instructor/assignments",
    role: "instructor",
    element: <InstructorAssignmentsPage />,
  },
  {
    path: "/instructor/follow-ups",
    role: "instructor",
    element: <InstructorFollowUpsPage />,
  },
  {
    path: "/facilitator/dashboard",
    role: "facilitator",
    element: <FacilitatorDashboardPage />,
  },
  {
    path: "/facilitator/experiences",
    role: "facilitator",
    element: <FacilitatorExperiencesPage />,
  },
  {
    path: "/facilitator/students",
    role: "facilitator",
    element: <FacilitatorStudentsPage />,
  },
  {
    path: "/facilitator/advisory-updates",
    role: "facilitator",
    element: <FacilitatorAdvisoryUpdatesPage />,
  },
  {
    path: "/facilitator/engagement",
    role: "facilitator",
    element: <FacilitatorEngagementPage />,
  },
  {
    path: "/facilitator/follow-ups",
    role: "facilitator",
    element: <FacilitatorFollowUpsPage />,
  },
  {
    path: "/supervisor/dashboard",
    role: "supervisor",
    element: <SupervisorDashboardPage />,
  },
  {
    path: "/supervisor/projects",
    role: "supervisor",
    element: <ServiceProjectsPage />,
  },
  {
    path: "/supervisor/student-assignments",
    role: "supervisor",
    element: <ServiceStudentAssignmentsPage />,
  },
  {
    path: "/supervisor/attendance",
    role: "supervisor",
    element: <ServiceAttendancePage />,
  },
  {
    path: "/supervisor/work-records",
    role: "supervisor",
    element: <StudentServiceWorkRecordsPage />,
  },
  {
    path: "/mentor-department/dashboard",
    role: "mentor_department",
    element: <MentorDepartmentDashboardPage />,
  },
  {
    path: "/mentor-department/assignments",
    role: "mentor_department",
    element: <MentorAssignmentsPage />,
  },
  {
    path: "/mentor-department/reports",
    role: "mentor_department",
    element: <MentorReportsPage />,
  },
  {
    path: "/mentor-department/follow-ups",
    role: "mentor_department",
    element: <MentorDepartmentFollowUpsPage />,
  },
  {
    path: "/mentor-department/devotions",
    role: "mentor_department",
    element: <DevotionsPage />,
  },
  {
    path: "/mentor/dashboard",
    role: "mentor",
    element: <MentorDashboardPage />,
  },
  {
    path: "/mentor/mentees",
    role: "mentor",
    element: <MentorMenteesPage />,
  },
  {
    path: "/mentor/actions",
    role: "mentor",
    element: <MentorActionsPage />,
  },
  {
    path: "/super-admin/dashboard",
    role: "super_admin",
    element: <SuperAdminDashboardPage />,
  },
  {
    path: "/super-admin/students/:profileId",
    role: "super_admin",
    element: <SuperAdminStudentDetailsPage />,
  },
  {
    path: "/super-admin/learning-experiences",
    role: "super_admin",
    element: <LearningExperienceManagementPage />,
  },
  {
    path: "/super-admin/staff",
    role: "super_admin",
    element: <StaffManagementPage />,
  },
  {
    path: "/super-admin/staff-allocations",
    role: "super_admin",
    element: <StaffAllocationsPage />,
  },
  {
    path: "/super-admin/classes",
    role: "super_admin",
    element: <ClassesSchedulesPage />,
  },
  {
    path: "/super-admin/learning-areas",
    role: "super_admin",
    element: <CourseManagementPage />,
  },
  {
    path: "/super-admin/coaching-assignments",
    role: "super_admin",
    element: <CoachingAssignmentsPage />,
  },
  {
    path: "/super-admin/instructor-oversight",
    role: "super_admin",
    element: <InstructorOversightPage />,
  },
  {
    path: "/super-admin/facilitator-oversight",
    role: "super_admin",
    element: <FacilitatorOversightPage />,
  },
  {
    path: "/super-admin/coach-oversight",
    role: "super_admin",
    element: <CoachOversightPage />,
  },
  {
    path: "/super-admin/service-oversight",
    role: "super_admin",
    element: <ServiceOversightPage />,
  },
  {
    path: "/coach/dashboard",
    role: "coach",
    element: <CoachDashboardPage />,
  },
  {
    path: "/coach/records",
    role: "coach",
    element: <StudentCoachingRecordPage />,
  },
  {
    path: "/coach/follow-ups",
    role: "coach",
    element: <CoachFollowUpsPage />,
  },
  {
    path: "/coach/assignments",
    role: "coach",
    element: <CoachAssignmentsPage />,
  },
  {
    path: "/coach/record",
    role: "coach",
    element: <RecordCoachingPage />,
  },
];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/student/register" element={<StudentRegistrationPage />} />

      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route
        path="/auth/redirect"
        element={
          <ProtectedRoute>
            <AuthRedirectPage />
          </ProtectedRoute>
        }
      />

      {protectedPages.map(({ path, role, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute allowedRoles={[role]}>{element}</ProtectedRoute>
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
