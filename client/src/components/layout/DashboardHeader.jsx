import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bell, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardHeader() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("Good morning");

  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  // -------------------------------
  //  Fetch user
  // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) fetchUser(token);
    fetchUnread();
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

  // -------------------------------
  //  Fetch unread notification count
  // -------------------------------
  async function fetchUnread() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/notifications/unread/count",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUnread(data.count);
    } catch (err) {
      console.log("Unread fetch failed", err);
    }
  }

  // -------------------------------
  //  Load full notifications list
  // -------------------------------
  async function loadNotifications() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(data);
    } catch (err) {
      console.log("Notification load error", err);
    }
  }

  // -------------------------------
  //  Mark all as read
  // -------------------------------
  async function markAllRead() {
    try {
      const token = localStorage.getItem("token");

      await Promise.all(
        notifications.map((n) =>
          axios.put(
            `http://localhost:5000/api/notifications/${n._id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setUnread(0);
      loadNotifications();
    } catch (err) {
      console.log("Error marking as read", err);
    }
  }

  // -------------------------------
  //  Greeting logic
  // -------------------------------
  function computeGreeting(now = new Date()) {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  }

  useEffect(() => {
    setGreeting(computeGreeting());
    const id = setInterval(() => setGreeting(computeGreeting()), 60000);
    return () => clearInterval(id);
  }, []);

  // -------------------------------
  //  Close dropdown on outside click
  // -------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b relative">
      {/* Greeting */}
      <div>
        <h2 className="text-sm text-gray-600">
          {greeting},{" "}
          <span className="font-semibold text-gray-800">
            {user ? user.firstName : "User"}
          </span>
        </h2>
        <p className="text-xs text-gray-400">Track your health journey</p>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-5 relative" ref={dropdownRef}>
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setOpen(!open);
              loadNotifications();
              markAllRead();
            }}
            className="text-gray-600 hover:text-blue-600 relative"
          >
            <Bell size={20} />

            {/* RED BADGE */}
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow">
                {unread}
              </span>
            )}
          </button>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
          <User size={16} />
        </div>

        {/* NOTIFICATION PANEL */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-14 w-72 bg-white border shadow-lg rounded-xl p-3"
            >
              <h3 className="font-semibold text-gray-700 mb-2">Notifications</h3>

              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">
                  No notifications yet.
                </p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div
                    key={n._id}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <CheckCircle2 className="text-blue-600 w-4 h-4 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.message}</p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
