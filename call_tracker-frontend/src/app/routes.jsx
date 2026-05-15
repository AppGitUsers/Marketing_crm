import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import AuthLayout from "../layouts/AuthLayout";

import EmployeeLayout from "../layouts/EmployeeLayout";
import EmployeeDashboard from "../pages/employee/Dashboard";
import MyCalls from "../pages/employee/MyCalls";
import FollowUps from "../pages/employee/FollowUps";
import Leads from "../pages/employee/Leads";
import Conversions from "../pages/employee/Conversions";
import ClosedDeals from "../pages/employee/ClosedDeals";
import Projects from "../pages/employee/Projects";

import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Employees from "../pages/admin/Employees";
import Calls from "../pages/admin/Calls";
import Reports from "../pages/admin/Reports";
import AdminRegister from "../pages/admin/AdminRegister";
import Targets from "../pages/admin/Targets";

export default function AppRoutes() {
  return (
    <Routes>

      {/* AUTH */}
      <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="calls" element={<Calls />} />
        <Route path="reports" element={<Reports />} />
        <Route path="targets" element={<Targets />} />
        <Route path="register" element={<AdminRegister />} />
      </Route>

      {/* EMPLOYEE */}
      <Route path="/employee/dashboard" element={<EmployeeLayout><EmployeeDashboard /></EmployeeLayout>} />
      <Route path="/employee/my-calls" element={<EmployeeLayout><MyCalls /></EmployeeLayout>} />
      <Route path="/employee/follow-ups" element={<EmployeeLayout><FollowUps /></EmployeeLayout>} />
      <Route path="/employee/leads" element={<EmployeeLayout><Leads /></EmployeeLayout>} />
      <Route path="/employee/conversions" element={<EmployeeLayout><Conversions /></EmployeeLayout>} />
      <Route path="/employee/closed-deals" element={<EmployeeLayout><ClosedDeals /></EmployeeLayout>} />
      <Route path="/employee/projects" element={<EmployeeLayout><Projects /></EmployeeLayout>} />

    </Routes>
  );
}