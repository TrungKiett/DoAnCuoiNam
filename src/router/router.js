import { Routes, Route } from "react-router-dom";
import CustomerRouter from "./CustomerRouter";
import AdminRouter from "./AdminRouter";
import FarmerRouter from "./FarmerRouter";

function AppRouter() {
    return (
        <Routes>
            {CustomerRouter()}
            {AdminRouter()}
            {FarmerRouter()}
            <Route path="*" element={null} />
        </Routes>
    );
}

export default AppRouter;