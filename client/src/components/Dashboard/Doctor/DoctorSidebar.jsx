import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

export default function DoctorSidebar({ activeMenu, setActiveMenu }) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-[#007BCE] dark:bg-gray-900 text-white flex flex-col justify-between border-r dark:border-gray-800 shadow-lg fixed left-0 top-0 h-screen overflow-y-auto z-40">
      <div className="flex-1">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 px-6 py-6 border-b border-blue-400/30 dark:border-gray-800 hover:bg-blue-600 dark:hover:bg-gray-800 transition-all sticky top-0 bg-[#007BCE] dark:bg-gray-900 z-10"
        >
          <div className="bg-white text-[#007BCE] dark:bg-gray-800 dark:text-blue-400 w-9 h-9 flex items-center justify-center rounded-full font-bold shadow-md">
            M
          </div>
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-white">Medi</span>
              <span className="text-white/90 dark:text-gray-300">Track</span>
            </h1>
            <p className="text-xs text-white/70 dark:text-gray-400">Doctor Portal</p>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="mt-4 px-3 space-y-1 pb-4">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            text="Dashboard"
            active={activeMenu === "dashboard"}
            onClick={() => setActiveMenu("dashboard")}
          />
          <NavItem
            icon={<Users size={20} />}
            text="My Patients"
            active={activeMenu === "patients"}
            onClick={() => setActiveMenu("patients")}
          />
          <NavItem
            icon={<Calendar size={20} />}
            text="Appointments"
            active={activeMenu === "appointments"}
            onClick={() => setActiveMenu("appointments")}
          />
          <NavItem
            icon={<FileText size={20} />}
            text="Reports"
            active={activeMenu === "reports"}
            onClick={() => setActiveMenu("reports")}
          />
          <NavItem
            icon={<UserCircle size={20} />}
            text="My Profile"
            active={activeMenu === "profile"}
            onClick={() => setActiveMenu("profile")}
          />
          <NavItem
            icon={<Settings size={20} />}
            text="Settings"
            active={activeMenu === "settings"}
            onClick={() => setActiveMenu("settings")}
          />
        </nav>
      </div>

      {/* Logout Button - Sticky at bottom */}
      <div className="border-t border-blue-400/30 dark:border-gray-800 sticky bottom-0 bg-[#007BCE] dark:bg-gray-900">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-sm text-white/90 hover:bg-blue-600 dark:hover:bg-gray-800 transition-all w-full group"
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

// Navigation Item Component - Matching Patient Sidebar Style
function NavItem({ icon, text, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full ${
        active
          ? "bg-white/10 dark:bg-gray-800 text-white shadow-md border-l-4 border-white"
          : "text-white/80 hover:bg-white/5 dark:hover:bg-gray-800/50 hover:text-white hover:pl-5"
      }`}
    >
      <span className="transition-transform duration-200">
        {icon}
      </span>
      <span>{text}</span>
    </button>
  );
}
