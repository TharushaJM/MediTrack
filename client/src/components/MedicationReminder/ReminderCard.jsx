import { motion } from "framer-motion";
import { Clock, Pill, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

export default function ReminderCard({ reminder, onDelete }) {
  const [taken, setTaken] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all relative"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Pill className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{reminder.name}</h3>
            <p className="text-sm text-gray-500">{reminder.dosage || "—"}</p>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(reminder._id)}
          className="text-red-500 hover:text-red-600 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Time & Frequency */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>{reminder.time}</span>
        </div>
        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
          {reminder.frequency}
        </span>
      </div>

      {/* Notes */}
      {reminder.notes && (
        <p className="text-gray-600 text-sm italic mb-4">
          “{reminder.notes}”
        </p>
      )}

      {/* Status Toggle */}
      <div className="flex justify-between items-center">
        <div
          onClick={() => setTaken(!taken)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
            taken
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {taken ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          <span className="text-sm">
            {taken ? "Taken" : "Mark as Taken"}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {new Date(reminder.createdAt).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}
