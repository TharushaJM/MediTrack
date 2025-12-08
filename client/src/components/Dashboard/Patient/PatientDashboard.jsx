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
} from "lucide-react";

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState("simple");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchRecords();
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
              Your Health Hub
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Track and monitor your wellness journey effortlessly
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 
              bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
              text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl 
              transition-all duration-200 font-medium"
          >
            <PlusCircle className="w-5 h-5" />
            Add Record
          </button>
        </header>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <StatCard
            label="Total Records"
            value={records.length}
            sub="+3 this week"
            icon={<Activity className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
            color="from-blue-100 to-blue-50"
          />
          <StatCard
            label="Last Update"
            value={
              records[0]
                ? new Date(
                    records[0].date || records[0].createdAt
                  ).toLocaleDateString()
                : "—"
            }
            sub={records[0] ? "Updated recently" : ""}
            icon={<Calendar className="w-6 h-6 text-green-500 dark:text-green-400" />}
            color="from-green-100 to-green-50"
          />
          <StatCard
            label="This Month"
            value={
              records.filter(
                (r) =>
                  new Date(r.createdAt).getMonth() === new Date().getMonth()
              ).length
            }
            sub="Records logged"
            icon={<TrendingUp className="w-6 h-6 text-purple-500 dark:text-purple-400" />}
            color="from-purple-100 to-purple-50"
          />
        </div>

        {/* Records Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <LayoutList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Health Records
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and manage your daily health insights
              </p>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("simple")}
                  className={`px-4 py-2 text-sm rounded-md font-medium transition ${
                    viewMode === "simple"
                      ? "bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-100"
                  }`}
                >
                  Simple View
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={`px-4 py-2 text-sm rounded-md font-medium transition ${
                    viewMode === "chart"
                      ? "bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-100"
                  }`}
                >
                  Graph View
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

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} dark:from-gray-800 dark:to-gray-750 
        border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition`}
    >
      <div className="flex justify-between items-center mb-2">
        {icon}
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
          {sub && <div className="text-xs text-gray-400 dark:text-gray-500">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function SimpleView({ records, onDelete }) {
  if (!records.length)
    return (
      <div className="bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center text-gray-500 dark:text-gray-400">
        No records yet. Click <span className="font-semibold">“Add Record”</span> to create one.
      </div>
    );

  return (
    <div className="space-y-4">
      {records.map((r, i) => (
        <div
          key={r._id || i}
          className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              {new Date(r.date || r.createdAt).toLocaleDateString()}
            </h3>
            <button
              onClick={() => onDelete(r._id)}
              className="text-red-500 dark:text-red-400 text-sm hover:underline"
            >
              Delete
            </button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-700 dark:text-gray-200 mb-2">
            {r.sleepHours && <Metric label="Sleep" value={`${r.sleepHours}h`} />}
            {r.waterIntake && <Metric label="Water" value={`${r.waterIntake}L`} />}
            {r.mood && <Metric label="Mood" value={`${r.mood}/10`} />}
            {r.bmi && <Metric label="BMI" value={r.bmi} />}
          </div>

          {r.notes && <p className="text-sm italic text-gray-500 dark:text-gray-400">{r.notes}</p>}
        </div>
      ))}
    </div>
  );
}

// ✅ Updated Metric Component with matching Lucide icons
function Metric({ label, value }) {
  const icons = {
    Sleep: <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    Water: <Droplets className="w-4 h-4 text-cyan-500" />,
    Mood: <Smile className="w-4 h-4 text-yellow-500" />,
    BMI: <BarChart2 className="w-4 h-4 text-purple-500" />,
  };

  return (
    <div className="flex items-center gap-3">
      {icons[label] || <Smile className="w-4 h-4 text-gray-400" />}
      <div>
        <div className="font-medium text-gray-800 dark:text-gray-100">{label}</div>
        <div className="text-gray-500 dark:text-gray-400 text-sm">{value}</div>
      </div>
    </div>
  );
}

function GraphView({ records }) {
  if (!records.length)
    return (
      <div className="bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center text-gray-500 dark:text-gray-400">
        Not enough data to display charts.
      </div>
    );

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricChart
          title="Mood"
          data={records}
          dataKey="mood"
          color="#6366f1"
          unit="/10"
        />
        <MetricChart
          title="Sleep"
          data={records}
          dataKey="sleepHours"
          color="#22c55e"
          unit="hrs"
        />
        <MetricChart
          title="Water Intake"
          data={records}
          dataKey="waterIntake"
          color="#06b6d4"
          unit="L"
        />
        <MetricChart
          title="BMI"
          data={records}
          dataKey="bmi"
          color="#f59e0b"
          unit=""
        />
      </div>
      <WellnessChart records={records} />
    </>
  );
}

