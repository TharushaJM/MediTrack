import { useState } from "react";
import { X, Pill, Clock, Repeat } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function AddReminderForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    time: "",
    frequency: "Daily",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/reminders",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCreated(data);
      onClose();
    } catch (err) {
      console.error("Error adding reminder:", err);
      alert("Failed to add reminder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Pill className="text-blue-600 w-5 h-5" /> Add Medication Reminder
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Medicine Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="E.g. Paracetamol"
              className="border w-full p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Dosage</label>
            <input
              type="text"
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="E.g. 500mg"
              className="border w-full p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-600" /> Time
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="border w-full p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Repeat className="w-4 h-4 text-purple-600" /> Frequency
              </label>
              <select
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="border w-full p-2 rounded-lg mt-1 focus:ring-2 focus:ring-purple-400 outline-none"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any special instructions..."
              rows={3}
              className="border w-full p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition"
            >
              {saving ? "Saving..." : "Save Reminder"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
