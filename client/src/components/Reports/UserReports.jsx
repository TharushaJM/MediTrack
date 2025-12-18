import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Upload,
  Eye,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  Filter,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

export default function UserReports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ✅ Fetch reports from backend
  async function fetchReports() {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.get("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(data);
      setFilteredReports(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports");
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  // ✅ Filter by report type
  useEffect(() => {
    if (filterType === "All") setFilteredReports(reports);
    else setFilteredReports(reports.filter((r) => r.type === filterType));
  }, [filterType, reports]);

  // ✅ Upload new report
  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    if (!reportType) return toast.error("Please select a report type");
    if (file.size > 10 * 1024 * 1024)
      return toast.error("File too large (max 10MB)");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", reportType);

    try {
      setUploading(true);
      setProgress(0);

      await axios.post("http://localhost:5000/api/reports/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / p.total);
          setProgress(percent);
        },
      });

      toast.success("Report uploaded successfully!");
      setFile(null);
      setReportType("");
      await new Promise((r) => setTimeout(r, 400));
      fetchReports();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  // ✅ Delete report
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Report deleted");
      fetchReports();
    } catch {
      toast.error("Error deleting report");
    }
  }

  // ✅ ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setPreviewUrl(null);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Medical Reports</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Upload and manage your medical documents
        </p>
      </div>

      {/* Upload Section */}
      <Card className="border-2 border-dashed border-blue-300 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Upload className="w-5 h-5" /> Upload New Report
          </CardTitle>
          <CardDescription>
            Upload PDF or image files of your medical reports
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleUpload} className="space-y-3 w-full">
            <div className="flex items-center gap-3 w-full">
              {/* Category Select */}
              <div className="relative">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="!w-[130px] h-[44px] text-sm border-gray-300 rounded-md focus:ring-0 focus:outline-none">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  {/* ⛔ Force dropdown to match trigger width */}
                  <SelectContent className="!w-[130px]">
                    <SelectItem value="Blood Test">🩸 Blood Test</SelectItem>
                    <SelectItem value="X-Ray">🦴 X-Ray</SelectItem>
                    <SelectItem value="MRI">🧠 MRI</SelectItem>
                    <SelectItem value="ECG">❤️ ECG</SelectItem>
                    <SelectItem value="Prescription">
                      💊 Prescription
                    </SelectItem>
                    <SelectItem value="Other">📄 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                id="file-input"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (!reportType) {
                    toast.error("Please select a category first");
                    e.target.value = "";
                    return;
                  }
                  if (selectedFile) setFile(selectedFile);
                }}
              />

              {/* Dynamic Single Button */}
              <button
                type={file ? "submit" : "button"}
                onClick={() => {
                  if (!file) {
                    if (!reportType)
                      return toast.error("Select a category first!");
                    document.getElementById("file-input").click();
                  }
                }}
                disabled={uploading}
                className={`flex-1 h-[44px] flex items-center justify-center gap-2 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl
        ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        }
      `}
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4 mr-1 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : file ? (
                  <>
                    <Upload className="w-4 h-4" /> Upload
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Choose File
                  </>
                )}
              </button>
            </div>

            {/* File Info */}
            {file && !uploading && (
              <div className="flex items-center justify-between text-sm bg-sky-50 text-sky-700 px-3 py-2 rounded-md animate-fadeIn">
                <span className="truncate">{file.name}</span>
                <span className="text-xs text-sky-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="relative w-full h-2 bg-sky-100 rounded-md overflow-hidden mt-2">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </form>

          {/* File type info */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 pt-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>PDF</span>
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>JPG, PNG</span>
            </div>
            <span>Max 10MB</span>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">
            All Reports ({filteredReports.length})
          </h2>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Blood Test">Blood Test</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="ECG">ECG</SelectItem>
                <SelectItem value="Prescription">Prescription</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Cards */}
        <div className="space-y-3">
          {filteredReports.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No reports found for this category.
            </p>
          )}

          {filteredReports.map((r) => (
            <Card
              key={r._id || r.fileUrl}
              className="p-4 flex items-center justify-between hover:shadow-sm border border-gray-200 dark:border-gray-700 transition bg-white dark:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-blue-500" />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">{r.type}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setPreviewUrl(`http://localhost:5000/${r.fileUrl}`)
                  }
                  className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  asChild
                  className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <a href={`http://localhost:5000/${r.fileUrl}`} download>
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(r._id)}
                  className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 relative">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-4 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:text-red-400 text-xl font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 dark:text-gray-200">
              Report Preview
            </h2>
            {previewUrl.toLowerCase().includes(".pdf") ? (
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] rounded-md border"
                title="PDF Preview"
              ></iframe>
            ) : (
              <img
                src={previewUrl}
                alt="Report Preview"
                className="w-full max-h-[70vh] object-contain rounded-md"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

