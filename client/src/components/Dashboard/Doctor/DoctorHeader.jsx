import { useState } from "react";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

export default function DoctorHeader({ doctor }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { darkMode, toggleDarkMode } = useTheme();

  // Get profile image URL
  const getProfileImage = () => {
    if (doctor?.profileImage) {
      // Check if it's a full URL (from seeder with Unsplash)
      if (doctor.profileImage.startsWith("http")) {
        return doctor.profileImage;
      }
      // Local upload
      return `http://localhost:5000${doctor.profileImage}`;
    }
    return null;
  };

  const profileImage = getProfileImage();

  return (
    <header
      className={`${
        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      } border-b px-8 py-3 sticky top-0 z-30`}
    >
      <div className="flex items-center justify-between">
        {/* Left - Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search patients, appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>

        {/* Right - Notifications and Profile */}
        <div className="flex items-center gap-4 ml-6">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${
              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
            } transition`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              />
            ) : (
              <Moon
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              />
            )}
          </button>

          {/* Notifications */}
          <button
            className={`relative p-2 rounded-lg ${
              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
            } transition`}
            aria-label="Notifications"
          >
            <Bell
              className={`w-5 h-5 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          {/* Doctor Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Dr. {doctor?.firstName} {doctor?.lastName}
              </p>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {doctor?.specialization || "Cardiologist"}
              </p>
            </div>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white shadow-md">
                {doctor?.firstName?.charAt(0)}
                {doctor?.lastName?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

