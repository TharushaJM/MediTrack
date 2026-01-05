import { useState, useEffect, useRef } from "react";
import { Bell, Search, Moon, Sun } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";

export default function DoctorHeader({ doctor }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { darkMode, toggleDarkMode } = useTheme();

  // notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearing, setClearing] = useState(false);

  const notifRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Get profile image URL
  const getProfileImage = () => {
    if (doctor?.profileImage) {
      if (doctor.profileImage.startsWith("http")) return doctor.profileImage;
      return `${API_URL}${doctor.profileImage}`;
    }
    return null;
  };

  const profileImage = getProfileImage();
  const getToken = () => localStorage.getItem("token");

  async function fetchUnreadCount() {
    try {
      const token = getToken();
      const res = await axios.get(`${API_URL}/api/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.log("Unread count error:", err?.response?.data || err.message);
    }
  }

  async function loadNotifications() {
    try {
      const token = getToken();
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
      return res.data || [];
    } catch (err) {
      console.log(
        "Fetch notifications error:",
        err?.response?.data || err.message
      );
      setNotifications([]);
      return [];
    }
  }

  async function markOneRead(id) {
    try {
      const token = getToken();
      await axios.put(
        `${API_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.log("Mark read error:", err?.response?.data || err.message);
    }
  }

  async function markAllRead() {
    try {
      const token = getToken();
      setMarkingAll(true);

      await axios.put(
        `${API_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.log("Mark all read error:", err?.response?.data || err.message);
    } finally {
      setMarkingAll(false);
    }
  }

  async function clearRead() {
    try {
      const token = getToken();
      setClearing(true);

      await axios.delete(`${API_URL}/api/notifications/clear-read`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await loadNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.log("Clear read error:", err?.response?.data || err.message);
    } finally {
      setClearing(false);
    }
  }

  // Load unread count once
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Poll every 10 seconds (same as patient header)
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleBellClick() {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) {
      await loadNotifications();
      await fetchUnreadCount();
    }
  }

  const hasRead = notifications.some((n) => n.read);

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

        {/* Right side */}
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

          {/* Notifications (patient-style dropdown) */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleBellClick}
              className="text-gray-600 hover:text-blue-600 relative transition dark:text-gray-200"
              aria-label="Notifications"
            >
              <Bell
                size={20}
                className={`${unreadCount > 0 ? "animate-bounce" : ""}`}
              />

              {/* Red Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-14 w-80
                             bg-white dark:bg-gray-800
                             border dark:border-gray-700
                             shadow-lg rounded-xl p-4 z-50"
                >
                  {/* HEADER */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                      Notifications
                    </h3>
                  </div>

                  {/* LIST */}
                  <div className="max-h-64 overflow-y-auto px-2 py-2">
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-300 text-sm py-6 text-center">
                        No notifications.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.read) markOneRead(n._id);
                          }}
                          className={`p-3 rounded-lg mb-2 border dark:border-gray-700 last:mb-0 cursor-pointer ${
                            n.read
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                              : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs">{n.message}</p>
                          <span className="text-[10px] text-gray-400">
                            {n.createdAt
                              ? new Date(n.createdAt).toLocaleTimeString()
                              : ""}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* FOOTER BUTTONS */}
                  {notifications.length > 0 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t dark:border-gray-700">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await markAllRead();
                        }}
                        disabled={markingAll}
                        className={`text-xs px-3 py-1 rounded-md border border-blue-600 dark:border-blue-500
                          text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition
                          ${
                            markingAll ? "opacity-50 pointer-events-none" : ""
                          }`}
                      >
                        {markingAll ? "Marking..." : "Mark all as read"}
                      </button>

                      {hasRead && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await clearRead();
                          }}
                          disabled={clearing}
                          className={`text-xs px-3 py-1 rounded-md border border-red-600 dark:border-red-500
                            text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition
                            ${
                              clearing ? "opacity-50 pointer-events-none" : ""
                            }`}
                        >
                          {clearing ? "Clearing..." : "Clear read"}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
