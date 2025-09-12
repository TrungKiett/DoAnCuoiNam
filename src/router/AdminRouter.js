import { Route } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";
import DashboardHome from "../pages/admin/DashboardHome";
import UserManagement from "../pages/admin/UserManagement";

const AdminRoutes = (
  <>
    <Route path="/admin" element={<Dashboard />}>
      <Route path="dashboard" element={<DashboardHome />} />
      <Route path="accounts" element={<UserManagement />} />
    </Route>
  </>
);

export default AdminRoutes;
