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
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "doctors", "patients"
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
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
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [userDistributionData, setUserDistributionData] = useState([]);

  // Auth is now handled by ProtectedRoute wrapper - no need for component-level guard
  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        // Fetch pending doctors
        const pendingRes = await axios.get(
          "http://localhost:5000/api/users/doctors/pending",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingDoctors(pendingRes.data || []);

        // Fetch all doctors
        const allDoctorsRes = await axios.get(
          "http://localhost:5000/api/users/doctors/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllDoctors(allDoctorsRes.data || []);

        // Fetch all patients
        const patientsRes = await axios.get(
          "http://localhost:5000/api/users/patients",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllPatients(patientsRes.data || []);

        const totalDoctors = allDoctorsRes.data?.length || 0;
        const totalPatients = patientsRes.data?.length || 0;
        const totalUsers = totalDoctors + totalPatients;

        // Update stats
        setStats({
          totalUsers: totalUsers,
          totalPatients: totalPatients,
          totalDoctors: totalDoctors,
          pendingApprovals: pendingRes.data?.length || 0,
          totalRecords: 0,
          totalReports: 0,
        });

        // Calculate user distribution for pie chart
        const adminCount = 1; // Assuming at least 1 admin (the logged-in user)
        setUserDistributionData([
          { name: "Patients", value: totalPatients },
          { name: "Doctors", value: totalDoctors },
          { name: "Admins", value: adminCount },
        ]);

        // Calculate user growth data (group users by registration month)
        const allUsers = [...(allDoctorsRes.data || []), ...(patientsRes.data || [])];
        const monthlyData = {};
        const currentDate = new Date();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthKey = date.toLocaleString('en-US', { month: 'short' });
          monthlyData[monthKey] = 0;
        }

        // Count users by registration month
        allUsers.forEach(user => {
          if (user.createdAt) {
            const userDate = new Date(user.createdAt);
            const monthKey = userDate.toLocaleString('en-US', { month: 'short' });
            if (monthlyData.hasOwnProperty(monthKey)) {
              monthlyData[monthKey]++;
            }
          }
        });

        // Convert to cumulative growth
        let cumulative = 0;
        const growthData = Object.keys(monthlyData).map(month => {
          cumulative += monthlyData[month];
          return { month, users: cumulative };
        });

        setUserGrowthData(growthData);

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
        `http://localhost:5000/api/users/doctors/${doctorId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from pending list
      setPendingDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
      
      // Update the doctor in all doctors list
      setAllDoctors((prev) =>
        prev.map((doc) =>
          doc._id === doctorId ? { ...doc, isApproved: true } : doc
        )
      );
      
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
        `http://localhost:5000/api/users/doctors/${doctorId}/reject`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
      setAllDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
      setStats((prev) => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
        totalDoctors: prev.totalDoctors - 1,
        totalUsers: prev.totalUsers - 1,
      }));
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

  // Filter users based on active tab and search term
  const getFilteredData = () => {
    let data = [];
    if (activeTab === "pending") {
      data = pendingDoctors;
    } else if (activeTab === "doctors") {
      data = allDoctors;
    } else if (activeTab === "patients") {
      data = allPatients;
    }

    return data.filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  };

  const filteredData = getFilteredData();

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
            value={stats.totalUsers}
            change="+12%"
            color="blue"
            darkMode={darkMode}
          />
          <StatCard
            icon={<UserCheck className="w-6 h-6" />}
            title="Total Doctors"
            value={stats.totalDoctors}
            change="+8%"
            color="green"
            darkMode={darkMode}
          />
          <StatCard
            icon={<UserX className="w-6 h-6" />}
            title="Pending Approvals"
            value={stats.pendingApprovals}
            change="Requires Action"
            color="orange"
            darkMode={darkMode}
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Total Patients"
            value={stats.totalPatients}
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

        {/* User Management Table with Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              User Management
            </h3>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === "pending"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Pending Doctors ({pendingDoctors.length})
            </button>
            <button
              onClick={() => setActiveTab("doctors")}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === "doctors"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              All Doctors ({allDoctors.length})
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === "patients"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              All Patients ({allPatients.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Loading users...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No users match your search."
                : activeTab === "pending"
                ? "No pending approvals! 🎉"
                : `No ${activeTab} found.`}
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
                    {activeTab !== "patients" && (
                      <>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Specialization
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          License No.
                        </th>
                      </>
                    )}
                    {activeTab === "doctors" && (
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                    )}
                    {activeTab === "patients" && (
                      <>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Age
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Gender
                        </th>
                      </>
                    )}
                    {activeTab === "pending" && (
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${
                            activeTab === "patients"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          } rounded-full flex items-center justify-center font-semibold`}>
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      {activeTab !== "patients" && (
                        <>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                              {user.specialization || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {user.licenseNumber || "N/A"}
                          </td>
                        </>
                      )}
                      {activeTab === "doctors" && (
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              user.isApproved
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                            }`}
                          >
                            {user.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>
                      )}
                      {activeTab === "patients" && (
                        <>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {user.age || "N/A"}
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {user.gender || "N/A"}
                          </td>
                        </>
                      )}
                      {activeTab === "pending" && (
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(user._id)}
                              disabled={approvingId === user._id}
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(user._id)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
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
