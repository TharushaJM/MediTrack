import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DoctorSidebar({ activeMenu, setActiveMenu, darkMode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border-r z-40 flex flex-col`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 py-6 border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
        <div className="bg-blue-600 w-10 h-10 flex items-center justify-center rounded-xl font-bold text-white shadow-lg">
          M
        </div>
        <div>
          <h1 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>MediTrack</h1>
          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Doctor Portal</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={activeMenu === "dashboard"}
          onClick={() => setActiveMenu("dashboard")}
          darkMode={darkMode}
        />
        <NavItem
          icon={<Users size={20} />}
          text="My Patients"
          active={activeMenu === "patients"}
          onClick={() => setActiveMenu("patients")}
          darkMode={darkMode}
        />
        <NavItem
          icon={<Calendar size={20} />}
          text="Appointments"
          active={activeMenu === "appointments"}
          onClick={() => setActiveMenu("appointments")}
          darkMode={darkMode}
        />
        <NavItem
          icon={<FileText size={20} />}
          text="Reports"
          active={activeMenu === "reports"}
          onClick={() => setActiveMenu("reports")}
          darkMode={darkMode}
        />
        <NavItem
          icon={<Settings size={20} />}
          text="Settings"
          active={activeMenu === "settings"}
          onClick={() => setActiveMenu("settings")}
          darkMode={darkMode}
        />
      </nav>

      {/* Bottom Section */}
      <div className={`border-t ${darkMode ? "border-gray-800" : "border-gray-200"} p-4`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full ${
            darkMode
            ? "text-gray-400 hover:text-white hover:bg-gray-800"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

// Navigation Item Component
function NavItem({ icon, text, active, onClick, darkMode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
          : darkMode
          ? "text-gray-400 hover:text-white hover:bg-gray-800"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="font-medium">{text}</span>
    </button>
  );
}
