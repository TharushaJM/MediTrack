import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  }

  return (
    <nav className="bg-[#0b132b] text-white px-8 md:px-20 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold tracking-tight">
        <span className="text-white">Medi</span>
        <span className="text-blue-400">Track</span>
      </Link>

      <div className="flex items-center gap-6">
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="text-gray-300 hover:text-white transition font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md font-medium hover:opacity-90 transition"
            >
              Get Started
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-white transition font-medium"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
