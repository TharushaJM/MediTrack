import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTheme } from "../../../context/ThemeContext";
import PatientChat from "./PatientChat";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const cleanToken = (t) =>
  (t || "").replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();

const formatClock = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function PatientChatPage() {
  const { darkMode } = useTheme();
  const token = useMemo(() => cleanToken(localStorage.getItem("token")), []);
  const me = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
  const myUserId = (me?.id || me?._id || "").toString();

  const [doctors, setDoctors] = useState([]); // { ...doctor, lastText, lastTime }
  const [loading, setLoading] = useState(false);

  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const loadDoctors = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`${API}/api/patient/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // normalize shape + add preview fields
      const list = (Array.isArray(data) ? data : [])
        .map((x) => x.doctor || x)
        .filter(Boolean)
        .map((d) => ({
          ...d,
          lastText: d.lastText || "",  // if backend doesn't send these, it's ok
          lastTime: d.lastTime || "",
        }));

      setDoctors(list);

      if (!selectedDoctorId && list[0]?._id) {
        setSelectedDoctorId(list[0]._id);
        setSelectedDoctor(list[0]);
      }
    } catch (e) {
      console.log("loadDoctors error:", e?.response?.data || e.message);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="p-8">
      <div className="h-[650px] flex gap-4">
        {/* LEFT: doctor list */}
        <div
          className={`w-80 rounded-xl border overflow-hidden ${
            darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`p-4 border-b ${
              darkMode ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <h2
              className={`font-semibold ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Doctors
            </h2>
            <p
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Select a doctor to chat
            </p>
          </div>

          <div className="overflow-y-auto h-[580px]">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                No doctors found (book an appointment first).
              </div>
            ) : (
              doctors.map((d) => {
                const active = String(d._id) === String(selectedDoctorId);
                const avatar = d.profileImage
                  ? d.profileImage.startsWith("http")
                    ? d.profileImage
                    : `${API}${d.profileImage}`
                  : null;

                return (
                  <button
                    key={d._id}
                    onClick={() => {
                      setSelectedDoctorId(d._id);
                      setSelectedDoctor(d);
                    }}
                    className={`w-full text-left px-4 py-3 border-b ${
                      darkMode ? "border-gray-800" : "border-gray-200"
                    } ${active ? (darkMode ? "bg-gray-800" : "bg-blue-50") : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                          {(d.firstName?.[0] || "") + (d.lastName?.[0] || "")}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-medium ${
                            darkMode ? "text-gray-100" : "text-gray-900"
                          }`}
                        >
                          Dr. {d.firstName} {d.lastName}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`text-xs truncate ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {d.lastText || d.specialization || "No messages yet"}
                          </div>
                          <div
                            className={`text-[11px] ${
                              darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {formatClock(d.lastTime)}
                          </div>
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
          {selectedDoctorId ? (
            <PatientChat
              doctorId={selectedDoctorId}
              doctor={selectedDoctor}
              onNewMessage={(msg) => {
                // ✅ update preview + move doctor to top (same as Doctor side)
                const sender = msg?.sender?._id?.toString?.() || "";
                const receiver = msg?.receiver?._id?.toString?.() || "";
                const otherId = sender === myUserId ? receiver : sender;

                if (!otherId) return;

                setDoctors((prev) => {
                  const copy = [...prev];
                  const i = copy.findIndex((x) => String(x._id) === String(otherId));
                  if (i === -1) return prev;

                  const item = copy.splice(i, 1)[0];
                  item.lastText = msg.text || "";
                  item.lastTime = msg.createdAt || new Date().toISOString();

                  // keep selectedDoctor object fresh
                  if (String(selectedDoctorId) === String(item._id)) {
                    setSelectedDoctor(item);
                  }

                  return [item, ...copy];
                });
              }}
            />
          ) : (
            <div
              className={`h-[650px] rounded-xl p-6 border flex items-center justify-center ${
                darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
              }`}
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Select a doctor to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
