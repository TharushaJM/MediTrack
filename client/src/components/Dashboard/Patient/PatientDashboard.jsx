import { useEffect, useState } from "react";
import axios from "axios";
import AddRecordForm from "./AddRecordForm";
import WellnessChart from "./WellnessChart";
import MetricChart from "./MetricChart";
import {
  PlusCircle,
  BarChart2,
  LayoutList,
  Activity,
  Calendar,
  TrendingUp,
  Moon,
  Droplets,
  Smile,
  Trash2,
  FileText,
  Flame,
  Heart,
  Weight,
  ArrowUp,
  ArrowDown,
  Target,
  Award,
  Zap,
} from "lucide-react";

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState("simple");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);

  // ✅ Fetch records
  async function fetchRecords() {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (err) {
      console.error("Error fetching records", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  }

  useEffect(() => {
    fetchRecords();
    fetchProfile();
  }, []);

  async function handleDelete(id) {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/records/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting record", err);
    }
  }

  // Calculate health metrics
  const getHealthMetrics = () => {
    if (!records.length) return null;

    // Current week's records
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = records.filter((r) => new Date(r.createdAt) >= weekAgo);
    const lastWeek = records.filter(
      (r) =>
        new Date(r.createdAt) >= new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) &&
        new Date(r.createdAt) < weekAgo
    );

    // Calculate streak (consecutive days with records)
    const sortedDates = records
      .map((r) => new Date(r.date || r.createdAt).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    let currentDate = new Date();
    for (let date of sortedDates) {
      const recordDate = new Date(date);
      const diffDays = Math.floor(
        (currentDate - recordDate) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    // Average sleep
    const sleepRecords = records.filter((r) => r.sleepHours);
    const avgSleep =
      sleepRecords.length > 0
        ? (
            sleepRecords.reduce((sum, r) => sum + r.sleepHours, 0) /
            sleepRecords.length
          ).toFixed(1)
        : 0;

    // Sleep goal progress
    const sleepGoal = 8;
    const sleepProgress = Math.min((avgSleep / sleepGoal) * 100, 100);

    // Average mood
    const moodRecords = records.filter((r) => r.mood);
    const avgMood =
      moodRecords.length > 0
        ? (
            moodRecords.reduce((sum, r) => sum + r.mood, 0) / moodRecords.length
          ).toFixed(1)
        : 0;

    // Water intake today
    const today = new Date().toDateString();
    const todayRecord = records.find(
      (r) => new Date(r.date || r.createdAt).toDateString() === today
    );
    const waterToday = todayRecord?.waterIntake || 0;
    const waterGoal = 2.5;
    const waterProgress = Math.min((waterToday / waterGoal) * 100, 100);

    return {
      streak,
      avgSleep,
      sleepProgress,
      avgMood,
      waterToday,
      waterProgress,
      waterGoal,
      thisWeekCount: thisWeek.length,
      lastWeekCount: lastWeek.length,
    };
  };

  const metrics = getHealthMetrics();

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome back, {profile?.firstName || "there"}! 
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your health overview for today
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
              text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl 
              transition-all duration-200 font-semibold"
          >
            <PlusCircle className="w-5 h-5" />
            Log Health Data
          </button>
        </header>

        {/* Health Metric Cards - Inspired by your screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Logging Streak Card */}
          <HealthMetricCard
            icon={<Flame className="w-6 h-6" />}
            iconBg="bg-orange-500/10 dark:bg-orange-500/20"
            iconColor="text-orange-600 dark:text-orange-400"
            label="Logging Streak"
            value={`${metrics?.streak || 0} Days`}
            subtitle={
              metrics?.streak > 0
                ? `Keep it going! 🔥`
                : "Start tracking today"
            }
            borderColor="border-orange-200 dark:border-orange-900/30"
          />

          {/* Sleep Average Card */}
          <HealthMetricCard
            icon={<Moon className="w-6 h-6" />}
            iconBg="bg-blue-500/10 dark:bg-blue-500/20"
            iconColor="text-blue-600 dark:text-blue-400"
            label="Sleep Average"
            value={`${metrics?.avgSleep || 0}h`}
            subtitle="This week's average"
            progress={metrics?.sleepProgress || 0}
            progressText={`${Math.round(metrics?.sleepProgress || 0)}% of 8h goal`}
            borderColor="border-blue-200 dark:border-blue-900/30"
          />

          {/* Mood Score Card */}
          <HealthMetricCard
            icon={<Smile className="w-6 h-6" />}
            iconBg="bg-yellow-500/10 dark:bg-yellow-500/20"
            iconColor="text-yellow-600 dark:text-yellow-400"
            label="Mood Score"
            value={`${metrics?.avgMood || 0}/10`}
            subtitle={
              metrics?.avgMood >= 7
                ? "Feeling great! 😊"
                : metrics?.avgMood >= 5
                ? "Doing okay 😌"
                : "Take care of yourself 💙"
            }
            borderColor="border-yellow-200 dark:border-yellow-900/30"
          />

          {/* Water Intake Card */}
          <HealthMetricCard
            icon={<Droplets className="w-6 h-6" />}
            iconBg="bg-cyan-500/10 dark:bg-cyan-500/20"
            iconColor="text-cyan-600 dark:text-cyan-400"
            label="Water Today"
            value={`${metrics?.waterToday || 0}L`}
            subtitle="Daily intake"
            badge={
              metrics?.waterToday >= metrics?.waterGoal
                ? "Goal reached! 💧"
                : `${(metrics?.waterGoal - metrics?.waterToday).toFixed(1)}L to go`
            }
            progress={metrics?.waterProgress || 0}
            borderColor="border-cyan-200 dark:border-cyan-900/30"
          />
        </div>

        {/* Records Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Health Records
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {records.length} total entries • Last updated{" "}
                {records[0]
                  ? new Date(records[0].createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode("simple")}
                  className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all ${
                    viewMode === "simple"
                      ? "bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <LayoutList className="w-4 h-4 inline mr-1.5" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all ${
                    viewMode === "chart"
                      ? "bg-white dark:bg-gray-900 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <BarChart2 className="w-4 h-4 inline mr-1.5" />
                  Charts
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              Loading records...
            </div>
          ) : viewMode === "simple" ? (
            <SimpleView records={records} onDelete={handleDelete} />
          ) : (
            <GraphView records={records} />
          )}
        </div>

        {/* Add Record Modal */}
        {open && (
          <AddRecordForm
            profile={profile}
            onClose={() => setOpen(false)}
            onCreated={(r) => {
              setRecords((prev) => [r, ...prev]);
              setOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* -----------------------
   COMPONENTS
------------------------ */

// New Health Metric Card Component (inspired by the screenshot)
function HealthMetricCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subtitle,
  badge,
  progress,
  progressText,
  borderColor,
}) {
  return (
    <div
      className={`relative bg-gradient-to-br from-white to-gray-50 
        dark:from-gray-900 dark:to-gray-950 
        border-2 ${borderColor}
        rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 
        hover:-translate-y-1 group`}
    >
      {/* Icon */}
      <div className={`${iconBg} ${iconColor} p-3 rounded-xl w-fit mb-4`}>
        {icon}
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {subtitle}
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full mb-3">
          {badge}
        </div>
      )}

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progressText && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-right font-medium">
              {progressText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div
      className="bg-white dark:bg-gray-900 
        border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {value}
          </div>
          {sub && (
            <div className="text-xs text-green-600 dark:text-green-400">
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SimpleView({ records, onDelete }) {
  if (!records.length)
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 
        border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Start Your Health Journey
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
              Track your daily wellness metrics like sleep, mood, water intake, and more.
              <br />
              Click{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                "Log Health Data"
              </span>{" "}
              to begin!
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      {records.map((r, i) => (
        <div
          key={r._id || i}
          className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 
            bg-white dark:bg-gray-900 shadow-sm hover:shadow-md 
            transition-all duration-200 group relative overflow-hidden"
        >
          {/* Decorative gradient bar on left */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500" />

          {/* Header with Date and Actions */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {new Date(r.date || r.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Health Check-in • {new Date(r.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDelete(r._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity
                p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                rounded-xl flex items-center gap-2 text-sm font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {r.sleepHours && (
              <MetricBadge
                icon={<Moon className="w-4 h-4" />}
                label="Sleep"
                value={`${r.sleepHours}h`}
                color="blue"
              />
            )}
            {r.waterIntake && (
              <MetricBadge
                icon={<Droplets className="w-4 h-4" />}
                label="Water"
                value={`${r.waterIntake}L`}
                color="cyan"
              />
            )}
            {r.mood && (
              <MetricBadge
                icon={<Smile className="w-4 h-4" />}
                label="Mood"
                value={`${r.mood}/10`}
                color="yellow"
              />
            )}
            {r.bmi && (
              <MetricBadge
                icon={<Activity className="w-4 h-4" />}
                label="BMI"
                value={r.bmi}
                color="purple"
              />
            )}
          </div>

          {/* Notes */}
          {r.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {r.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Enhanced MetricBadge Component with better styling
function MetricBadge({ icon, label, value, color }) {
  const colors = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    cyan: "bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    yellow:
      "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    purple:
      "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  };

  return (
    <div
      className={`${colors[color]} rounded-xl p-3 flex items-center gap-2 border shadow-sm`}
    >
      {icon}
      <div>
        <div className="text-xs opacity-75 font-medium">{label}</div>
        <div className="font-bold text-base">{value}</div>
      </div>
    </div>
  );
}

function GraphView({ records }) {
  if (!records.length)
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 
        border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Not enough data for charts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
              Log at least 3-5 health records to see beautiful charts and visualize your wellness trends over time.
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Mini Metric Charts Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricChart
          title="Mood Trend"
          data={records}
          dataKey="mood"
          color="#6366f1"
          unit="/10"
        />
        <MetricChart
          title="Sleep Quality"
          data={records}
          dataKey="sleepHours"
          color="#22c55e"
          unit="hrs"
        />
        <MetricChart
          title="Hydration"
          data={records}
          dataKey="waterIntake"
          color="#06b6d4"
          unit="L"
        />
        <MetricChart
          title="Body Mass Index"
          data={records}
          dataKey="bmi"
          color="#f59e0b"
          unit=""
        />
      </div>

      {/* Main Wellness Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Overall Wellness Trends
        </h3>
        <WellnessChart records={records} />
      </div>
    </div>
  );
}
