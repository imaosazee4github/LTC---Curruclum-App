
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";

import AuthCallbackPage from "../pages/auth/AuthCallbackPage";
import AuthRedirectPage from "../pages/auth/AuthRedirectPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import StudentRegistrationPage from "../pages/auth/StudentRegistrationPage";
import LandingPage from "../pages/public/LandingPage";

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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
