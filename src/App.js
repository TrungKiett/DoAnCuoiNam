// import logo from './logo.svg';
// import React  from "react";

import './App.css';
import AppRouter from './router/router';
import ForgotPassword from './pages/auth/Forgot';
import FarmerLayout from './components/farmer/FarmerLayout';
 import ChatGemini from './pages/admin/ChatBox'; 
function App() {
    return ( 
        <AppRouter />
        //  <Header />
        // <ChatGemini />
    );
}

export default App;