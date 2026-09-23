import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import SuccessPage from "./pages/SuccessPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-navy-950">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registrer" element={<RegisterPage />} />
          <Route path="/registrert/:resourceId" element={<SuccessPage />} />
          <Route path="/kart" element={<DashboardPage />} />
          <Route path="/myndighetsportal" element={<Navigate to="/kart" replace />} />
        </Routes>
      </main>
    </div>
  );
}
