import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchUser(token);
    }
  }, []);

  async function fetchUser(token) {
    try {
      const { data } = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  }

  return (
    <nav className="bg-[#0b132b] text-white px-8 md:px-20 py-4 flex justify-between items-center shadow-md">
      {/* Brand */}
      <Link to="/" className="text-2xl font-bold tracking-tight">
        <span className="text-white">Medi</span>
        <span className="text-blue-400">Track</span>
      </Link>

      {/* Nav Links */}
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
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 text-gray-200">
                <span className="text-sm opacity-80">
                  Hi, <span className="font-semibold">{user.name}</span>
                </span>
              </div>
            )}

            {/* Dashboard Link */}
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-white transition font-medium"
            >
              Dashboard
            </Link>

            {/* Profile Link */}
            <Link
              to="/profile"
              className="text-gray-300 hover:text-white transition font-medium"
            >
              Profile
            </Link>

            {/* Logout Button */}
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
