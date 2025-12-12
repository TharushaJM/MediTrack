import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  FileText,
  Activity,
  Clock,
  TrendingUp,
  UserCheck,
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


export default function DoctorDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [doctor, setDoctor] = useState(null);

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

  // Mock upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      patientName: "Sarah Johnson",
      time: "09:00 AM",
      condition: "Follow-up Consultation",
      status: "Waiting",
      avatar: "SJ",
    },
    {
      id: 2,
      patientName: "Michael Chen",
      time: "10:30 AM",
      condition: "General Checkup",
      status: "Completed",
      avatar: "MC",
    },
    {
      id: 3,
      patientName: "Emily Rodriguez",
      time: "11:00 AM",
      condition: "Cardiology Review",
      status: "Waiting",
      avatar: "ER",
    },
    {
      id: 4,
      patientName: "David Kumar",
      time: "02:00 PM",
      condition: "Diabetes Management",
      status: "Waiting",
      avatar: "DK",
    },
    {
      id: 5,
      patientName: "Lisa Anderson",
      time: "03:30 PM",
      condition: "Physical Therapy",
      status: "Waiting",
      avatar: "LA",
    },
  ];

  // Fetch doctor profile
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setDoctor(JSON.parse(userData));
    }
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-950" : "bg-gray-50"}`}>
     
      
      {/* Sidebar */}
      <DoctorSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} darkMode={darkMode} />

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar - Using DoctorHeader Component */}
        <DoctorHeader doctor={doctor} darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Dashboard Content */}
        <main className="p-8">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard
              icon={<Users className="w-6 h-6" />}
              title="Total Patients"
              value="248"
              change="+12 this month"
              color="blue"
            />
            <SummaryCard
              icon={<Calendar className="w-6 h-6" />}
              title="Today's Appointments"
              value="8"
              change="3 completed"
              color="green"
            />
            <SummaryCard
              icon={<FileText className="w-6 h-6" />}
              title="Pending Reports"
              value="5"
              change="2 urgent"
              color="orange"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments - Takes 2 columns */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Upcoming Appointments
                </h3>
                <button className="text-sm text-blue-500 hover:text-blue-400 font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            </div>

            {/* Weekly Patient Visits Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Weekly Visits
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyVisits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                  />
                  <Bar dataKey="visits" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <QuickStat
              icon={<Activity className="w-5 h-5 text-blue-500" />}
              label="Avg. Consultation Time"
              value="25 min"
            />
            <QuickStat
              icon={<UserCheck className="w-5 h-5 text-green-500" />}
              label="Patient Satisfaction"
              value="98%"
            />
            <QuickStat
              icon={<Clock className="w-5 h-5 text-purple-500" />}
              label="Next Appointment"
              value="9:00 AM"
            />
            <QuickStat
              icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
              label="Monthly Growth"
              value="+15%"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ icon, title, value, change, color }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 bg-gradient-to-br ${colors[color]} rounded-lg shadow-lg`}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500">{change}</p>
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white">
          {appointment.avatar}
        </div>
        <div>
          <p className="font-medium text-white">{appointment.patientName}</p>
          <p className="text-sm text-gray-400">{appointment.condition}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-300">{appointment.time}</p>
        <span
          className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-medium ${
            appointment.status === "Completed"
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {appointment.status}
        </span>
      </div>
    </div>
  );
}

// Quick Stat Component
function QuickStat({ icon, label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
