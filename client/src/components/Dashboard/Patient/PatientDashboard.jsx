import { useEffect, useState } from "react";
import axios from "axios";
import AddRecordForm from "./AddRecordForm"; // ✅ Adjust path if needed
import WellnessChart from "./WellnessChart";

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [open, setOpen] = useState(false);

  async function fetchRecords() {
    const token = localStorage.getItem("token");
    const { data } = await axios.get("http://localhost:5000/api/records", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // sort by latest first
    setRecords(
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  async function handleDelete(id) {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/records/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRecords((prev) => prev.filter((r) => r._id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Your Health Hub
            </h1>
            <p className="text-gray-600">
              Track symptoms, vitals, and checkups — no files required.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add record
          </button>
        </header>

        {/* Stats row */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total records" value={records.length} color="blue" />
          <StatCard
            label="Last update"
            value={
              records[0]
                ? new Date(
                    records[0].date || records[0].createdAt
                  ).toLocaleDateString()
                : "—"
            }
            color="green"
          />
          <StatCard
            label="This month"
            value={
              records.filter(
                (r) =>
                  new Date(r.createdAt).getMonth() === new Date().getMonth()
              ).length
            }
            color="purple"
          />
        </div>

        {/* Record grid */}
        {records.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((r) => (
              <RecordCard
                key={r._id}
                record={r}
                onDelete={() => handleDelete(r._id)}
              />
            ))}
          </div>
        )}

        {/* Chart Section */}
        {records.length > 0 && (
          <div className="mt-10">
            <WellnessChart records={records} />
          </div>
        )}

        {/* Add Record Form Modal */}
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

function StatCard({ label, value, color }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  }[color];
  return (
    <div className={`p-4 rounded-xl ${colorMap}`}>
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border rounded-xl p-8 text-center text-gray-600">
      No records yet. Click{" "}
      <span className="font-semibold">“Add record”</span> to create your first
      entry.
    </div>
  );
}

function RecordCard({ record, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{record.title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(record.date || record.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Delete
        </button>
      </div>

      {record.description && (
        <p className="mt-3 text-gray-700 text-sm">{record.description}</p>
      )}

      {/* Quick vitals row if present */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600">
        {record.bpSystolic && record.bpDiastolic && (
          <div className="bg-gray-100 rounded p-2 text-center">
            <div className="font-semibold">BP</div>
            <div>
              {record.bpSystolic}/{record.bpDiastolic}
            </div>
          </div>
        )}
        {record.heartRate && (
          <div className="bg-gray-100 rounded p-2 text-center">
            <div className="font-semibold">HR</div>
            <div>{record.heartRate} bpm</div>
          </div>
        )}
        {record.sleepHours && (
          <div className="bg-gray-100 rounded p-2 text-center">
            <div className="font-semibold">Sleep</div>
            <div>{record.sleepHours} h</div>
          </div>
        )}
      </div>
    </div>
  );
}
