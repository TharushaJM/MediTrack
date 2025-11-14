import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bell, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardHeader() {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("Good morning");

  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearing, setClearing] = useState(false);
  // TODO: integrate app toast if available

  const dropdownRef = useRef(null);

  // ---------------------------------------
  // Fetch User Profile
  // ---------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
      fetchUnread();
    }
  }, []);

  async function fetchUser(token) {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(data);
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  }

  // ---------------------------------------
  // Fetch unread notification count
  // ---------------------------------------
  async function fetchUnread() {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/notifications/unread/count",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnread(data.count);
    } catch (err) {
      console.log("Unread fetch error:", err);
    }
  }

  // 🔄 Poll every 10 seconds for new notifications
  useEffect(() => {
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------
  // Load full notifications list
  // ---------------------------------------
  async function loadNotifications() {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(data);
      return data;
    } catch (err) {
      console.log("Notification load error", err);
      return [];
    }
  }

  // ---------------------------------------
  // Mark all as read (uses bulk endpoint if available)
  // ---------------------------------------
  async function markAllRead(notes = []) {
    const token = localStorage.getItem("token");
    if (!notes || notes.length === 0) {
      setUnread(0);
      return;
    }

    setMarkingAll(true);
    try {
      // Prefer bulk endpoint when available to avoid multiple requests
      await axios.put(
        "http://localhost:5000/api/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // refresh the notifications list from server (includes read flags)
      const updated = await loadNotifications();
      setNotifications(updated || []);

      // refresh unread count from server to be safe
      await fetchUnread();
    } catch (err) {
      console.log("Mark all read error:", err);
    } finally {
      setMarkingAll(false);
    }
  }

  // ---------------------------------------
  // Handle bell click
  // ---------------------------------------
  async function handleBellClick() {
    const newOpen = !open;
    setOpen(newOpen);

    if (newOpen) {
      await loadNotifications();
    }
  }

  // ---------------------------------------
  // Greeting Logic
  // ---------------------------------------
  function computeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  }

  useEffect(() => {
    setGreeting(computeGreeting());
    const timer = setInterval(() => setGreeting(computeGreeting()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ---------------------------------------
  // Close dropdown on outside click
  // ---------------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b relative">
      {/* Greeting Section */}
      <div>
        <h2 className="text-sm text-gray-600">
          {greeting},{" "}
          <span className="font-semibold text-gray-800">
            {user ? user.firstName : "User"}
          </span>
        </h2>
        <p className="text-xs text-gray-400">Track your health journey</p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5 relative" ref={dropdownRef}>
        {/* Bell Icon */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="text-gray-600 hover:text-blue-600 relative transition"
          >
            <Bell
              size={20}
              className={`${unread > 0 ? "animate-bounce" : ""}`}
            />

            {/* Red Badge */}
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow">
                {unread}
              </span>
            )}
          </button>
        </div>

        {/* User Icon */}
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
          <User size={16} />
        </div>

        {/* Notification Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-14 w-80 bg-white border shadow-lg rounded-xl p-0 overflow-hidden z-50"
            >
              {/* HEADER */}
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-700">Notifications</h3>
              </div>

              {/* LIST */}
              <div className="max-h-64 overflow-y-auto px-2 py-2">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-sm py-6 text-center">
                    No notifications.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 rounded-lg mb-2 border last:mb-0 ${
                        n.read
                          ? "bg-gray-50 text-gray-500"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs">{n.message}</p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* FOOTER BUTTONS */}
              {notifications.length > 0 && (
                <div className="flex justify-between items-center px-4 py-3 border-t bg-white">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await markAllRead(notifications || []);
                    }}
                    disabled={markingAll}
                    className={`text-xs px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 
              ${markingAll ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {markingAll ? "Marking..." : "Mark all as read"}
                  </button>

                  {notifications.some((n) => n.read) && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setClearing(true);
                        try {
                          const token = localStorage.getItem("token");
                          await axios.delete(
                            "http://localhost:5000/api/notifications/clear-read",
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          await loadNotifications();
                          await fetchUnread();
                        } catch (err) {
                          console.error(
                            "Failed to clear read notifications",
                            err
                          );
                        } finally {
                          setClearing(false);
                        }
                      }}
                      disabled={clearing}
                      className={`text-xs px-3 py-1 rounded-md border border-red-600 text-red-600 hover:bg-red-50 
                ${clearing ? "opacity-50 pointer-events-none" : ""}`}
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
    </header>
  );
}
