import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";

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
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import StudentProfilePage from "../pages/student/StudentProfilePage";
import MentorDashboardPage from "../pages/mentor/MentorDashboardPage";
import MentorMenteesPage from "../pages/mentor/MentorMenteesPage";
import MentorReportsPage from "../pages/mentor-department/MentorReportsPage";

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
  path="/super-admin/staff"
  element={
    <ProtectedRoute
      allowedRoles={["super_admin"]}
    >
      <StaffManagementPage />
    </ProtectedRoute>
  }
/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
