import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

import MainLayout from "./layout/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import EmployeeAttendance from "./pages/Attendance/EmployeeAttendance";
import AttendanceHistory from "./pages/Attendance/AttendanceHistory";
import AdminAttendanceDashboard from "./pages/AdminAttendanceDashboard";
import Profile from "./pages/Profile";

import { useAuth } from "./context/AuthContext";
import SalaryHistory from "./pages/salary/SalaryHistory";
import AdminSalaryHistory from "./pages/salary/AdminSalaryHistory";
import AdminSalaryGenerate from "./pages/salary/AdminSalaryGenerate";
import AdminEmployeeList from "./pages/Admin/AdminEmployeeList";
import AdminEmployeeEdit from "./pages/Admin/AdminEmployeeEdit";
import AdminLeaveRequests from "./pages/Leave/AdminLeaveRequests";
import LeaveHistory from "./pages/Leave/LeaveHistory";
import EmployeeLeave from "./pages/Leave/EmployeeLeave";
import PerformanceBonus from "./pages/Performance/PerformanceBonus";
import { RequireRegistration } from "./components/RequireRegistration";
import AdminTeamAssignments from "./pages/Admin/AdminTeamAssignments";
import AdminLeaveReview from "./pages/Leave/AdminLeaveReview";

export default function App() {
  const { roles } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RequireRegistration>
                <MainLayout>
                  {roles.includes("v4-admin") || roles.includes("v4-hr") ? (
                    <AdminDashboard />
                  ) : (
                    <EmployeeDashboard />
                  )}
                </MainLayout>
              </RequireRegistration>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/employees"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminEmployeeList />
              </MainLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/team-assignments"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminTeamAssignments />
              </MainLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/employees/:employeeId"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminEmployeeEdit />
              </MainLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EmployeeAttendance />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AttendanceHistory />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/attendance"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminAttendanceDashboard />
              </MainLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/performance/bonus"
          element={
            <AdminRoute>
              <MainLayout>
                <PerformanceBonus />
              </MainLayout>
            </AdminRoute>
          }
        />

        {/* Employee Salary History */}
        <Route
          path="/salary/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SalaryHistory />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin / HR Salary History */}
        <Route
          path="/admin/salary/history"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminSalaryHistory />
              </MainLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/salary/generate"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminSalaryGenerate />
              </MainLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EmployeeLeave />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LeaveHistory />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/leave"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminLeaveRequests />
              </MainLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/leave/:leaveId"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminLeaveReview />
              </MainLayout>
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
