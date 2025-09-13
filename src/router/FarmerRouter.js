import { Route } from "react-router-dom";
import DashboardHome from "../pages/admin/DashboardHome";
import WorkSchedule from "../pages/admin/WorkSchedule";
import Header from "../components/customer/Header";

function FarmerRouter() {
  return (
    <>
      <Route path="/farmer/dashboard" element={<DashboardHome />} />
      <Route path="/farmer/work-schedule" element={<WorkSchedule />} />
      <Route path="/manager-role" element={<Header />}>
        <Route path="work-schedule" element={<WorkSchedule />} />
      </Route>
    </>
  );
}

export default FarmerRouter;
