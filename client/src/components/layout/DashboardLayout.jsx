import { NavLink, useNavigate , Link} from "react-router-dom";
import { LayoutDashboard, FileText, User, LogOut } from "lucide-react";
import DashboardHeader from "./DashboardHeader";


export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-60 bg-[#007BCE] text-white flex flex-col justify-between">
        <div>
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-5 border-b border-blue-400 hover:bg-black-50 transition"
          >
            <div className="bg-white text-[#007BCE] w-7 h-7 flex items-center justify-center rounded-full font-bold shadow-sm">
              M
            </div>
            <h1>
            <span className="text-white">Medi</span>
            <span className="text-black">Track</span>
            </h1>
          </Link>

          {/* Nav Links */}
          <nav className="mt-6 space-y-1">
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard size={18} />}
              text="Dashboard"
            />
            
            <NavItem
              to="/reports"
              icon={<FileText size={18} />}
              text="Reports"
            />
            <NavItem
              to="/assistant"
              icon={<FileText size={18} />}
              text="AI Helth"
              />
            <NavItem to="/profile" icon={<User size={18} />} text="Profile" />
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 text-sm text-white/90 hover:bg-blue-500 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, text }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-5 py-2.5 text-sm transition ${
          isActive
            ? "bg-blue-500 text-white"
            : "text-white/90 hover:bg-blue-400 hover:text-white"
        }`
      }
    >
      {icon}
      {text}
    </NavLink>
  );
}
