import { useEffect, useState } from "react";
import axios from "axios";
import { Bell, User } from "lucide-react";

export default function DashboardHeader() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
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

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      {/* Greeting */}
      <div>
        <h2 className="text-sm text-gray-600">
          Good morning,{" "}
          <span className="font-semibold text-gray-800">
            {user ? user.name : "User"}
          </span>
        </h2>
        <p className="text-xs text-gray-400">Track your health journey</p>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-4">
        <button className="text-gray-600 hover:text-blue-600">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
