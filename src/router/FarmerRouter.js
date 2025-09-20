import { Route } from "react-router-dom";
import DashboardFarmer from "../pages/farmer/Dashboard";
import WorkSchedule from "../pages/farmer/WorkSchedule";
import Header from "../components/customer/Header";

function FarmerRouter() {
  return [
    <Route key="farmer-dashboard" path="/farmer/Dashboard" element={<DashboardFarmer />} />,
    <Route key="farmer-work-schedule" path="/farmer/work-schedule" element={<WorkSchedule />} />,
    <Route key="manager-role" path="/manager-role" element={<Header />}>
      <Route path="work-schedule" element={<WorkSchedule />} />
    </Route>
  ];
}

export default FarmerRouter;
