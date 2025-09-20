import { Routes } from "react-router-dom";
import CustomerRouter from "./CustomerRouter";
import AdminRouter from "./AdminRouter";
import FarmerRouter from "./FarmerRouter";

function AppRouter() {
    const allRoutes = [
        ...CustomerRouter(),
        ...AdminRouter(),
        ...FarmerRouter()
    ];
    
    return (
        <Routes>
            {allRoutes}
        </Routes>
    );
}

export default AppRouter;