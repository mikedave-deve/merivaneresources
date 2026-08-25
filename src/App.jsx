import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./components/Header";
import Footer from "./components/Footer";
import RoleTicker from "./components/RoleTicker";
import JobDetailModal from "./components/JobDetailModal";
import { useApp } from "./context/AppContext";

import Home from "./pages/Home";
import About from "./pages/About";
import Jobs from "./pages/Jobs";
import Team from "./pages/Team";
import SubmitResume from "./pages/SubmitResume";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import EmployeePortal from "./pages/portal/EmployeePortal";
import Dashboard from "./pages/portal/Dashboard";
import Profile from "./pages/portal/Profile";
import Missions from "./pages/portal/Missions";
import Attendance from "./pages/portal/Attendance";
import TimeOff from "./pages/portal/TimeOff";
import ActivityHistory from "./pages/portal/ActivityHistory";
import Documents from "./pages/portal/Documents";
import InformationSetup from "./pages/portal/InformationSetup";
import IdentityVerification from "./pages/portal/IdentityVerification";
import Payroll from "./pages/portal/Payroll";
import Retirement from "./pages/portal/Retirement";
import Equipment from "./pages/portal/Equipment";
import CompanyServices from "./pages/portal/CompanyServices";
import Directory from "./pages/portal/Directory";
import Notifications from "./pages/portal/Notifications";
import Settings from "./pages/portal/Settings";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function App() {
  const { isAuthed } = useApp();
  const { pathname } = useLocation();
  const isPortal = pathname.startsWith("/portal");
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAuthPage && !isPortal && <Header isAuthed={isAuthed} />}
      {!isPortal && !isAuthPage && <RoleTicker />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Routes location={pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/team" element={<Team />} />
              <Route path="/submit-resume" element={<SubmitResume />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/portal" element={<EmployeePortal />}>
                <Route index element={<Navigate to="/portal/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="missions" element={<Missions />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="time-off" element={<TimeOff />} />
                <Route path="history" element={<ActivityHistory />} />
                <Route path="documents" element={<Documents />} />
                <Route path="info-setup" element={<InformationSetup />} />
                <Route path="identity" element={<IdentityVerification />} />
                <Route path="payroll" element={<Payroll />} />
                <Route path="retirement" element={<Retirement />} />
                <Route path="equipment" element={<Equipment />} />
                <Route path="services" element={<CompanyServices />} />
                <Route path="directory" element={<Directory />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
              </Route>
              <Route path="*" element={<Home />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isPortal && !isAuthPage && <Footer />}
      <JobDetailModal />
    </div>
  );
}
