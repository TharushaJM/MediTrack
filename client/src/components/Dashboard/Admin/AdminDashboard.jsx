import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  FileText,
  Calendar,
  TrendingUp,
  LogOut,
  Bell,
  Search,
  MoreVertical,
  Check,
  X,
  Moon,
  Sun,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    pendingApprovals: 0,
    totalRecords: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for charts (you can replace with real API data)
  const userGrowthData = [
    { month: "Jan", users: 120 },
    { month: "Feb", users: 180 },
    { month: "Mar", users: 240 },
    { month: "Apr", users: 320 },
    { month: "May", users: 410 },
    { month: "Jun", users: 520 },
  ];

  const userDistributionData = [
    { name: "Patients", value: 450 },
    { name: "Doctors", value: 68 },
    { name: "Admins", value: 2 },
  ];

  // Auth Guard
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") {
        alert("You are not authorized to view the admin dashboard.");
        navigate("/dashboard");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        // Fetch pending doctors
        const doctorsRes = await axios.get(
          "http://localhost:5000/api/admin/doctors/pending",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingDoctors(doctorsRes.data || []);

        // Fetch stats (optional - will use fallback if endpoint doesn't exist)
        try {
          const statsRes = await axios.get(
            "http://localhost:5000/api/admin/stats",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setStats(statsRes.data);
        } catch {
          // If stats endpoint doesn't exist, use mock data
          console.log("Stats endpoint not available, using mock data");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Approve Doctor
  const handleApprove = async (doctorId) => {
    try {
      setApprovingId(doctorId);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/doctors/${doctorId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
      setStats((prev) => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
      alert("Doctor approved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to approve doctor.");
    } finally {
      setApprovingId(null);
    }
  };

  // Reject Doctor
  const handleReject = async (doctorId) => {
    if (!window.confirm("Are you sure you want to reject this doctor?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/admin/doctors/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
      setStats((prev) => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
      alert("Doctor rejected successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to reject doctor.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredDoctors = pendingDoctors.filter((doc) =>
    `${doc.firstName} ${doc.lastName} ${doc.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-10 h-10 flex items-center justify-center rounded-xl font-bold text-white shadow-lg">
                M
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  MediTrack Admin
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Management Dashboard
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition relative">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Users"
            value={stats.totalUsers || "520"}
            change="+12%"
            color="blue"
            darkMode={darkMode}
          />
          <StatCard
            icon={<UserCheck className="w-6 h-6" />}
            title="Active Doctors"
            value={stats.totalDoctors || "68"}
            change="+8%"
            color="green"
            darkMode={darkMode}
          />
          <StatCard
            icon={<UserX className="w-6 h-6" />}
            title="Pending Approvals"
            value={pendingDoctors.length}
            change="Requires Action"
            color="orange"
            darkMode={darkMode}
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Health Records"
            value={stats.totalRecords || "1,248"}
            change="+24%"
            color="purple"
            darkMode={darkMode}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              User Growth Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                <XAxis dataKey="month" stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                <YAxis stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    color: darkMode ? "#F3F4F6" : "#111827",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              User Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Doctor Approvals */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-orange-600" />
              Pending Doctor Approvals ({pendingDoctors.length})
            </h3>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Loading pending doctors...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {searchTerm ? "No doctors match your search." : "No pending approvals! 🎉"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Specialization
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      License No.
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr
                      key={doctor._id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-semibold text-blue-600 dark:text-blue-400">
                            {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {doctor.firstName} {doctor.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {doctor.email}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                          {doctor.specialization}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {doctor.licenseNumber}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(doctor._id)}
                            disabled={approvingId === doctor._id}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(doctor._id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, change, color, darkMode }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colors[color]} rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
          {change}
        </span>
      </div>
      <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}
