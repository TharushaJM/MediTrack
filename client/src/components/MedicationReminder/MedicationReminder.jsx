import { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle2, Bell } from "lucide-react";
import AddReminderForm from "./AddReminderForm";
import ReminderCard from "./ReminderCard";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import clockImage from "../MedicationReminder/clockimage.png";

export default function MedicationReminder() {
  const [reminders, setReminders] = useState([]);
  const [summary, setSummary] = useState({ total: 0, taken: 0, progress: 0 });
  const [open, setOpen] = useState(false);

  // ------------------------------------------
  // Fetch Reminders
  // ------------------------------------------
  async function fetchReminders() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get("http://localhost:5000/api/reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReminders(data);
      fetchSummary(); // update summary each time
    } catch (err) {
      console.error("Error fetching reminders:", err);
    }
  }

  useEffect(() => {
    fetchReminders();
  }, []);

  // ------------------------------------------
  // Fetch Daily Summary
  // ------------------------------------------
  async function fetchSummary() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/reminders/summary/today",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  }

  // ------------------------------------------
  // Add New Reminder
  // ------------------------------------------
  const handleCreated = () => {
    fetchReminders();
  };

  // ------------------------------------------
  // Delete Reminder
  // ------------------------------------------
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchReminders();
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };
  

  // ------------------------------------------
  // Toggle Taken Status
  // ------------------------------------------
const handleToggleTaken = async (id, newState) => {
  // The child already sends the PUT request to update the server.
  // Here we only refresh the UI state (summary and reminders list).
  try {
    await fetchSummary();
    // optionally refresh the reminders list so UI stays in sync
    await fetchReminders();
  } catch (err) {
    console.error("Error refreshing summary/reminders:", err);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* ---------------- HEADER ---------------- */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <img src={clockImage} alt="Medication Reminder" className="w-16 h-16" />
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

        {/* ---------------- REMINDER LIST ---------------- */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Upcoming Reminders
          </h2>

          {reminders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
              No reminders yet. Click <span className="font-semibold">“Add Reminder”</span> to create one.
            </div>
          ) : (
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {reminders.map((r) => (
                  <ReminderCard
                    key={r._id}
                    reminder={r}
                    onDelete={handleDelete}
                    onToggleTaken={handleToggleTaken}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* ---------------- ADD REMINDER MODAL ---------------- */}
        {open && (
          <AddReminderForm onClose={() => setOpen(false)} onCreated={handleCreated} />
        )}

        {/* ---------------- DAILY SUMMARY ---------------- */}
        <section className="mt-12 bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" /> Daily Summary
          </h2>

          {summary.total === 0 ? (
            <p className="text-gray-500 text-sm">Add reminders to start tracking.</p>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-3">
                You’ve taken <strong>{summary.taken}</strong> out of{" "}
                <strong>{summary.total}</strong> medications today.
              </p>

              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{ width: `${summary.progress * 100}%` }}
                />
              </div>
            </>
          )}
        </section>

        {/* ---------------- WIDGET ---------------- */}
        <div className="flex justify-center items-center gap-2 text-sm text-gray-400 mt-8">
          <Bell className="w-4 h-4" />
          Notifications are active — You'll get alerts before each dose.
        </div>
      </div>
    </div>
  );
}
