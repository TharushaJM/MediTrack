import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, AlertCircle } from "lucide-react";

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

export default function DoctorPatientReports({
  patientId: patientIdProp,
  onBack,
}) {
  const navigate = useNavigate();
  const { patientId: patientIdParam } = useParams();
  const patientId = patientIdProp || patientIdParam;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = cleanToken(localStorage.getItem("token") || "");

  const fetchReports = async () => {
    setError("");
    setLoading(true);

    if (!patientId) {
      setLoading(false);
      setReports([]);
      setError("No patient selected");
      return;
    }

    try {
      const { data } = await axios.get(
        `${API_URL}/api/doctor/patients/${patientId}/reports`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "Failed to load reports (maybe patient didn’t share)";
      setError(msg);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Patient Reports
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Only visible if the patient shared reports with you.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            Loading reports...
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  Access / Load Error
                </p>
                <p className="text-sm text-red-700/80 dark:text-red-300/80 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8">
            <p className="text-gray-800 dark:text-gray-200 font-semibold">
              No reports found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This patient has no uploaded medical reports yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r) => {
              const url = buildFileUrl(r.fileUrl);
              const isPdf = url.toLowerCase().endsWith(".pdf");
              const isImage =
                url.toLowerCase().endsWith(".png") ||
                url.toLowerCase().endsWith(".jpg") ||
                url.toLowerCase().endsWith(".jpeg") ||
                url.toLowerCase().endsWith(".webp");

              return (
                <div
                  key={r._id}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {r.type || "Report"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {r.title || "Untitled"}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <FileText className="w-5 h-5 text-[#007BFF]" />
                    </div>
                  </div>

                  {/* Preview (simple) */}
                  {isImage ? (
                    <img
                      src={url}
                      alt="report"
                      className="mt-4 w-full h-44 object-cover rounded-xl border border-gray-200 dark:border-gray-800"
                    />
                  ) : isPdf ? (
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      PDF file (open to view)
                    </div>
                  ) : null}

                  {/* Extracted text (optional) */}
                  {r.extractedText ? (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Extracted Text
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-4 whitespace-pre-wrap">
                        {r.extractedText}
                      </p>
                    </div>
                  ) : null}

                  {/* Buttons */}
                  <div className="mt-4 flex gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#007BFF] hover:bg-[#0056b3] text-white text-sm font-semibold"
                    >
                      Open
                    </a>

                    <a
                      href={url}
                      download
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Download
                    </a>
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    Uploaded:{" "}
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
