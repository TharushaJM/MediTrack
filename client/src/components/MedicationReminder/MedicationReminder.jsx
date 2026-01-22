import { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle2, Bell, Pill, Calendar, TrendingUp, Target } from "lucide-react";
import AddReminderForm from "./AddReminderForm";
import ReminderCard from "./ReminderCard";
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

  // Calculate adherence streak
  const calculateStreak = () => {
    // This is a simplified calculation - you might want to implement more sophisticated logic
    return summary.taken === summary.total && summary.total > 0 ? "100%" : `${Math.round(summary.progress * 100)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* ---------------- HEADER ---------------- */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Pill className="w-7 h-7 text-white" />
              </div>
              Medication Reminders
            </h1>
            <p className="text-gray-600 dark:text-gray-400 ml-15">
              Stay on track with your daily medications — never miss a dose again.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
              text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl 
              transition-all duration-200 font-semibold"
          >
            <Plus className="w-5 h-5" /> Add Reminder
          </button>
        </header>

        {/* ---------------- METRIC CARDS ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Today's Progress Card */}
          <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 
            border-2 border-green-200 dark:border-green-900/30 rounded-2xl p-5 shadow-sm hover:shadow-lg 
            transition-all duration-300 hover:-translate-y-1">
            <div className="bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-xl w-fit mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Today's Progress
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {summary.taken}/{summary.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {summary.total === 0 ? "No medications scheduled" : "Medications taken"}
            </div>
            {summary.total > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${summary.progress * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-right font-medium">
                  {Math.round(summary.progress * 100)}% complete
                </div>
              </div>
            )}
          </div>

          {/* Total Reminders Card */}
          <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 
            border-2 border-blue-200 dark:border-blue-900/30 rounded-2xl p-5 shadow-sm hover:shadow-lg 
            transition-all duration-300 hover:-translate-y-1">
            <div className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl w-fit mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Active Reminders
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {reminders.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {reminders.length === 0 ? "Add your first reminder" : "Medications scheduled"}
            </div>
          </div>

          {/* Adherence Rate Card */}
          <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 
            border-2 border-purple-200 dark:border-purple-900/30 rounded-2xl p-5 shadow-sm hover:shadow-lg 
            transition-all duration-300 hover:-translate-y-1">
            <div className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 p-3 rounded-xl w-fit mb-4">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Adherence Rate
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {calculateStreak()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {summary.taken === summary.total && summary.total > 0 
                ? "Perfect! Keep it up! 🎉" 
                : "Stay consistent"}
            </div>
          </div>
        </div>

        {/* ---------------- REMINDER LIST ---------------- */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
                Upcoming Reminders
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {reminders.length} {reminders.length === 1 ? "medication" : "medications"} scheduled
              </p>
            </div>
          </div>

          {reminders.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 
              border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Pill className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No Reminders Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Click <span className="font-bold text-blue-600 dark:text-blue-400">"Add Reminder"</span> to create your first medication reminder.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reminders.map((r) => (
                <ReminderCard
                  key={r._id}
                  reminder={r}
                  onDelete={handleDelete}
                  onToggleTaken={handleToggleTaken}
                />
              ))}
            </div>
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

        {/* ---------------- ADD REMINDER MODAL ---------------- */}
        {open && (
          <AddReminderForm onClose={() => setOpen(false)} onCreated={handleCreated} />
        )}

        {/* ---------------- NOTIFICATION STATUS ---------------- */}
        <div className="flex justify-center items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 
          text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800">
          <Bell className="w-4 h-4" />
          <span className="font-medium">Notifications are active — You'll get alerts before each dose.</span>
        </div>
      </div>
    </div>
  );
}

