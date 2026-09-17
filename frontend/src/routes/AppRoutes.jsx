import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Login from "../pages/auth/Login";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAssets from "../pages/admin/AdminAssets";
import AdminAssetForm from "../pages/admin/AdminAssetForm";
import AdminAssetEdit from "../pages/admin/AdminAssetEdit";
import AssetDetails from "../pages/admin/AssetDetails";
import AdminMaintenance from "../pages/admin/AdminMaintenance";
import AdminTechnicians from "../pages/admin/AdminTechnicians";
import AdminHistory from "../pages/admin/AdminHistory";
import AdminReports from "../pages/admin/AdminReports";
import AdminUsers from "../pages/admin/AdminUsers";
import StaffDashboard from "../pages/staff/StaffDashboard";
import StaffAssets from "../pages/staff/StaffAssets";
import StaffReportIssue from "../pages/staff/StaffReportIssue";
import StaffRequests from "../pages/staff/StaffRequests";
import TechnicianDashboard from "../pages/technician/TechnicianDashboard";
import TechnicianRequests from "../pages/technician/TechnicianRequests";
import TechnicianAssets from "../pages/technician/TechnicianAssets";
import TechnicianHistory from "../pages/technician/TechnicianHistory";
import MaintenanceDetails from "../pages/common/MaintenanceDetails";
import Notifications from "../pages/common/Notifications";
import Profile from "../pages/common/Profile";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* ADMIN ROUTES */}
            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/assets" element={<AdminAssets />} />
              <Route path="/admin/assets/add" element={<AdminAssetForm />} />
              <Route path="/admin/assets/:assetId/edit" element={<AdminAssetEdit />} />
              <Route path="/admin/assets/:assetId" element={<AssetDetails />} />
              <Route path="/admin/maintenance" element={<AdminMaintenance />} />
              <Route path="/admin/maintenance/:requestId" element={<MaintenanceDetails />} />
              <Route path="/admin/technicians" element={<AdminTechnicians />} />
              <Route path="/admin/history" element={<AdminHistory />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/profile" element={<Profile />} />
            </Route>

            {/* STAFF ROUTES */}
            <Route element={<RoleRoute allowedRoles={["STAFF"]} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/assets" element={<StaffAssets />} />
              <Route path="/staff/assets/:assetId" element={<AssetDetails />} />
              <Route path="/staff/report-issue" element={<StaffReportIssue />} />
              <Route path="/staff/requests" element={<StaffRequests />} />
              <Route path="/staff/requests/:requestId" element={<MaintenanceDetails />} />
              <Route path="/staff/notifications" element={<Notifications />} />
              <Route path="/staff/profile" element={<Profile />} />
            </Route>

            {/* TECHNICIAN ROUTES */}
            <Route element={<RoleRoute allowedRoles={["TECHNICIAN"]} />}>
              <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
              <Route path="/technician/requests" element={<TechnicianRequests />} />
              <Route path="/technician/requests/:requestId" element={<MaintenanceDetails />} />
              <Route path="/technician/assets" element={<TechnicianAssets />} />
              <Route path="/technician/assets/:assetId" element={<AssetDetails />} />
              <Route path="/technician/history" element={<TechnicianHistory />} />
              <Route path="/technician/notifications" element={<Notifications />} />
              <Route path="/technician/profile" element={<Profile />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
