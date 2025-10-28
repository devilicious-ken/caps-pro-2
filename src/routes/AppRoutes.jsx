import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../components/DashboardPage";
import UserManagementPage from "../components/UserManagementPage";
import RsbsaRecordsPage from "../components/RsbsaRecordsPage";
import RegisterPage from "../components/RegisterPage";
import MapPage from "../components/MapPage";
import ImportPage from "../components/ImportPage";
import ExportPage from "../components/ExportPage";
import HistoryPage from "../components/HistoryPage";
import HelpPage from "../components/HelpPage";

const AppRoutes = ({ user }) => {
  // Get user role for route protection
  const userRole = user?.role?.toLowerCase() || "user";

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
      return children;
    }
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Default redirect to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard - Available to all users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "moderator", "user"]}>
            <DashboardPage user={user} />
          </ProtectedRoute>
        }
      />

      {/* User Management - Admin only */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagementPage user={user} />
          </ProtectedRoute>
        }
      />

      {/* RSBSA Records - All users */}
      <Route
        path="/records"
        element={
          <ProtectedRoute allowedRoles={["admin", "moderator", "user"]}>
            <RsbsaRecordsPage user={user} />
          </ProtectedRoute>
        }
      />

      {/* Register - All users */}
      <Route
        path="/register"
        element={
          <ProtectedRoute allowedRoles={["admin", "moderator", "user"]}>
            <RegisterPage user={user} />
          </ProtectedRoute>
        }
      />

      {/* GIS Map - All users */}
      <Route
        path="/map"
        element={
          <ProtectedRoute allowedRoles={["admin", "moderator", "user"]}>
            <MapPage user={user} />
          </ProtectedRoute>
        }
      />

      {/* Import/Export - Admin and Moderator only */}
      <Route
        path="/import"
        element={
          <ProtectedRoute allowedRoles={["admin", "moderator"]}>
            <ImportPage user={user} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/export"
        element={
          <ProtectedRoute allowedRoles={["admin", "moderator"]}>
            <ExportPage user={user} />
          </ProtectedRoute>
        }
      />

      {/* History - Admin and Moderator only */}
      <Route
        path="/history"
        element={
          <ProtectedRoute allowedRoles={["admin", "moderator"]}>
            <HistoryPage user={user} />
          </ProtectedRoute>
        }
      />

      {/* Help - All users */}
      <Route
        path="/help"
        element={
          <ProtectedRoute allowedRoles={["admin", "moderator", "user"]}>
            <HelpPage user={user} />
          </ProtectedRoute>
        }
      />

      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
