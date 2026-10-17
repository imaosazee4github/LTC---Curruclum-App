import { useLocation } from "react-router-dom";

import { useAuth } from "./hooks/useAuth";
import DashboardDevotions from "./components/common/DashboardDevotions";
import AppRoutes from "./routes/AppRoutes";

const dashboardPaths = new Set([
  "/student/dashboard",
  "/super-admin/dashboard",
  "/instructor/dashboard",
  "/facilitator/dashboard",
  "/coach/dashboard",
  "/supervisor/dashboard",
  "/mentor/dashboard",
  "/mentor-department/dashboard",
]);

export default function App() {
  const { pathname } = useLocation();

  const {
    profile,
    role,
    loading,
    isAuthenticated,
  } = useAuth();

  const normalizedPath = pathname.replace(/\/+$/, "");

  const showDevotions =
    !loading &&
    isAuthenticated &&
    profile?.account_status === "active" &&
    Boolean(role) &&
    dashboardPaths.has(normalizedPath);

  return (
    <>
      <AppRoutes />

      {showDevotions && (
        <DashboardDevotions key={`${profile.id}:${role}`} />
      )}
    </>
  );
}