import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SubmitReport from "./pages/SubmitReport";
import DashboardMap from "./components/DashboardMap";
import MyReports from "./pages/MyReports";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
    return (
        <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<DashboardLayout />}>
                <Route path="dashboard" element={<DashboardMap />} />
                <Route path="submit" element={<SubmitReport />} />
                <Route path="my-reports" element={<MyReports />} />
            </Route>
        </Routes>
    );
}

export default App;