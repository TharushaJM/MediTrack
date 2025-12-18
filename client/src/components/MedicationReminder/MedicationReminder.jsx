import { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle2, Bell } from "lucide-react";
import AddReminderForm from "./AddReminderForm";
import ReminderCard from "./ReminderCard";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">

        {/* ---------------- HEADER ---------------- */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Medication Reminders</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Stay on track with your daily medications — never miss a dose again.
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 
              bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
              text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl 
              transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" /> Add Reminder
          </button>
        </header>

        {/* ---------------- REMINDER LIST ---------------- */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Upcoming Reminders
          </h2>

          {reminders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center text-gray-500 dark:text-gray-400">
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
        <section className="mt-12 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /> Daily Summary
          </h2>

          {summary.total === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Add reminders to start tracking.</p>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                You’ve taken <strong>{summary.taken}</strong> out of{" "}
                <strong>{summary.total}</strong> medications today.
              </p>

              <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
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

