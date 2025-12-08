import { motion } from "framer-motion";
import { Clock, Pill, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ReminderCard({ reminder, onDelete, onToggleTaken }) {
  const [taken, setTaken] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = reminder.takenDates?.find(t => t.date === today);
    return todayEntry ? todayEntry.taken : false;
  });

  // Keep local `taken` in sync if parent refreshes the reminder prop
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = reminder.takenDates?.find(t => t.date === today);
    setTaken(todayEntry ? todayEntry.taken : false);
  }, [reminder.takenDates]);

  async function toggleTaken() {
    try {
      const token = localStorage.getItem("token");
      // compute new state first so we can send it to the server
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
            <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">{reminder.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{reminder.dosage || "—"}</p>
          </div>
        </div>

        <button
          onClick={() => onDelete(reminder._id)}
          className="text-red-500 dark:text-red-400 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Time */}
      <div className="flex items-center justify-between my-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock size={16} className="text-blue-600 dark:text-blue-400" />
          {reminder.time}
        </div>
        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 rounded-full">
          {reminder.frequency}
        </span>
      </div>

      {/* Notes */}
      {reminder.notes && (
        <p className="italic text-gray-500 dark:text-gray-400 text-sm mb-3">“{reminder.notes}”</p>
      )}

      {/* Taken toggle */}
      <div
        onClick={toggleTaken}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
          taken ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
        }`}
      >
        {taken ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        <span className="text-sm">{taken ? "Taken" : "Mark as Taken"}</span>
      </div>
    </motion.div>
  );
}

