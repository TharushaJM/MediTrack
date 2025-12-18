import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Filter,
  RefreshCw,
  Stethoscope,
  Mail,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, completed, cancelled
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data);
      setFilteredAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  useEffect(() => {
    if (filter === "all") {
      setFilteredAppointments(appointments);
    } else if (filter === "upcoming") {
      setFilteredAppointments(
        appointments.filter((apt) => apt.status === "Pending" || apt.status === "Confirmed")
      );
    } else if (filter === "completed") {
      setFilteredAppointments(appointments.filter((apt) => apt.status === "Completed"));
    } else if (filter === "cancelled") {
      setFilteredAppointments(appointments.filter((apt) => apt.status === "Cancelled"));
    }
  }, [filter, appointments]);

  // Get profile image
  const getProfileImage = (doctor) => {
    if (!doctor) return "";
    if (doctor.profileImage) {
      if (doctor.profileImage.startsWith("http")) return doctor.profileImage;
      return `${API_URL}/${doctor.profileImage}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      (doctor.firstName || "") + " " + (doctor.lastName || "")
    )}&background=007BFF&color=fff&size=150`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
            <AlertCircle size={12} />
            Pending
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            <CheckCircle size={12} />
            Confirmed
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if appointment is upcoming
  const isUpcoming = (dateStr) => {
    const appointmentDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  };

  // Cancel appointment
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      setCancelling(appointmentId);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setCancelling(null);
    }
  };

  // Open contact modal
  const openContactModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowContactModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              My Appointments
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              View and manage your scheduled appointments
            </p>
          </div>
          <button
            onClick={fetchAppointments}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "all", label: "All", count: appointments.length },
            {
              value: "upcoming",
              label: "Upcoming",
              count: appointments.filter((a) => a.status === "Pending" || a.status === "Confirmed").length,
            },
            {
              value: "completed",
              label: "Completed",
              count: appointments.filter((a) => a.status === "Completed").length,
            },
            {
              value: "cancelled",
              label: "Cancelled",
              count: appointments.filter((a) => a.status === "Cancelled").length,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                filter === tab.value
                  ? "bg-[#007BFF] text-white"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="text-[#007BFF] animate-spin mb-4" />
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <Calendar size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Appointments Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filter === "all"
                ? "You haven't booked any appointments yet."
                : `No ${filter} appointments.`}
            </p>
            <a
              href="/find-doctor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#007BFF] hover:bg-[#0056b3] text-white font-medium rounded-xl transition"
            >
              <Stethoscope size={20} />
              Find a Doctor
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={getProfileImage(appointment.doctorId)}
                      alt="Doctor"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                      </h3>
                      <p className="text-sm text-[#007BFF]">
                        {appointment.doctorId?.specialization || "General Physician"}
                      </p>
                      {appointment.doctorId?.location && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin size={12} />
                          {appointment.doctorId.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Calendar size={18} className="text-[#007BFF]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatDate(appointment.date)}</p>
                          <p className="text-xs text-gray-400">
                            {isUpcoming(appointment.date) ? "Upcoming" : "Past"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <Clock size={18} className="text-[#28A745]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{appointment.timeSlot}</p>
                          <p className="text-xs text-gray-400">Time Slot</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>{getStatusBadge(appointment.status)}</div>
                  </div>
                </div>

                {/* Reason (if any) */}
                {appointment.reason && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Reason:</span> {appointment.reason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  {/* Contact Doctor Button */}
                  <button
                    onClick={() => openContactModal(appointment)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#007BFF] hover:bg-[#0056b3] text-white text-sm font-medium rounded-lg transition"
                  >
                    <MessageCircle size={16} />
                    Contact Doctor
                  </button>

                  {/* Cancel Button (only for pending/confirmed appointments) */}
                  {(appointment.status === "Pending" || appointment.status === "Confirmed") &&
                    isUpcoming(appointment.date) && (
                      <button
                        onClick={() => handleCancel(appointment._id)}
                        disabled={cancelling === appointment._id}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                      >
                        {cancelling === appointment._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Cancel
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#007BFF] to-[#0056b3] p-6">
              <div className="flex items-center gap-4">
                <img
                  src={getProfileImage(selectedAppointment.doctorId)}
                  alt="Doctor"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Dr. {selectedAppointment.doctorId?.firstName}{" "}
                    {selectedAppointment.doctorId?.lastName}
                  </h2>
                  <p className="text-blue-100">
                    {selectedAppointment.doctorId?.specialization || "General Physician"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Contact Options
              </h3>

              <div className="space-y-3">
                {/* Chat */}
                <button
                  onClick={() => {
                    toast.success("Chat feature coming soon!");
                    setShowContactModal(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition group"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
                    <MessageCircle size={24} className="text-[#007BFF]" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800 dark:text-white">Send Message</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Chat with your doctor
                    </p>
                  </div>
                </button>

                {/* Video Call */}
                <button
                  onClick={() => {
                    toast.success("Video call feature coming soon!");
                    setShowContactModal(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-gray-700 rounded-xl transition group"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition">
                    <Video size={24} className="text-[#28A745]" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800 dark:text-white">Video Call</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Start a video consultation
                    </p>
                  </div>
                </button>

                {/* Phone Call */}
                <button
                  onClick={() => {
                    toast.success("Phone call feature coming soon!");
                    setShowContactModal(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-xl transition group"
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition">
                    <Phone size={24} className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800 dark:text-white">Phone Call</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Call your doctor directly
                    </p>
                  </div>
                </button>

                {/* Email */}
                {selectedAppointment.doctorId?.email && (
                  <a
                    href={`mailto:${selectedAppointment.doctorId.email}`}
                    className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-xl transition group"
                  >
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition">
                      <Mail size={24} className="text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 dark:text-white">Send Email</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedAppointment.doctorId.email}
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full mt-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
