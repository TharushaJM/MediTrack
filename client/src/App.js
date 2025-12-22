import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar/Navbar";
import Landing from "./components/Landing/Landing";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import RoleSelection from "./components/Register/RoleSelection";
import PatientRegister from "./components/Register/PatientRegister";
import DoctorRegister from "./components/Register/DoctorRegister";
import Dashboard from "./components/Dashboard/Dashboard";
import UserReports from "./components/Reports/UserReports";
import UserProfile from "./components/Profile/UserProfile";
import DashboardLayout from "./components/layout/DashboardSidebar";
import HealthAssistant from "./components/AI/HealthAssistant";
import MedicationReminder from "./components/MedicationReminder/MedicationReminder";
import AdminDashboard from "./components/Dashboard/Admin/AdminDashboard";
import DoctorDashboard from "./components/Dashboard/Doctor/DoctorDashBoard";
import FindDoctor from "./components/Dashboard/Patient/FindDoctor";
import BookAppointment from "./components/Dashboard/Patient/BookAppointment";
import MyAppointments from "./components/Dashboard/Patient/MyAppointments";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientChat from "./components/Dashboard/Patient/PatientChat";

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
    "/find-doctor",
    "/book-appointment",
    "/my-appointments",
    "/admin",
    "/doctor-dashboard",
    "/choose-role",
    "/register/patient",
    "/register/doctor",
    "/login",
    "/chat",
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

          {/* Registration Flow */}
          <Route path="/choose-role" element={<RoleSelection />} />
          <Route path="/register/patient" element={<PatientRegister />} />
          <Route path="/register/doctor" element={<DoctorRegister />} />
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
            path="/find-doctor"
            element={
              <ProtectedRoute patientOnly={true}>
                <DashboardLayout>
                  <FindDoctor />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute patientOnly={true}>
                <DashboardLayout>
                  <PatientChat />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute patientOnly={true}>
                <DashboardLayout>
                  <MyAppointments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute patientOnly={true}>
                <DashboardLayout>
                  <BookAppointment />
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
