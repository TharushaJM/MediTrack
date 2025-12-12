import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  doctorOnly = false, 
  patientOnly = false 
}) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  
  // Check if token exists
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Decode token to get user role
  let userRole;
  try {
    const decoded = jwtDecode(token);
    userRole = decoded.role;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // For admin-only routes
  if (adminOnly && userRole !== "admin") {
    return <Navigate to={userRole === "doctor" ? "/doctor-dashboard" : "/dashboard"} replace />;
  }

  // For doctor-only routes
  if (doctorOnly && userRole !== "doctor") {
    return <Navigate to={userRole === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  // For patient-only routes
  if (patientOnly && userRole !== "patient") {
    return <Navigate to={userRole === "admin" ? "/admin" : "/doctor-dashboard"} replace />;
  }

  return children;
}
