import { Routes, Route } from "react-router-dom";
import CustomerRouter from "./CustomerRouter";
import AdminRoutes from "./AdminRouter";

function AppRouter() {
  return (
    <Routes>
      {/* Gọi các route con */}
      {CustomerRouter}
      {AdminRoutes}
    </Routes>
  );
}

export default AppRouter;
