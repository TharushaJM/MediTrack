import { useEffect, useState } from "react";
import axios from "axios";
import AddRecordForm from "./AddRecordForm";
import WellnessChart from "./WellnessChart";
import MetricChart from "./MetricChart";

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState("simple");

  async function fetchRecords() {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Error fetching records", err);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Health Hub</h1>
          <p className="text-gray-500">
            Track and monitor your wellness journey
          </p>
        </header>

        {/* Stats Section */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <StatCard label="Total Records" value={records.length} sub="+3 this week" icon="📅" />
          <StatCard
            label="Last Update"
            value={
              records[0]
                ? new Date(records[0].date || records[0].createdAt).toLocaleDateString()
                : "—"
            }
            sub={records[0] ? "Updated recently" : ""}
            icon="📈"
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
            icon="📊"
          />
        </div>

        {/* Health Records Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Health Records
              </h2>
              <p className="text-sm text-gray-500">
                View and manage your health data
              </p>
            </div>

            {/* View toggle and Add button */}
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("simple")}
                  className={`px-4 py-2 text-sm rounded-md font-medium transition ${
                    viewMode === "simple"
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Simple View
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={`px-4 py-2 text-sm rounded-md font-medium transition ${
                    viewMode === "chart"
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Graph View
                </button>
              </div>

              <button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
              >
                + Add Record
              </button>
            </div>
          </div>

          {/* View Modes */}
          {viewMode === "simple" ? (
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

// ------------------------
// Supporting Components
// ------------------------

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <span className="text-gray-400 text-xl">{icon}</span>
        <div className="text-right">
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function SimpleView({ records, onDelete }) {
  if (!records.length)
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center text-gray-500">
        No records yet. Click <span className="font-semibold">“Add Record”</span> to create one.
      </div>
    );

  return (
    <div className="space-y-4">
      {records.map((r, i) => (
        <div
          key={r._id || i}
          className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">
              {new Date(r.date || r.createdAt).toLocaleDateString()}
            </h3>
            <span className="text-sm text-gray-400">#{i + 1}</span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-700 mb-2">
            {r.sleepHours && (
              <Metric label="Sleep" value={`${r.sleepHours}h`} icon="🌙" />
            )}
            {r.waterIntake && (
              <Metric label="Water" value={`${r.waterIntake}L`} icon="💧" />
            )}
            {r.mood && <Metric label="Mood" value={`${r.mood}/10`} icon="😊" />}
            {r.bmi && <Metric label="BMI" value={r.bmi} icon="📈" />}
          </div>

          {r.notes && (
            <p className="text-sm italic text-gray-500">{r.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="flex items-center gap-20">
      <span className="text-blue-600 ">{icon}</span>
      <div>
        <div className="font-medium text-gray-800">{label}</div>
        <div className="text-gray-500">{value}</div>
      </div>
    </div>
  );
}

function GraphView({ records }) {
  if (!records.length)
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center text-gray-500">
        Not enough data to display charts.
      </div>
    );

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricChart title="Mood" data={records} dataKey="mood" color="#6366f1" unit="/10" />
        <MetricChart title="Sleep" data={records} dataKey="sleepHours" color="#22c55e" unit="hrs" />
        <MetricChart title="Water Intake" data={records} dataKey="waterIntake" color="#06b6d4" unit="L" />
        <MetricChart title="BMI" data={records} dataKey="bmi" color="#f59e0b" unit="" />
      </div>
      <div className="mt-8">
        <WellnessChart records={records} />
      </div>
    </>
  );
}
