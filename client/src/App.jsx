// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import DashboardMap from "./components/DashboardMap";

function App() {
    const isAuthenticated = !!localStorage.getItem("token");

    return (
        <Routes>
            <Route path="/" element={isAuthenticated ? <DashboardMap /> : <Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}

export default App;