import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CalendarDays,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Edit3,
  X,
  Save,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// helper: YYYY-MM-DD (safe)
const toYMD = (d) => {
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

function StatusPill({ status }) {
  const s = (status || "").toLowerCase();
  const base =
    "px-2 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1";

  if (s === "pending")
    return (
      <span className={`${base} bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-300`}>
        <Clock className="w-3 h-3" /> Pending
      </span>
    );

  if (s === "confirmed")
    return (
      <span className={`${base} bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-300`}>
        <CheckCircle className="w-3 h-3" /> Confirmed
      </span>
    );

  if (s === "completed")
    return (
      <span className={`${base} bg-green-500/10 text-green-700 border-green-500/30 dark:text-green-300`}>
        <CheckCircle className="w-3 h-3" /> Completed
      </span>
    );

  if (s === "cancelled" || s === "canceled")
    return (
      <span className={`${base} bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-300`}>
        <XCircle className="w-3 h-3" /> Cancelled
      </span>
    );

  return (
    <span className={`${base} bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-300`}>
      {status}
    </span>
  );
}

function Modal({ open, onClose, children, title, darkMode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`relative w-full max-w-md border rounded-2xl shadow-xl p-5 ${
          darkMode
            ? "bg-[#1e293b] border-white/10 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              darkMode ? "hover:bg-white/10 text-slate-200" : "hover:bg-gray-100 text-gray-700"
            }`}
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DoctorAppointments() {
  const { darkMode } = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleFor, setRescheduleFor] = useState(null);
  const [newDate, setNewDate] = useState(toYMD(new Date()));
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0]);
  const [saving, setSaving] = useState(false);

  const token = useMemo(() => {
    const raw = localStorage.getItem("token") || "";
    return raw.replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();
  }, []);

  const fetchAppointments = async (dateObj = selectedDate) => {
    try {
      setLoading(true);
      const date = toYMD(dateObj);

      const { data } = await axios.get(
        `${API_URL}/api/appointments/doctor-appointments?date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const updateStatus = async (appointmentId, status) => {
    try {
      setSaving(true);
      await axios.patch(
        `${API_URL}/api/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Appointment ${status}`);
      fetchAppointments(selectedDate);
    } catch (err) {
      console.log(err);
      toast.error("Status update failed");
    } finally {
      setSaving(false);
    }
  };

  const openReschedule = (appt) => {
    setRescheduleFor(appt);
    setNewDate(appt?.date || toYMD(selectedDate));
    setNewSlot(appt?.timeSlot || TIME_SLOTS[0]);
    setRescheduleOpen(true);
  };

  const saveReschedule = async () => {
    if (!rescheduleFor?._id) return;
    try {
      setSaving(true);
      await axios.patch(
        `${API_URL}/api/appointments/${rescheduleFor._id}/reschedule`,
        { date: newDate, timeSlot: newSlot },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Rescheduled!");
      setRescheduleOpen(false);
      setRescheduleFor(null);
      fetchAppointments(selectedDate);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.error || "Reschedule failed");
    } finally {
      setSaving(false);
    }
  };

  // Theme classes
  const pageText = darkMode ? "text-white" : "text-gray-900";
  const cardClass = darkMode
    ? "bg-[#1e293b] border-white/10"
    : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-slate-300" : "text-gray-500";
  const iconColor = darkMode ? "text-sky-300" : "text-blue-600";

  return (
    <div className={`p-6 ${pageText}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Calendar */}
        <div className={`border rounded-2xl p-5 ${cardClass}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <CalendarDays className={`w-5 h-5 ${iconColor}`} />
              Calendar
            </h2>
            <button
              onClick={() => fetchAppointments(selectedDate)}
              className={`p-2 rounded-lg ${
                darkMode ? "text-slate-200 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
              }`}
              type="button"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div
            className={`rounded-xl overflow-hidden p-2 border ${
              darkMode ? "bg-[#1e293b] border-white/10" : "bg-gray-50 border-gray-200"
            }`}
          >
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              className={`${darkMode ? "rc-dark" : "rc-light"} bg-transparent w-full border-none`}
            />
          </div>

          <div className={`mt-4 text-sm ${mutedText}`}>
            Selected:{" "}
            <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {toYMD(selectedDate)}
            </span>
          </div>
        </div>

        {/* RIGHT: Appointments */}
        <div className={`lg:col-span-2 border rounded-2xl p-5 ${cardClass}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className={`w-5 h-5 ${iconColor}`} />
              Appointments
            </h2>
            <span className={`text-sm ${mutedText}`}>
              {appointments.length} for {toYMD(selectedDate)}
            </span>
          </div>

          {loading ? (
            <div className={`py-10 text-center ${mutedText}`}>Loading...</div>
          ) : appointments.length === 0 ? (
            <div className={`py-10 text-center ${mutedText}`}>
              No appointments for this day.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => {
                const p = a.patientId || {};
                const name =
                  `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient";
                const reason = a.reason || "General Consultation";

                return (
                  <div
                    key={a._id}
                    className={`border rounded-2xl p-4 flex items-center justify-between gap-4 ${
                      darkMode
                        ? "bg-[#0f172a] border-white/10"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                          darkMode
                            ? "bg-sky-500/15 border-sky-500/20"
                            : "bg-blue-50 border-blue-100"
                        }`}
                      >
                        <User className={`w-5 h-5 ${darkMode ? "text-sky-300" : "text-blue-600"}`} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{name}</p>
                          <StatusPill status={a.status} />
                        </div>
                        <p className={`text-sm truncate ${mutedText}`}>
                          {a.timeSlot} • {reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStatus(a._id, "Completed")}
                        disabled={saving}
                        className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm inline-flex items-center gap-2 disabled:opacity-50"
                        type="button"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>

                      <button
                        onClick={() => updateStatus(a._id, "Cancelled")}
                        disabled={saving}
                        className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm inline-flex items-center gap-2 disabled:opacity-50"
                        type="button"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>

                      <button
                        onClick={() => openReschedule(a)}
                        disabled={saving}
                        className={`px-3 py-2 rounded-lg text-white text-sm inline-flex items-center gap-2 disabled:opacity-50 ${
                          darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-700 hover:bg-gray-800"
                        }`}
                        type="button"
                      >
                        <Edit3 className="w-4 h-4" />
                        Reschedule
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule Appointment"
        darkMode={darkMode}
      >
        <div className="space-y-4">
          <div>
            <label className={`text-sm ${mutedText}`}>New Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={`mt-2 w-full px-3 py-2 rounded-xl border outline-none ${
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label className={`text-sm ${mutedText}`}>New Time Slot</label>
            <select
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className={`mt-2 w-full px-3 py-2 rounded-xl border outline-none ${
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={saveReschedule}
            disabled={saving}
            className="w-full px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
            type="button"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  );
}
