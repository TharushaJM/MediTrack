import { NavLink, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, FileText, User, LogOut, AlarmClock, Brain, Activity } from "lucide-react";
import DashboardHeader from "./DashboardHeader";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-[#007BCE] dark:bg-gray-900 text-white flex flex-col justify-between border-r dark:border-gray-800 shadow-lg">
        <div>
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 px-6 py-6 border-b border-blue-400/30 dark:border-gray-800 hover:bg-blue-600 dark:hover:bg-gray-800 transition-all"
          >
            <div className="bg-white text-[#007BCE] dark:bg-gray-800 dark:text-blue-400 w-9 h-9 flex items-center justify-center rounded-full font-bold shadow-md">
              M
            </div>
            <h1 className="text-xl font-bold">
              <span className="text-white">Medi</span>
              <span className="text-white/90 dark:text-gray-300">Track</span>
            </h1>
          </Link>

          {/* Nav Links */}
          <nav className="mt-4 px-3 space-y-1">
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
            />

            <NavItem
              to="/reports"
              icon={<FileText size={20} />}
              text="Reports"
            />
            <NavItem
              to="/assistant"
              icon={<Brain size={20} />}
              text="AI Health"
            />
            <NavItem
              to="/reminders"
              icon={<AlarmClock size={20} />}
              text="Reminders"
            />
            <NavItem 
              to="/profile" 
              icon={<User size={20} />} 
              text="Profile" 
            />
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-blue-400/30 dark:border-gray-800">
          {user && (
            <div className="px-6 py-4 border-b border-blue-400/20 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-400 dark:bg-gray-800 rounded-full flex items-center justify-center font-semibold text-white">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-white/70 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 text-sm text-white/90 hover:bg-blue-600 dark:hover:bg-gray-800 transition-all w-full group"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="p-6 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, text }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-white/10 dark:bg-gray-800 text-white shadow-md border-l-4 border-white"
            : "text-white/80 hover:bg-white/5 dark:hover:bg-gray-800/50 hover:text-white hover:pl-5"
        }`
      }
    >
      <span className={`transition-transform duration-200`}>
        {icon}
      </span>
      <span>{text}</span>
    </NavLink>
  );
}
