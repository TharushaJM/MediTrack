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

// ✅ This wrapper helps control where Navbar appears
function LayoutWrapper({ children }) {
  const location = useLocation();

  // Hide navbar on these routes
  const hideNavbarRoutes = ["/dashboard", "/reports", "/profile"];

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

          {/* Dashboard Pages (without Navbar) */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <DashboardLayout>
                <UserReports />
              </DashboardLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <UserProfile />
              </DashboardLayout>
            }
          />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}
