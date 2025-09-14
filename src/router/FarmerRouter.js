import { Route } from "react-router-dom";
import DashboardFarmer from "../pages/farmer/Dashboard";
import WorkSchedule from "../pages/farmer/manager-role/WorkSchedule";
import Header from "../components/customer/Header";

const FarmerRouter = () => {
  return (
    <>
      <Route path="/farmer/Dashboard" element={<DashboardFarmer />} />
      {/* <Route path="manager-role/WorkSchedule" element={<WorkSchedule />} /> */}
       <Route path="/manager-role" element={<Header />}>
        <Route path="WorkSchedule" element={<WorkSchedule />} />   {/*quản lí làm việc */}
      </Route>
    </>
  );
};

export default FarmerRouter;
