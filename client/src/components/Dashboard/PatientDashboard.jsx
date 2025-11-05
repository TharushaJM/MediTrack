import { useEffect, useState } from "react";
import axios from "axios";
import AddRecordForm from "./AddRecordForm";

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Fetch all records for this user
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/records", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRecords(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        My Health Records
      </h1>

      <div className="text-center mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? "Cancel" : "Add New Record"}
        </button>
      </div>

      {showForm && (
        <AddRecordForm
          onAdd={(newRecord) => setRecords([...records, newRecord])}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Display records */}
      <div className="mt-6">
        {records.length === 0 ? (
          <p className="text-gray-600 text-center">No records found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((r) => (
              <div
                key={r._id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg text-blue-700 mb-2">
                  {r.title || "Unnamed Record"}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  Date: {new Date(r.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700">{r.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
