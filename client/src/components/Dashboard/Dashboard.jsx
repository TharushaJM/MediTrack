// Dashboard.jsx
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashBoard";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  return (
    <div className="p-6">
      {role === "doctor" ? <DoctorDashboard /> : <PatientDashboard />}
    </div>
  );
}
