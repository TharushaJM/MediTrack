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
  Award,
  Star,
  Target,
  Zap,
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
import DoctorAppointments from "./DoctorAppointments";
import DoctorReportsPage from "./DoctorReportsPage";

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

  const [reportPatientId, setReportPatientId] = useState(null);
  const [reportPatient, setReportPatient] = useState(null);

  // Calculate real weekly visits from appointments
  const getWeeklyVisits = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    // Initialize counts for each day
    const visitCounts = {
      "Sun": 0,
      "Mon": 0,
      "Tue": 0,
      "Wed": 0,
      "Thu": 0,
      "Fri": 0,
      "Sat": 0
    };

    // Count appointments for this week
    appointments.forEach(apt => {
      if (!apt.date) return;
      
      const aptDate = new Date(apt.date);
      const daysDiff = Math.floor((aptDate - startOfWeek) / (1000 * 60 * 60 * 24));
      
      // Only count appointments from this week
      if (daysDiff >= 0 && daysDiff < 7) {
        const dayName = days[aptDate.getDay()];
        visitCounts[dayName]++;
      }
    });

    // Return in Mon-Sun order for the chart
    return [
      { day: "Mon", visits: visitCounts["Mon"] },
      { day: "Tue", visits: visitCounts["Tue"] },
      { day: "Wed", visits: visitCounts["Wed"] },
      { day: "Thu", visits: visitCounts["Thu"] },
      { day: "Fri", visits: visitCounts["Fri"] },
      { day: "Sat", visits: visitCounts["Sat"] },
      { day: "Sun", visits: visitCounts["Sun"] },
    ];
  };

  const weeklyVisits = getWeeklyVisits();

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

  //for reports
  const openReportsMenu = () => {
    setReportPatientId(null); // clear old patient
    setReportPatient(null);
    setActiveMenu("reports"); //  open reports page
  };

  useEffect(() => {
    if (activeMenu === "chat") {
      loadPatientsForChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments(); // refresh appointments every 10s
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-950" : "bg-gray-100"}`}>
      {/* Sidebar */}
      <DoctorSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onOpenReports={openReportsMenu}
      />

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar - Using DoctorHeader Component */}
        <DoctorHeader 
          doctor={doctor}
          onNavigateToPatients={() => setActiveMenu("patients")}
          onSelectPatient={(patient) => {
            setSelectedPatient(patient);
            setActiveMenu("patients");
          }}
        />

        {/* Render Profile or Dashboard Content */}
        {activeMenu === "profile" ? (
          <DoctorProfile />
        ) : activeMenu === "patients" ? (
          <DoctorPatients
            onOpenChat={(patientId) => {
              setChatPatientId(patientId);
              setActiveMenu("chat");
            }}
            onOpenReports={(patientId) => {
              setReportPatientId(patientId); // save selected patient id
              setActiveMenu("reports"); // open reports page
            }}
          />
        ) : activeMenu === "appointments" ? (
          <DoctorAppointments
            doctor={doctor}
            appointments={appointments}
            loading={appointmentsLoading}
            onRefresh={fetchAppointments}
            onStatusUpdate={handleStatusUpdate}
            updatingStatus={updatingStatus}
          />
        ) : activeMenu === "reports" ? (
          <DoctorReportsPage
            initialPatientId={reportPatientId} //  this is the “auto-select” patient
            onBack={() => setActiveMenu("patients")}
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
          <main className="p-8 bg-gray-50 dark:bg-gray-950">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, Dr. {doctor?.lastName || ""}! 
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's your practice overview for today
              </p>
            </div>

            {/* Health Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {/* Today's Appointments Card */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 
                border-2 border-blue-200 dark:border-blue-900/30 rounded-2xl p-5 shadow-sm hover:shadow-lg 
                transition-all duration-300 hover:-translate-y-1">
                <div className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl w-fit mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Today's Schedule
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {todayAppointments.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {completedToday > 0 
                    ? `${completedToday} completed` 
                    : "Appointments today"}
                </div>
                {todayAppointments.length > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(completedToday / todayAppointments.length) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-right font-medium">
                      {Math.round((completedToday / todayAppointments.length) * 100)}% completed
                    </div>
                  </div>
                )}
              </div>

              {/* Total Patients Card */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 
                border-2 border-green-200 dark:border-green-900/30 rounded-2xl p-5 shadow-sm hover:shadow-lg 
                transition-all duration-300 hover:-translate-y-1">
                <div className="bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-xl w-fit mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Patients
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {uniquePatients}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {appointments.length} appointments total
                </div>
              </div>

              {/* Pending Appointments Card */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 
                border-2 border-orange-200 dark:border-orange-900/30 rounded-2xl p-5 shadow-sm hover:shadow-lg 
                transition-all duration-300 hover:-translate-y-1">
                <div className="bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 p-3 rounded-xl w-fit mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Pending Requests
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {upcomingAppointments.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {upcomingAppointments.length > 0 
                    ? "Awaiting confirmation" 
                    : "All caught up! 🎉"}
                </div>
              </div>

              {/* Completion Rate Card */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 
                border-2 border-purple-200 dark:border-purple-900/30 rounded-2xl p-5 shadow-sm hover:shadow-lg 
                transition-all duration-300 hover:-translate-y-1">
                <div className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 p-3 rounded-xl w-fit mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Completion Rate
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {appointments.length > 0 
                    ? `${Math.round((appointments.filter(a => a.status === "Completed").length / appointments.length) * 100)}%`
                    : "0%"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {appointments.filter(a => a.status === "Completed").length} completed
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Appointments - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
                rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Upcoming Appointments
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {upcomingAppointments.length} appointments pending
                    </p>
                  </div>
                  <button
                    onClick={fetchAppointments}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    title="Refresh"
                  >
                    <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  {appointmentsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : upcomingAppointments.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 
                      border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Upcoming Appointments
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You're all caught up! New appointments will appear here.
                      </p>
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
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
                rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
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

            {/* Quick Stats Row - Redesigned */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">
              <QuickStat
                icon={<CheckCircle className="w-5 h-5" />}
                label="Completed Today"
                value={completedToday.toString()}
                color="green"
                darkMode={darkMode}
              />
              <QuickStat
                icon={<UserCheck className="w-5 h-5" />}
                label="Confirmed"
                value={appointments
                  .filter((a) => a.status === "Confirmed")
                  .length.toString()}
                color="blue"
                darkMode={darkMode}
              />
              <QuickStat
                icon={<Clock className="w-5 h-5" />}
                label="Next Appointment"
                value={
                  upcomingAppointments.length > 0
                    ? upcomingAppointments[0]?.timeSlot || "N/A"
                    : "N/A"
                }
                color="purple"
                darkMode={darkMode}
              />
              <QuickStat
                icon={<Award className="w-5 h-5" />}
                label="Total Completed"
                value={appointments
                  .filter((a) => a.status === "Completed")
                  .length.toString()}
                color="orange"
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

// Appointment Card Component - Enhanced
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
    <div className="relative flex items-center justify-between p-4 bg-white dark:bg-gray-900 
      border-2 border-gray-200 dark:border-gray-800 rounded-2xl transition-all duration-300 
      hover:shadow-md hover:-translate-y-0.5 group">
      {/* Decorative gradient bar on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
        appointment?.status === "Completed"
          ? "bg-gradient-to-b from-green-500 to-emerald-500"
          : appointment?.status === "Confirmed"
          ? "bg-gradient-to-b from-blue-500 to-cyan-500"
          : appointment?.status === "Cancelled"
          ? "bg-gradient-to-b from-red-500 to-rose-500"
          : "bg-gradient-to-b from-yellow-500 to-orange-500"
      }`} />

      <div className="flex items-center gap-4 flex-1">
        {profileImage ? (
          <img
            src={profileImage}
            alt={patientName}
            className="w-14 h-14 rounded-xl object-cover shadow-md"
          />
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl 
            flex items-center justify-center font-bold text-white shadow-md text-lg">
            {getInitials()}
          </div>
        )}
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-white text-lg">
            {patientName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {appointment?.reason || "General Consultation"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {formatDate(appointment?.date)} • {appointment?.timeSlot || ""}
          </p>
          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
            appointment?.status === "Completed"
              ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
              : appointment?.status === "Confirmed"
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              : appointment?.status === "Cancelled"
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
              : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
          }`}>
            {appointment?.status || "Pending"}
          </span>
        </div>

        {/* Action Buttons */}
        {appointment?.status === "Pending" && handleStatusUpdate && (
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusUpdate(appointment._id, "Confirmed")}
              disabled={updatingStatus === appointment?._id}
              className="p-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                text-white rounded-xl transition disabled:opacity-50 shadow-md hover:shadow-lg"
              title="Confirm"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleStatusUpdate(appointment._id, "Cancelled")}
              disabled={updatingStatus === appointment?._id}
              className="p-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 
                text-white rounded-xl transition disabled:opacity-50 shadow-md hover:shadow-lg"
              title="Cancel"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
        {appointment?.status === "Confirmed" && handleStatusUpdate && (
          <button
            onClick={() => handleStatusUpdate(appointment._id, "Completed")}
            disabled={updatingStatus === appointment?._id}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
              text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            Complete
          </button>
        )}
      </div>
    </div>
  );
}

// Quick Stat Component - Redesigned
function QuickStat({ icon, label, value, color, darkMode }) {
  const colors = {
    green: {
      bg: "bg-green-500/10 dark:bg-green-500/20",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-900/30"
    },
    blue: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/30"
    },
    purple: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-900/30"
    },
    orange: {
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-900/30"
    }
  };

  const colorScheme = colors[color] || colors.blue;

  return (
    <div className={`bg-white dark:bg-gray-900 border-2 ${colorScheme.border} 
      rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}>
      <div className={`${colorScheme.bg} ${colorScheme.text} p-3 rounded-xl w-fit mb-3`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
        {label}
      </span>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
