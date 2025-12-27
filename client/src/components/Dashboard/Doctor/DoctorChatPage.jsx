import { useEffect, useState } from "react";
import axios from "axios";
import DoctorChat from "../components/Dashboard/Doctor/DoctorChat/DoctorChat"; // adjust path

const API = "http://localhost:5000";
const cleanToken = (t) => (t || "").replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();

export default function DoctorChatPage() {
  const token = cleanToken(localStorage.getItem("token"));
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      const { data } = await axios.get(`${API}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const conv = data.conversations || [];
      setPatients(conv);

      if (!selectedPatientId && conv[0]?.id) {
        setSelectedPatientId(conv[0].id);
      }
    };

    load();
  }, [token, selectedPatientId]);

  return (
    // IMPORTANT: no full-page sidebar here, because your main layout already has it
    <div className="h-[650px] flex gap-4">
      {/* LEFT INSIDE PAGE: Patient list */}
      <div className="w-80 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Patients
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your conversations
          </p>
        </div>

        <div className="overflow-y-auto h-[580px]">
          {patients.map((c) => {
            const u = c.user;
            const active = String(c.id) === String(selectedPatientId);

            return (
              <button
                key={c.id}
                onClick={() => setSelectedPatientId(c.id)}
                className={`w-full text-left px-4 py-3 border-b dark:border-gray-800 ${
                  active ? "bg-blue-50 dark:bg-gray-800" : ""
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {u.firstName} {u.lastName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {c.lastMessage?.text || "No messages yet"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT INSIDE PAGE: Chat */}
      <div className="flex-1">
        {selectedPatientId ? (
          <DoctorChat patientId={selectedPatientId} />
        ) : (
          <div className="h-[650px] rounded-xl border dark:border-gray-800 flex items-center justify-center text-gray-500">
            Select a patient to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
