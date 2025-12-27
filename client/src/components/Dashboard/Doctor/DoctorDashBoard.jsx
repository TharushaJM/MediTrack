  import { useState, useEffect } from "react";
  import axios from "axios";
  import toast from "react-hot-toast";
  import {
    Users,
    Calendar,
    FileText,
    Activity,
    Clock,
    TrendingUp,
    UserCheck,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw,
  } from "lucide-react";
  import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  import DoctorSidebar from "./DoctorSidebar";
  import DoctorHeader from "./DoctorHeader";
  import DoctorProfile from "./DoctorProfile";
  import { useTheme } from "../../../context/ThemeContext";
  import DoctorPatients from "./DoctorPatients";
  import DoctorChat from "./DoctorChat";

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const getInitials = (p) => {
    const first = (p?.firstName || "").trim()[0] || "";
    const last = (p?.lastName || "").trim()[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const getProfilePic = (p, API_URL) => {
    if (!p?.profileImage) return null; // no image
    if (p.profileImage.startsWith("http")) return p.profileImage;
    return `${API_URL}${p.profileImage}`; // backend image path
  };

  export default function DoctorDashboard() {
    const { darkMode } = useTheme();
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [doctor, setDoctor] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [chatPatientId, setChatPatientId] = useState(null);

    const [patientsForChat, setPatientsForChat] = useState([]);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Mock data for patient visits
    const weeklyVisits = [
      { day: "Mon", visits: 12 },
      { day: "Tue", visits: 19 },
      { day: "Wed", visits: 15 },
      { day: "Thu", visits: 22 },
      { day: "Fri", visits: 18 },
      { day: "Sat", visits: 8 },
      { day: "Sun", visits: 5 },
    ];

    // Fetch appointments function
    const fetchAppointments = async () => {
      try {
        setAppointmentsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/appointments/doctor-appointments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAppointments(res.data || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setAppointmentsLoading(false);
      }
    };

    // Get patient initials
    const getPatientInitials = (patient) => {
      if (!patient) return "?";
      const first = patient.firstName?.[0] || "";
      const last = patient.lastName?.[0] || "";
      return (first + last).toUpperCase() || "?";
    };

    // Fetch doctor profile and appointments
    useEffect(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("token");

          // Fetch doctor profile
          const profileRes = await axios.get(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDoctor(profileRes.data);

          // Fetch doctor's appointments
          const appointmentsRes = await axios.get(
            `${API_URL}/api/appointments/doctor-appointments`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setAppointments(appointmentsRes.data || []);
        } catch (error) {
          console.error("Error fetching data:", error);
          // Fallback to localStorage if API fails
          const userData = localStorage.getItem("user");
          if (userData) {
            setDoctor(JSON.parse(userData));
          }
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);

    // Update appointment status
    const handleStatusUpdate = async (appointmentId, status) => {
      try {
        setUpdatingStatus(appointmentId);
        const token = localStorage.getItem("token");
        await axios.patch(
          `${API_URL}/api/appointments/${appointmentId}/status`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update local state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId ? { ...apt, status } : apt
          )
        );
        toast.success(`Appointment ${status.toLowerCase()}`);
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update status");
      } finally {
        setUpdatingStatus(null);
      }
    };

    // Get today's appointments
    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = appointments.filter((apt) => apt.date === today);
    const upcomingAppointments = appointments.filter(
      (apt) => apt.status === "Pending" || apt.status === "Confirmed"
    );
    const completedToday = todayAppointments.filter(
      (apt) => apt.status === "Completed"
    ).length;

    // Get unique patients count
    const uniquePatients = [
      ...new Set(appointments.map((apt) => apt.patientId?._id)),
    ].length;

    // Get profile image for patient
    const getPatientImage = (patient) => {
      if (!patient) return "";
      if (patient.profileImage) {
        if (patient.profileImage.startsWith("http")) return patient.profileImage;
        return `${API_URL}${patient.profileImage}`;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        (patient.firstName || "") + " " + (patient.lastName || "")
      )}&background=007BFF&color=fff&size=100`;
    };

    const cleanToken = (t) =>
      (t || "")
        .replace(/^"+|"+$/g, "")
        .replace(/^'+|'+$/g, "")
        .trim();

    //this for get chatlist of patient
    const loadPatientsForChat = async () => {
      try {
        setPatientsLoading(true);

        const token = cleanToken(localStorage.getItem("token"));

        const { data } = await axios.get(`${API_URL}/api/doctor/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = (Array.isArray(data) ? data : [])
          .map((x) => x.patient)
          .filter(Boolean)
          .map((p) => ({
            ...p,
            lastText: "",
            lastTime: "",
          }));

        setPatientsForChat(list);
      } catch (err) {
        console.log(
          "❌ loadPatientsForChat error:",
          err?.response?.data || err.message
        );
        setPatientsForChat([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    useEffect(() => {
      if (activeMenu === "chat") {
        loadPatientsForChat();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMenu]);

    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-950" : "bg-gray-100"}`}>
        {/* Sidebar */}
        <DoctorSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

        {/* Main Content */}
        <div className="ml-64">
          {/* Top Bar - Using DoctorHeader Component */}
          <DoctorHeader doctor={doctor} />

          {/* Render Profile or Dashboard Content */}
          {activeMenu === "profile" ? (
            <DoctorProfile />
          ) : activeMenu === "patients" ? (
            <DoctorPatients
              onOpenChat={(patientId) => {
                setChatPatientId(patientId);
                setActiveMenu("chat");
              }}
            />
          ) : activeMenu === "chat" ? (
            <div className="p-8">
              <div className="h-[650px] flex gap-4">
                {/* LEFT: patients list */}
                <div className="w-80 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 overflow-hidden">
                  <div className="p-4 border-b dark:border-gray-800">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                      Patients
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Select a patient to chat
                    </p>
                  </div>

                  <div className="overflow-y-auto h-[580px]">
                    {patientsLoading ? (
                      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                        Loading patients...
                      </div>
                    ) : patientsForChat.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                        No patients found (need appointment first).
                      </div>
                    ) : (
                      patientsForChat.map((p) => {
                        const active = String(p._id) === String(chatPatientId);
                        return (
                          <button
                            key={p._id}
                            onClick={() => {
                              setChatPatientId(p._id);
                              setSelectedPatient(p);
                            }}
                            className={`w-full text-left px-4 py-3 border-b dark:border-gray-800 ${
                              active ? "bg-blue-50 dark:bg-gray-800" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* ✅ AVATAR */}
                              {p.profileImage ? (
                                <img
                                  src={
                                    p.profileImage.startsWith("http")
                                      ? p.profileImage
                                      : `${API_URL}${p.profileImage}`
                                  }
                                  alt={`${p.firstName} ${p.lastName}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                  {(p.firstName?.[0] || "") +
                                    (p.lastName?.[0] || "")}
                                </div>
                              )}

                              {/* ✅ NAME + LAST MESSAGE */}
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {p.firstName} {p.lastName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {p.lastText || "No messages yet"}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT: chat */}
                <div className="flex-1">
                  {chatPatientId ? (
                    <DoctorChat
                      patientId={chatPatientId}
                      patient={selectedPatient}
                      onNewMessage={(msg) => {
                        // Update LEFT LIST automatically when message comes
                        setPatientsForChat((prev) => {
                          const otherId =
                            String(msg.sender?._id) === String(chatPatientId)
                              ? msg.sender?._id
                              : msg.receiver?._id;

                          // update + move to top
                          const copy = [...prev];
                          const i = copy.findIndex(
                            (x) => String(x._id) === String(otherId)
                          );
                          if (i === -1) return prev;

                          const item = copy.splice(i, 1)[0];
                          item.lastText = msg.text;
                          item.lastTime = msg.createdAt;

                          return [item, ...copy];
                        });
                      }}
                    />
                  ) : (
                    <div className="h-[650px] bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800 flex items-center justify-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select a patient to start chatting.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <main className="p-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard
                  icon={<Users className="w-6 h-6" />}
                  title="Total Patients"
                  value={uniquePatients.toString()}
                  change={`${appointments.length} appointments`}
                  color="blue"
                  darkMode={darkMode}
                />
                <SummaryCard
                  icon={<Calendar className="w-6 h-6" />}
                  title="Today's Appointments"
                  value={todayAppointments.length.toString()}
                  change={`${completedToday} completed`}
                  color="green"
                  darkMode={darkMode}
                />
                <SummaryCard
                  icon={<FileText className="w-6 h-6" />}
                  title="Pending"
                  value={upcomingAppointments.length.toString()}
                  change="Awaiting confirmation"
                  color="orange"
                  darkMode={darkMode}
                />
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments - Takes 2 columns */}
                <div
                  className={`lg:col-span-2 ${
                    darkMode
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  } border rounded-xl p-6 shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3
                      className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      } flex items-center gap-2`}
                    >
                      <Clock className="w-5 h-5 text-blue-500" />
                      Upcoming Appointments
                    </h3>
                    <button
                      onClick={fetchAppointments}
                      className="text-sm text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          appointmentsLoading ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </button>
                  </div>

                  <div className="space-y-3">
                    {appointmentsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      </div>
                    ) : upcomingAppointments.length === 0 ? (
                      <div
                        className={`text-center py-8 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No upcoming appointments</p>
                      </div>
                    ) : (
                      upcomingAppointments
                        .slice(0, 5)
                        .map((appointment) => (
                          <AppointmentCard
                            key={appointment._id}
                            appointment={appointment}
                            darkMode={darkMode}
                            getPatientImage={getPatientImage}
                            getPatientInitials={getPatientInitials}
                            handleStatusUpdate={handleStatusUpdate}
                            updatingStatus={updatingStatus}
                          />
                        ))
                    )}
                  </div>
                </div>

                {/* Weekly Patient Visits Chart */}
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  } border rounded-xl p-6 shadow-sm`}
                >
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    } mb-6 flex items-center gap-2`}
                  >
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Weekly Visits
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyVisits}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={darkMode ? "#374151" : "#E5E7EB"}
                      />
                      <XAxis
                        dataKey="day"
                        stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                      />
                      <YAxis stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                          border: darkMode
                            ? "1px solid #374151"
                            : "1px solid #E5E7EB",
                          borderRadius: "8px",
                          color: darkMode ? "#F3F4F6" : "#1F2937",
                        }}
                      />
                      <Bar
                        dataKey="visits"
                        fill="#3B82F6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <QuickStat
                  icon={<Activity className="w-5 h-5 text-blue-500" />}
                  label="Completed Today"
                  value={completedToday.toString()}
                  darkMode={darkMode}
                />
                <QuickStat
                  icon={<UserCheck className="w-5 h-5 text-green-500" />}
                  label="Confirmed"
                  value={appointments
                    .filter((a) => a.status === "Confirmed")
                    .length.toString()}
                  darkMode={darkMode}
                />
                <QuickStat
                  icon={<Clock className="w-5 h-5 text-purple-500" />}
                  label="Next Appointment"
                  value={
                    upcomingAppointments.length > 0
                      ? upcomingAppointments[0]?.timeSlot || "N/A"
                      : "N/A"
                  }
                  darkMode={darkMode}
                />
                <QuickStat
                  icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
                  label="Total Completed"
                  value={appointments
                    .filter((a) => a.status === "Completed")
                    .length.toString()}
                  darkMode={darkMode}
                />
              </div>
            </main>
          )}
        </div>
      </div>
    );
  }

  // Summary Card Component
  function SummaryCard({ icon, title, value, change, color, darkMode }) {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      orange: "from-orange-500 to-orange-600",
    };

    return (
      <div
        className={`${
          darkMode
            ? "bg-gray-900 border-gray-800 hover:border-gray-700"
            : "bg-white border-gray-200 hover:border-gray-300"
        } border rounded-xl p-6 transition shadow-sm`}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 bg-gradient-to-br ${colors[color]} rounded-lg shadow-lg`}
          >
            {icon}
          </div>
        </div>
        <h3
          className={`${
            darkMode ? "text-gray-400" : "text-gray-500"
          } text-sm mb-1`}
        >
          {title}
        </h3>
        <p
          className={`text-3xl font-bold ${
            darkMode ? "text-white" : "text-gray-800"
          } mb-1`}
        >
          {value}
        </p>
        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          {change}
        </p>
      </div>
    );
  }

  // Appointment Card Component
  function AppointmentCard({
    appointment,
    darkMode,
    getPatientImage,
    getPatientInitials,
    handleStatusUpdate,
    updatingStatus,
  }) {
    const patient = appointment?.patientId;
    const patientName = patient
      ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
      : "Unknown Patient";

    // Format date
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Safe patient initials
    const getInitials = () => {
      if (!patient) return "?";
      if (getPatientInitials) return getPatientInitials(patient);
      const first = patient.firstName?.[0] || "";
      const last = patient.lastName?.[0] || "";
      return (first + last).toUpperCase() || "?";
    };

    // Safe patient image
    const getImage = () => {
      if (!patient?.profileImage) return null;
      if (getPatientImage) return getPatientImage(patient);
      return null;
    };

    const profileImage = getImage();

    return (
      <div
        className={`flex items-center justify-between p-4 ${
          darkMode
            ? "bg-gray-800 border-gray-700 hover:border-gray-600"
            : "bg-gray-50 border-gray-200 hover:border-gray-300"
        } border rounded-lg transition`}
      >
        <div className="flex items-center gap-4">
          {profileImage ? (
            <img
              src={profileImage}
              alt={patientName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white">
              {getInitials()}
            </div>
          )}
          <div>
            <p
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {patientName}
            </p>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {appointment?.reason || "General Consultation"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {formatDate(appointment?.date)} • {appointment?.timeSlot || ""}
            </p>
            <span
              className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-medium ${
                appointment?.status === "Completed"
                  ? "bg-green-500/20 text-green-500"
                  : appointment?.status === "Confirmed"
                  ? "bg-blue-500/20 text-blue-500"
                  : appointment?.status === "Cancelled"
                  ? "bg-red-500/20 text-red-500"
                  : "bg-yellow-500/20 text-yellow-600"
              }`}
            >
              {appointment?.status || "Pending"}
            </span>
          </div>

          {/* Action Buttons */}
          {appointment?.status === "Pending" && handleStatusUpdate && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate(appointment._id, "Confirmed")}
                disabled={updatingStatus === appointment?._id}
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
                title="Confirm"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatusUpdate(appointment._id, "Cancelled")}
                disabled={updatingStatus === appointment?._id}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
                title="Cancel"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          {appointment?.status === "Confirmed" && handleStatusUpdate && (
            <button
              onClick={() => handleStatusUpdate(appointment._id, "Completed")}
              disabled={updatingStatus === appointment?._id}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quick Stat Component
  function QuickStat({ icon, label, value, darkMode }) {
    return (
      <div
        className={`${
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        } border rounded-xl p-4 shadow-sm`}
      >
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <span
            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            {label}
          </span>
        </div>
        <p
          className={`text-xl font-bold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {value}
        </p>
      </div>
    );
  }
