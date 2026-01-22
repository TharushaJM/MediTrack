import { Clock, Pill, Trash2, CheckCircle2, Circle, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ReminderCard({ reminder, onDelete, onToggleTaken }) {
  const [taken, setTaken] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = reminder.takenDates?.find(t => t.date === today);
    return todayEntry ? todayEntry.taken : false;
  });
  const [showDetails, setShowDetails] = useState(false);

  // Keep local `taken` in sync if parent refreshes the reminder prop
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = reminder.takenDates?.find(t => t.date === today);
    setTaken(todayEntry ? todayEntry.taken : false);
  }, [reminder.takenDates]);

  async function toggleTaken() {
    try {
      const token = localStorage.getItem("token");
      const newState = !taken;

      await axios.put(
        `http://localhost:5000/api/reminders/${reminder._id}/take`,
        { taken: newState },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTaken(newState);

      // Notify parent component so summary can refresh
      if (typeof onToggleTaken === "function") {
        onToggleTaken(reminder._id, newState);
      }
    } catch (err) {
      console.error("Error marking as taken:", err);
    }
  }

  return (
    <div className="relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 
      rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      {/* Decorative gradient bar on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all ${
        taken ? "bg-gradient-to-b from-green-500 to-emerald-500" : "bg-gradient-to-b from-blue-500 to-cyan-500"
      }`} />

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2.5 rounded-xl shadow-md ${
            taken 
              ? "bg-gradient-to-br from-green-500 to-emerald-500" 
              : "bg-gradient-to-br from-blue-500 to-cyan-500"
          }`}>
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{reminder.name}</h3>
            {reminder.dosage && (
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{reminder.dosage}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(reminder._id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 
            text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Time and Frequency */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Clock size={18} className="text-blue-600 dark:text-blue-400" />
          <span className="font-semibold">{reminder.time}</span>
        </div>
        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 
          px-3 py-1.5 rounded-full font-bold border border-purple-200 dark:border-purple-800">
          {reminder.frequency}
        </span>
      </div>

      {/* Taken toggle button */}
      <button
        onClick={toggleTaken}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
          font-semibold transition-all duration-300 ${
          taken 
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg" 
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        {taken ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        <span>{taken ? "Taken Today ✓" : "Mark as Taken"}</span>
      </button>

      {/* Notes (collapsible) */}
      {reminder.notes && (
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 
              hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
            {showDetails ? "Hide" : "Show"} Notes
          </button>
          {showDetails && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                "{reminder.notes}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
