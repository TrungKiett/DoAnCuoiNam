import { Route } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";
import DashboardHome from "../pages/admin/DashboardHome";
import UserManagement from "../pages/admin/UserManagement";
import ProductionPlans from "../pages/admin/ProductionPlans";
import WorkSchedule from "../pages/admin/WorkSchedule";
import CropAndSupplies from "../pages/admin/CropAndSupplies";
import AttendanceManagement from "../pages/admin/AttendanceManagement";
import CareMonitoring from "../pages/admin/CareMonitoring";
import WorkerManagement from "../pages/admin/WorkerManagement";
import PayrollReports from "../pages/admin/PayrollReports";
import TechnicalProcessing from "../pages/admin/TechnicalProcessing";
import ProductQRCode from "../pages/admin/ProductQRCode";
import QRCode from "../pages/admin/QR_Code";
import ProductionlHarvest from "../pages/admin/ProductionlHarvest";

function AdminRouter() {
  return [
    <Route key="admin" path="/admin" element={<Dashboard />}>
      {/* Trang tổng quan */}
      <Route path="dashboard" element={<DashboardHome />} />

      {/* Quản lý tài khoản */}
      <Route path="accounts" element={<UserManagement />} />

      {/* Kế hoạch sản xuất */}
      <Route path="plans" element={<ProductionPlans />} />

      {/* Lịch làm việc */}
      <Route path="work-schedule" element={<WorkSchedule />} />

      {/* Quản lý công nhân */}
      <Route path="worker-management" element={<WorkerManagement />} />

      {/* Chấm công */}
      <Route path="attendance" element={<AttendanceManagement />} />

      {/* Theo dõi chăm sóc */}
      <Route path="care-monitoring" element={<CareMonitoring />} />

      {/* Quản lý cây trồng và vật tư */}
      <Route path="crops-supplies" element={<CropAndSupplies />} />

      {/* Xử lý kỹ thuật */}
      <Route path="technical-processing" element={<TechnicalProcessing />} />

      {/* Báo cáo lương */}
      <Route path="payroll-reports" element={<PayrollReports />} />

      {/* Mã QR sản phẩm */}
      <Route path="product-qrcode" element={<ProductQRCode />} />

      {/* Chi tiết mã QR của từng giống */}
      <Route path="qrcode/:ma_giong" element={<QRCode />} />

      {/* Quản lý thu hoạch */}
      <Route path="product-harvest" element={<ProductionlHarvest />} />
    </Route>,
  ];
}

export default AdminRouter;
