
import PatientDashboard from "./Patient/PatientDashboard";
import DoctorDashboard from "./Doctor/DoctorDashBoard";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  return (
    <div className="p-6">
      {role === "doctor" ? <DoctorDashboard /> : <PatientDashboard />}
    </div>
  );
}
