import { Route } from "react-router-dom";
import FarmerDashboard from "../pages/farmer/FarmerDashboard";
import FarmerWorkSchedule from "../pages/farmer/FarmerWorkSchedule";
import FarmerTechnical from "../pages/farmer/FarmerTechnical";
import Header from "../components/customer/Header";
import AgriculturalHarvest from "../pages/farmer/AgriculturalHarvest";
import FarmerPayroll from "../pages/farmer/FarmerPayroll";
import FarmerPayroll_User from "../pages/farmer/FarmerPayroll_User";

function FarmerRouter() {
    return [ <
        Route
        key = "farmer-dashboard"
        path = "/farmer/Dashboard"
        element = { < FarmerDashboard / > }
        />, <
        Route
        key = "farmer-work-schedule"
        path = "/farmer/WorkSchedule"
        element = { < FarmerWorkSchedule / > }
        />, <
        Route
        key = "farmer-work-technical"
        path = "/farmer/Technical"
        element = { < FarmerTechnical / > }
        />, <
        Route
        key = "farmer-work-harvest"
        path = "/farmer/Agricultural-Harvest"
        element = { < AgriculturalHarvest / > }
        />, <
        Route
        key = "farmer-payroll"
        path = "/farmer/Payroll"
        element = { < FarmerPayroll / > }
        />, <
        Route
        key = "farmer-payroll-user"
        path = "/farmer/FarmerPayroll_User"
        element = { < FarmerPayroll_User / > }
        />, <
        Route key = "manager-role"
        path = "/manager-role"
        element = { < Header / > } >
        <
        Route path = "work-schedule"
        element = { < FarmerWorkSchedule / > }
        />{" "} <
        /Route>,
    ];
}

export default FarmerRouter;