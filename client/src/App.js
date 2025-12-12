import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar/Navbar";
import Landing from "./components/Landing/Landing";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import UserReports from "./components/Reports/UserReports";
import UserProfile from "./components/Profile/UserProfile";
import DashboardLayout from "./components/layout/DashboardLayout";
import HealthAssistant from "./components/AI/HealthAssistant";
import MedicationReminder from "./components/MedicationReminder/MedicationReminder";
import AdminDashboard from "./components/Dashboard/Admin/AdminDashboard";
import DoctorDashboard from "./components/Dashboard/Doctor/DoctorDashBoard";
import ProtectedRoute from "./components/ProtectedRoute";

//  This wrapper helps control where Navbar appears
function LayoutWrapper({ children }) {
  const location = useLocation();

  // Hide navbar on these routes
  const hideNavbarRoutes = [
    "/dashboard",
    "/reports",
    "/profile",
    "/assistant",
    "/reminders",
    "/admin",
    "/doctor-dashboard",
  ];

  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          {/* Public Pages (with Navbar) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Dashboard - Admin Only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Doctor Dashboard - Doctor Only */}
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute doctorOnly={true}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Patient Dashboard Pages - Patient Only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute patientOnly={true}>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute patientOnly={true}>
                <DashboardLayout>
                  <UserReports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute patientOnly={true}>
                <DashboardLayout>
                  <HealthAssistant />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute patientOnly={true}>
                <DashboardLayout>
                  <MedicationReminder />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute patientOnly={true}>
                <DashboardLayout>
                  <UserProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}
