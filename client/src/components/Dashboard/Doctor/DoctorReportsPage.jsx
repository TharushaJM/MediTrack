import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, FileText, Loader2, AlertCircle, Download } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const cleanToken = (t = "") =>
  String(t)
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .trim();

const buildFileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

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

export default function DoctorReportsPage({ initialPatientId }) {
  const token = cleanToken(localStorage.getItem("token") || "");

  // LEFT
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientsError, setPatientsError] = useState("");

  // Selected patient
  const [selectedPatient, setSelectedPatient] = useState(null);

  // RIGHT
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState("");

  // Search
  const [search, setSearch] = useState("");

  const fetchPatients = async () => {
    setPatientsError("");
    setLoadingPatients(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/doctor/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = Array.isArray(data) ? data : [];
      setPatients(list);

      // ✅ auto-select patient if coming from "Records" button
      if (initialPatientId) {
        const found = list.find(
          (x) => String(x?.patient?._id) === String(initialPatientId)
        );
        if (found?.patient) {
          setSelectedPatient(found.patient);
          fetchReports(found.patient._id);
        }
      }
    } catch (e) {
      setPatients([]);
      setPatientsError(e?.response?.data?.message || "Failed to load patients");
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchReports = async (patientId) => {
    setReportsError("");
    setLoadingReports(true);
    try {
      const { data } = await axios.get(
        `${API_URL}/api/doctor/patients/${patientId}/reports`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      setReports([]);
      setReportsError(e?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoadingReports(false);
    }
  };

  const formatUploadDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(); // ex: 1/5/2026, 10:30 AM
  };

  const guessTitle = (r) => {
    // if backend provides a title, use it
    if (r?.title && String(r.title).trim()) return r.title;

    //  fallback to type (Blood Test, X-Ray, etc.)
    if (r?.type && String(r.type).trim()) return `${r.type} Report`;

    //  fallback to file name from URL
    const url = r?.fileUrl || "";
    const name = url.split("/").pop()?.split("?")[0] || "";
    if (name) return decodeURIComponent(name);

    return "Medical Report";
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((x) => {
      const p = x.patient || {};
      const name = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      const email = (p.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [patients, search]);

  return (
    <div className="p-8">
      {/* ✅ SAME AS CHAT PAGE LAYOUT */}
      <div className="h-[650px] flex gap-4">
        {/* LEFT: patients list */}
        <div className="w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Patients
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select a patient to view reports
            </p>

            <div className="mt-3 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none"
              />
            </div>

            {patientsError ? (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{patientsError}</span>
              </div>
            ) : null}
          </div>

          <div className="overflow-y-auto h-[520px]">
            {loadingPatients ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading patients...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                No patients found.
              </div>
            ) : (
              filteredPatients.map((item) => {
                const p = item.patient || {};
                const active = String(selectedPatient?._id) === String(p._id);

                const avatarSrc = p.profileImage
                  ? buildImgUrl(p.profileImage)
                  : avatarFallback(p.firstName, p.lastName);

                return (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSelectedPatient(p);
                      fetchReports(p._id);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-800 ${
                      active
                        ? "bg-blue-50 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarSrc}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = avatarFallback(
                            p.firstName,
                            p.lastName
                          );
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {p.email || "—"}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: reports */}
        <div className="flex-1">
          {!selectedPatient ? (
            <div className="h-[650px] bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-gray-400" />
                </div>
                <p className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
                  Select a Patient
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose a patient from the left.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[650px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Header like chat */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedPatient.profileImage
                        ? buildImgUrl(selectedPatient.profileImage)
                        : avatarFallback(
                            selectedPatient.firstName,
                            selectedPatient.lastName
                          )
                    }
                    className="w-10 h-10 rounded-full object-cover"
                    alt="patient"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedPatient.email}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Reports
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {reports.length}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto h-[585px]">
                {loadingReports ? (
                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading reports...
                  </div>
                ) : reportsError ? (
                  <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                    <div>
                      <div className="font-semibold">Error</div>
                      <div>{reportsError}</div>
                    </div>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400">
                    No reports found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.map((r) => {
                      const url = buildFileUrl(r.fileUrl);

                      return (
                        <div
                          key={r._id}
                          className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              
                              <p className="text-gray-900 dark:text-gray-100 font-semibold truncate">
                                {r.type || "Report"}
                              </p>
                              <p className="mt-3 text-xs text-gray-400">
                                Uploaded:{" "}
                                {formatUploadDateTime(
                                  r.createdAt || r.uploadedAt
                                )}
                              </p>
                            </div>
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>

                          {r.extractedText ? (
                            <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                              {r.extractedText}
                            </p>
                          ) : (
                            <p className="mt-3 text-gray-500 dark:text-gray-500 text-sm">
                              No extracted text
                            </p>
                          )}

                          <div className="mt-4 flex gap-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 text-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                            >
                              Open
                            </a>
                            <a
                              href={url}
                              download
                              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
