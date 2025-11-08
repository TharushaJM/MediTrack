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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";

export default function UserReports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch reports
  async function fetchReports() {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.get("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(data);
      setFilteredReports(data);
    } catch {
      toast.error("Failed to load reports");
    }
  }

  // Filter reports by category
  useEffect(() => {
    if (filterType === "All") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.type === filterType));
    }
  }, [filterType, reports]);

  // Upload report
  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    if (!reportType) return toast.error("Please select a report type");

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
      fetchReports();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // Delete report
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

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-6 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Medical Reports</h1>
        <p className="text-gray-500">Upload and manage your medical documents</p>
      </div>

      {/* Upload Section */}
      <Card className="border-2 border-dashed border-blue-300 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Upload className="w-5 h-5" /> Upload New Report
          </CardTitle>
          <CardDescription>
            Upload PDF or image files of your medical reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleUpload}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="sm:w-[200px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blood Test">🩸 Blood Test</SelectItem>
                  <SelectItem value="X-Ray">🦴 X-Ray</SelectItem>
                  <SelectItem value="MRI">🧠 MRI</SelectItem>
                  <SelectItem value="ECG">❤️ ECG</SelectItem>
                  <SelectItem value="Prescription">💊 Prescription</SelectItem>
                  <SelectItem value="Other">📄 Other</SelectItem>
                </SelectContent>
              </Select>

              <input
                type="file"
                id="file-input"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <Button
                type="button"
                onClick={() => document.getElementById("file-input").click()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Choose File
              </Button>

              <Button
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>

            {uploading && (
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </form>

          <div className="flex items-center gap-6 text-sm text-gray-500 pt-2">
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
          <h2 className="font-semibold text-lg">All Reports ({filteredReports.length})</h2>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 text-gray-600">
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

        <div className="space-y-3">
          {filteredReports.length === 0 && (
            <p className="text-gray-500 text-sm">No reports found for this category.</p>
          )}

          {filteredReports.map((r) => (
            <Card
              key={r._id}
              className="p-4 flex items-center justify-between hover:shadow-sm border border-gray-200 transition bg-white"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-blue-500" />
                <div>
                  <h3 className="font-medium text-gray-800">{r.type}</h3>
                  <p className="text-sm text-gray-500">
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
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" asChild>
                  <a href={`http://localhost:5000/${r.fileUrl}`} download>
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(r._id)}
                  className="text-red-500 hover:bg-red-50"
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
          <div className="bg-white rounded-xl p-6 shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 relative">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
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
