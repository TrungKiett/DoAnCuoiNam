import { Route } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";
import DashboardHome from "../pages/admin/DashboardHome";
import UserManagement from "../pages/admin/UserManagement";
import ProductionPlans from "../pages/admin/ProductionPlans";
import WorkSchedule from "../pages/admin/WorkSchedule";
import CropAndSupplies from "../pages/admin/CropAndSupplies";
import AttendanceManagement from "../pages/admin/AttendanceManagement";
import CareMonitoring from "../pages/admin/CareMonitoring";
import TechnicalProcessing from "../pages/admin/TechnicalProcessing";
import ProductQRCode from "../pages/admin/ProductQRCode";

function AdminRouter() {
  return [
    <Route key="admin" path="/admin" element={<Dashboard />}>
      <Route path="dashboard" element={<DashboardHome />} />
      <Route path="accounts" element={<UserManagement />} />
      <Route path="plans" element={<ProductionPlans />} />
      <Route path="work-schedule" element={<WorkSchedule />} />
      <Route path="attendance" element={<AttendanceManagement />} />
      <Route path="care-monitoring" element={<CareMonitoring />} />
      <Route path="crops-supplies" element={<CropAndSupplies />} />
      <Route path="technical-processing" element={<TechnicalProcessing />} />
      <Route path="product-qrcode" element={<ProductQRCode />} />

    </Route>,
  ];
}

export default AdminRouter;
