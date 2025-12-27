import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  Search,
  Calendar,
  BadgeCheck,
  AlertCircle,
  Clock,
  UserRound,
  Stethoscope,
  FileText,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ---------------- helpers ---------------- */

const cleanToken = (t = "") =>
  String(t).replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();

// ✅ build correct url for image paths like "/uploads/profiles/xxx.jpg"
const buildImgUrl = (imgPath) => {
  if (!imgPath) return "";
  if (imgPath.startsWith("http") || imgPath.startsWith("blob:")) return imgPath;
  return `${API_URL}${imgPath.startsWith("/") ? imgPath : `/${imgPath}`}`;
};

const avatarFallback = (firstName = "", lastName = "") => {
  const name = `${firstName} ${lastName}`.trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0D8ABC&color=fff&size=128`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  // if "2025-12-30" valid -> show Dec 30
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return dateStr; // fallback if already formatted
};

/* ---------------- UI atoms ---------------- */

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();

  let cls =
    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ";

  if (s === "pending") cls += "bg-amber-50 text-amber-700 border-amber-200";
  else if (s === "confirmed") cls += "bg-blue-50 text-blue-700 border-blue-200";
  else if (s === "completed")
    cls += "bg-green-50 text-green-700 border-green-200";
  else if (s === "cancelled" || s === "canceled")
    cls += "bg-red-50 text-red-700 border-red-200";
  else cls += "bg-gray-50 text-gray-700 border-gray-200";

  const icon =
    s === "pending" ? (
      <Clock className="w-3 h-3" />
    ) : s === "confirmed" ? (
      <BadgeCheck className="w-3 h-3" />
    ) : s === "completed" ? (
      <BadgeCheck className="w-3 h-3" />
    ) : s === "cancelled" || s === "canceled" ? (
      <AlertCircle className="w-3 h-3" />
    ) : (
      <Calendar className="w-3 h-3" />
    );

  return (
    <span className={cls}>
      {icon}
      {status || "Unknown"}
    </span>
  );
}

function Panel({ title, subtitle, icon: Icon, children, right }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="p-5 border-b dark:border-gray-800 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-gray-800">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <span className="px-2 py-1 rounded-md bg-white/70 dark:bg-gray-900/60 text-xs border border-gray-200 dark:border-gray-700">
      {label}: <b>{value ?? "—"}</b>
    </span>
  );
}

/* ---------------- main component ---------------- */

export default function DoctorPatients({ onOpenChat }) {
  const [patients, setPatients] = useState([]); // from /api/doctor/patients
  const [selected, setSelected] = useState(null); // { patient, lastAppointment, totalAppointments... }
  const [patientDetails, setPatientDetails] = useState(null); // { patient, appointments }

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | recent | pending | completed

  const token = cleanToken(localStorage.getItem("token") || "");

  const fetchPatients = async () => {
    setError("");
    setLoadingList(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/doctor/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load patients";
      setError(msg);
      setPatients([]);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    setError("");
    setLoadingDetails(true);
    try {
      const { data } = await axios.get(
        `${API_URL}/api/doctor/patients/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatientDetails(data);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load patient details";
      setError(msg);
      setPatientDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPatients = useMemo(() => {
    let list = [...patients];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((x) => {
        const p = x.patient || {};
        const name = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
        const email = (p.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    if (filter === "pending")
      list = list.filter((x) => (x.pendingCount || 0) > 0);

    if (filter === "completed")
      list = list.filter(
        (x) => (x.lastAppointment?.status || "").toLowerCase() === "completed"
      );

    if (filter === "recent") list = list.slice(0, 20);

    return list;
  }, [patients, search, filter]);

  const onSelectPatient = (item) => {
    setSelected(item);
    setPatientDetails(null);

    const pid = item?.patient?._id;
    if (pid) fetchPatientDetails(pid);
  };

  // Prefer details patient (fresh), fallback to selected.patient
  const selectedPatient = patientDetails?.patient || selected?.patient || null;
  const appointments = patientDetails?.appointments || [];

  const selectedAvatar = selectedPatient?.profileImage
    ? buildImgUrl(selectedPatient.profileImage)
    : avatarFallback(selectedPatient?.firstName, selectedPatient?.lastName);

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Panel
          title="My Patients"
          subtitle="Only patients who booked at least one appointment with you will appear here."
          icon={Users}
          right={
            <button
              onClick={fetchPatients}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingList ? "animate-spin" : ""}`} />
              Refresh
            </button>
          }
        >
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          ) : null}
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Patient list */}
          <div className="lg:col-span-1">
            <Panel
              title="Patient List"
              subtitle="Search and select a patient to view details."
              icon={UserRound}
            >
              {/* Search */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: "all", label: "All" },
                  { key: "recent", label: "Recent" },
                  { key: "pending", label: "Pending" },
                  { key: "completed", label: "Completed" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      filter === f.key
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* List */}
              {loadingList ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Loading patients...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    No patients yet
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Patients will appear here after they book an appointment with you.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map((item) => {
                    const p = item.patient || {};
                    const isActive = selected?.patient?._id === p._id;

                    const avatarSrc = p.profileImage
                      ? buildImgUrl(p.profileImage)
                      : avatarFallback(p.firstName, p.lastName);

                    return (
                      <button
                        key={p._id}
                        onClick={() => onSelectPatient(item)}
                        className={`w-full text-left rounded-xl border p-3 transition ${
                          isActive
                            ? "border-blue-500 bg-blue-50 dark:bg-gray-800"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {/* TOP ROW */}
                        <div className="flex items-center gap-3">
                          {/* ✅ Avatar */}
                          <img
                            src={avatarSrc}
                            alt={`${p.firstName} ${p.lastName}`}
                            className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                            onError={(e) => {
                              e.currentTarget.src = avatarFallback(p.firstName, p.lastName);
                            }}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {p.email || "—"}
                            </p>
                          </div>

                          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                            <div>
                              Total:{" "}
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {item.totalAppointments || 0}
                              </span>
                            </div>
                            <div>
                              Pending:{" "}
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {item.pendingCount || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM ROW */}
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last: {formatDate(item.lastAppointment?.date)} •{" "}
                            {item.lastAppointment?.timeSlot || "—"}
                          </p>
                          <StatusBadge status={item.lastAppointment?.status} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
              {/* Header gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-white text-xl font-bold flex items-center gap-2">
                      <Stethoscope className="w-6 h-6" />
                      Patient Details
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Profile + appointment history for selected patient
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/20 text-white text-sm inline-flex items-center gap-2 disabled:opacity-50"
                      disabled={!selectedPatient}
                      onClick={() => {
                        const pid = selectedPatient?._id;
                        if (!pid) return;
                        onOpenChat?.(pid);
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </button>

                    <button
                      className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/20 text-white text-sm inline-flex items-center gap-2 disabled:opacity-50"
                      disabled={!selectedPatient}
                      onClick={() => {
                        if (!selectedPatient) return;
                        alert("Reports feature: connect next");
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      Reports
                    </button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {!selected ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      Select a patient to view details
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Choose a patient from the left panel. You’ll see their profile and your appointment history.
                    </p>
                  </div>
                ) : loadingDetails ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Loading patient details...
                  </div>
                ) : !selectedPatient ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      Patient details not available.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ✅ Profile header row (avatar + name + email) */}
                    <div className="flex items-center gap-4 mb-5">
                      <img
                        src={selectedAvatar}
                        alt="Patient"
                        className="w-14 h-14 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                        onError={(e) => {
                          e.currentTarget.src = avatarFallback(
                            selectedPatient?.firstName,
                            selectedPatient?.lastName
                          );
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {selectedPatient.email || "—"}
                        </p>
                      </div>
                    </div>

                    {/* ✅ Profile cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* left card */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Patient Info
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Pill label="Age" value={selectedPatient.age} />
                          <Pill label="Gender" value={selectedPatient.gender} />
                          <Pill label="Blood" value={selectedPatient.bloodType} />
                        </div>

                        {selectedPatient.injuryCondition ? (
                          <div className="mt-4 inline-flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-gray-700 w-full">
                            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                              Condition:
                            </span>
                            <span className="text-xs text-amber-900 dark:text-gray-200">
                              {selectedPatient.injuryCondition}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-4 text-xs text-gray-400">Condition: —</div>
                        )}
                      </div>

                      {/* right card */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Health Snapshot
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
                            Height: <b>{selectedPatient.height ?? "—"}</b>
                          </div>
                          <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
                            Weight: <b>{selectedPatient.weight ?? "—"}</b>
                          </div>
                          <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 col-span-2">
                            Joined:{" "}
                            <b>
                              {selectedPatient.createdAt
                                ? new Date(selectedPatient.createdAt).toLocaleDateString()
                                : "—"}
                            </b>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ✅ Appointment history */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Appointment History
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Only appointments between you and this patient
                      </p>

                      {appointments.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-200">
                            No appointment history found.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 mt-3">
                          {appointments.map((a) => (
                            <div
                              key={a._id}
                              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {formatDate(a.date)} • {a.timeSlot || "—"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Reason: {a.reason || "—"}
                                  </p>
                                </div>
                                <StatusBadge status={a.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* extra space / future panels */}
          </div>
        </div>
      </div>
    </div>
  );
}
