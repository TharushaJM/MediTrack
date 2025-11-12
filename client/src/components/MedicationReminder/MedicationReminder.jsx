import { useState, useEffect } from "react";
import { Plus, Clock, Pill, CheckCircle2, Bell, Trash2 } from "lucide-react";
import AddReminderForm from "./AddReminderForm";
import ReminderCard from "./ReminderCard";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import clockImage from "../MedicationReminder/clockimage.png";


export default function MedicationReminder() {
  const [reminders, setReminders] = useState([]);
  const [open, setOpen] = useState(false);

  // Fetch reminders from backend
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/reminders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReminders(data);
      } catch (err) {
        console.error("Error fetching reminders:", err);
      }
    };
    fetchReminders();
  }, []);

  // Add reminder (callback)
  const handleCreated = (reminder) => setReminders((prev) => [...prev, reminder]);

  // Delete reminder
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <img
              src={clockImage}
              alt="Medication Reminder"
              className="w-16 h-16"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Medication Reminders</h1>
              <p className="text-gray-500 text-sm">
                Stay on track with your daily medications — never miss a dose again.
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5" /> Add Reminder
          </button>
        </header>

        {/* Active Reminders Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Upcoming Reminders
          </h2>

          {reminders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
              No reminders yet. Click <span className="font-semibold">“Add Reminder”</span> to create one.
            </div>
          ) : (
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {reminders.map((r) => (
                  <ReminderCard
                    key={r._id}
                    reminder={r}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* Add Reminder Modal */}
        {open && (
          <AddReminderForm
            onClose={() => setOpen(false)}
            onCreated={handleCreated}
          />
        )}

        {/* Daily Summary Section */}
        <section className="mt-12 bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" /> Daily Summary
          </h2>
          <p className="text-gray-500 text-sm mb-3">
            You’ve taken 3 out of 5 medications today. Keep it up!
          </p>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-500"
              style={{ width: "60%" }}
            />
          </div>
        </section>

        {/* Notification Info */}
        <div className="flex justify-center items-center gap-2 text-sm text-gray-400 mt-8">
          <Bell className="w-4 h-4" />
          Notifications are active — you’ll get alerts before each dose.
        </div>
      </div>
    </div>
  );
}
