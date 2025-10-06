// import logo from './logo.svg';
// import React  from "react";

import './App.css';
import AppRouter from './router/router';
import ForgotPassword from './pages/auth/Forgot';
 import FarmerLayout from './components/farmer/FarmerLayout';
 import Weather from './components/admin/Weather_AI';

function App() {
    return ( 
    <AppRouter />
        //  <Header />
    );
}

export default App;