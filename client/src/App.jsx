import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import SubmitReport from "./pages/SubmitReport";
import DashboardMap from "./components/DashboardMap";

function App() {
    return (
        <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/submit" element={<SubmitReport />} />
            <Route path="/" element={<DashboardMap />} />
        </Routes>
    );
}

export default App;