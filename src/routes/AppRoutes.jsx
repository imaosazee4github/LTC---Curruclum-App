import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";

import SupervisorDashboardPage from "../pages/supervisor/SupervisorDashboardPage";
import ServiceStudentAssignmentsPage from "../pages/supervisor/ServiceStudentAssignmentsPage";
import ServiceAttendancePage from "../pages/supervisor/ServiceAttendancePage";
import StudentServiceWorkRecordsPage from "../pages/supervisor/StudentServiceWorkRecordsPage";
import CourseManagementPage from "../pages/super-admin/CourseManagementPage";
import StaffManagementPage from "../pages/super-admin/StaffManagementPage";
import SuperAdminDashboardPage from "../pages/super-admin/SuperAdminDashboardPage";
import MentorAssignmentsPage from "../pages/mentor-department/MentorAssignmentsPage";
import MentorDepartmentDashboardPage from "../pages/mentor-department/MentorDepartmentDashboardPage";
import AuthCallbackPage from "../pages/auth/AuthCallbackPage";
import AuthRedirectPage from "../pages/auth/AuthRedirectPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import StudentRegistrationPage from "../pages/auth/StudentRegistrationPage";
import LandingPage from "../pages/public/LandingPage";
import InstructorDashboardPage from "../pages/instructor/InstructorDashboardPage";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import StudentProfilePage from "../pages/student/StudentProfilePage";
import MentorDashboardPage from "../pages/mentor/MentorDashboardPage";
import MentorMenteesPage from "../pages/mentor/MentorMenteesPage";
import MentorReportsPage from "../pages/mentor-department/MentorReportsPage";
import CoachDashboardPage from "../pages/coach/CoachDashboardPage";
import CoachAssignmentsPage from "../pages/coach/CoachAssignmentsPage";
import CoachFollowUpsPage from "../pages/coach/CoachFollowUpsPage";
import CoachingAssignmentsPage from "../pages/super-admin/CoachingAssignmentsPage";
import RecordCoachingPage from "../pages/coach/RecordCoachingPage";
import StudentCoachingRecordPage from "../pages/coach/StudentCoachingRecordPage";
import FacilitatorDashboardPage from "../pages/facilitator/FacilitatorDashboardPage";
import ClassesSchedulesPage from "../pages/super-admin/ClassesSchedulesPage";
import StaffAllocationsPage from "../pages/super-admin/StaffAllocationsPage";
import ServiceOversightPage from "../pages/super-admin/ServiceOversightPage";
import InstructorOversightPage from "../pages/super-admin/InstructorOversightPage";
import FacilitatorOversightPage from "../pages/super-admin/FacilitatorOversightPage";
import CoachOversightPage from "../pages/super-admin/CoachOversightPage";
import ServiceProjectsPage from "../pages/supervisor/ServiceProjectsPage";
import FacilitatorExperiencesPage from "../pages/facilitator/FacilitatorExperiencesPage";
import FacilitatorStudentsPage from "../pages/facilitator/FacilitatorStudentsPage";
import FacilitatorEngagementPage from "../pages/facilitator/FacilitatorEngagementPage";
import FacilitatorFollowUpsPage from "../pages/facilitator/FacilitatorFollowUpsPage";
import LearningExperienceManagementPage from "../pages/super-admin/LearningExperienceManagementPage";
import InstructorClassesPage from "../pages/instructor/InstructorClassesPage";
import InstructorStudentsPage from "../pages/instructor/InstructorStudentsPage";
import InstructorAttendancePage from "../pages/instructor/InstructorAttendancePage";
import InstructorLearningPage from "../pages/instructor/InstructorLearningPage";
import InstructorAssignmentsPage from "../pages/instructor/InstructorAssignmentsPage";
import InstructorFollowUpsPage from "../pages/instructor/InstructorFollowUpsPage";
import SuperAdminStudentDetailsPage from "../pages/super-admin/SuperAdminStudentDetailsPage";
import StudentDailySchedulePage from "../pages/student/StudentDailySchedulePage";
import StudentCoachingPage from "../pages/student/StudentCoachingPage";
import StudentLearningPage from "../pages/student/StudentLearningPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/student/register" element={<StudentRegistrationPage />} />

      <Route
        path="/super-admin/students/:profileId"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminStudentDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/auth/redirect"
        element={
          <ProtectedRoute>
            <AuthRedirectPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/schedule"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDailySchedulePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <InstructorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/classes"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <InstructorClassesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/students"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <InstructorStudentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/attendance"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <InstructorAttendancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/learning"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <InstructorLearningPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/assignments"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <InstructorAssignmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/follow-ups"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <InstructorFollowUpsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/facilitator/dashboard"
        element={
          <ProtectedRoute allowedRoles={["facilitator"]}>
            <FacilitatorDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/facilitator/experiences"
        element={
          <ProtectedRoute allowedRoles={["facilitator"]}>
            <FacilitatorExperiencesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/facilitator/students"
        element={
          <ProtectedRoute allowedRoles={["facilitator"]}>
            <FacilitatorStudentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/facilitator/engagement"
        element={
          <ProtectedRoute allowedRoles={["facilitator"]}>
            <FacilitatorEngagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/facilitator/follow-ups"
        element={
          <ProtectedRoute allowedRoles={["facilitator"]}>
            <FacilitatorFollowUpsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supervisor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <SupervisorDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supervisor/projects"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <ServiceProjectsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supervisor/student-assignments"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <ServiceStudentAssignmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supervisor/attendance"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <ServiceAttendancePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supervisor/work-records"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <StudentServiceWorkRecordsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor-department/dashboard"
        element={
          <ProtectedRoute allowedRoles={["mentor_department"]}>
            <MentorDepartmentDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor-department/assignments"
        element={
          <ProtectedRoute allowedRoles={["mentor_department"]}>
            <MentorAssignmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor-department/reports"
        element={
          <ProtectedRoute allowedRoles={["mentor_department"]}>
            <MentorReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["mentor"]}>
            <MentorDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor/mentees"
        element={
          <ProtectedRoute allowedRoles={["mentor"]}>
            <MentorMenteesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/learning-experiences"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <LearningExperienceManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/staff"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <StaffManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/staff-allocations"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <StaffAllocationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/classes"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <ClassesSchedulesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/learning-areas"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <CourseManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coach/dashboard"
        element={
          <ProtectedRoute allowedRoles={["coach"]}>
            <CoachDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coach/records"
        element={
          <ProtectedRoute allowedRoles={["coach"]}>
            <StudentCoachingRecordPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coach/follow-ups"
        element={
          <ProtectedRoute allowedRoles={["coach"]}>
            <CoachFollowUpsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/coaching"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentCoachingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coach/assignments"
        element={
          <ProtectedRoute allowedRoles={["coach"]}>
            <CoachAssignmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/coaching-assignments"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <CoachingAssignmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/instructor-oversight"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <InstructorOversightPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/facilitator-oversight"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <FacilitatorOversightPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/coach-oversight"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <CoachOversightPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/learning"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLearningPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/service-oversight"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <ServiceOversightPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coach/record"
        element={
          <ProtectedRoute allowedRoles={["coach"]}>
            <RecordCoachingPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
