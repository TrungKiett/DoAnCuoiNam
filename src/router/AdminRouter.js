import { Route } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";
import DashboardHome from "../pages/admin/DashboardHome";
import UserManagement from "../pages/admin/UserManagement";
import ProductionPlans from "../pages/admin/ProductionPlans";
import WorkSchedule from "../pages/admin/WorkSchedule";

function AdminRouter() {
  return (
    <>
      <Route path="/admin" element={<Dashboard />}>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="accounts" element={<UserManagement />} />
        <Route path="plans" element={<ProductionPlans />} />
        <Route path="work-schedule" element={<WorkSchedule />} />
      </Route>
    </>
  );
}

export default AdminRouter;