import { Route } from "react-router-dom";
import DashboardFarmer from "../pages/farmer/Dashboard";
import WorkSchedule from "../pages/farmer/WorkSchedule";
import Header from "../components/customer/Header";

function FarmerRouter() {
  return (
    <>
      <Route path="/farmer/Dashboard" element={<DashboardFarmer />} />
      <Route path="/farmer/work-schedule" element={<WorkSchedule />} />
      <Route path="/manager-role" element={<Header />}>
        <Route path="work-schedule" element={<WorkSchedule />} />
      </Route>
    </>
  );
}

export default FarmerRouter;
