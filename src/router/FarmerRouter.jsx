import { Route } from "react-router-dom";
import DashboardFarmer from "../pages/farmer/Dashboard";
import WorkSchedule from "../pages/farmer/manager-role/WorkSchedule";
import Header from "../components/farmer/Header";
import LoginPhone from "../pages/auth/Login";

const FarmerRouter = () => {
  return (
    <>
      {/* đăng nhâp */}
      <Route path="/pages/auth/Login" element={<LoginPhone />} />
      <Route path="/farmer/Dashboard" element={<DashboardFarmer />} />

      {/*   quản lí làm việc*/}
      <Route path="/manager-role" element={<Header />}>
        {/* menu chức năng của nông dân */}
        <Route path="WorkSchedule" element={<WorkSchedule />} />
      </Route>

    </>
  );
};

export default FarmerRouter;
