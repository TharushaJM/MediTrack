import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function UserReports() {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function fetchReports() {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.get("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(data);
    } catch (err) {
      toast.error("Failed to load reports");
    }
  }

  async function handleUpload(e) {
  e.preventDefault();
  if (!file) return toast.error("Please select a file to upload");

  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  try {
    setUploading(true);
    setProgress(0);

    const { data } = await axios.post(
      "http://localhost:5000/api/reports/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / p.total);
          setProgress(percent);
        },
      }
    );

    if (data.success) {
      toast.success(data.message || "Report uploaded successfully!");
      setFile(null);
      setTitle("");
      fetchReports();
    } else {
      toast.error(data.message || "Upload failed");
    }
  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Upload failed. Please try again.");
  } finally {
    setUploading(false);
  }
}

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 flex justify-center">
      <div className="w-full max-w-5xl px-6">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 border-b pb-3">
          My Medical Reports
        </h1>

        {/* Upload Section */}
        <form
          onSubmit={handleUpload}
          className="bg-white shadow-lg rounded-xl p-6 mb-10 border border-gray-200 hover:shadow-xl transition"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Upload New Report
          </h2>

          <input
            type="text"
            placeholder="Enter report title..."
            className="border border-gray-300 p-3 rounded-md w-full mb-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex items-center gap-4">
            <input
              type="file"
              className="file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700 transition"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-md hover:opacity-90 transition"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </form>

        {/* Reports List */}
        <div className="grid md:grid-cols-2 gap-6">
          {reports.map((r) => (
            <div
              key={r._id}
              className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg border border-gray-100 transition"
            >
              <h3 className="font-semibold text-lg text-gray-800">
                {r.title || "Untitled Report"}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Uploaded on {new Date(r.createdAt).toLocaleDateString()}
              </p>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={() =>
                    setPreviewUrl(`http://localhost:5000/${r.fileUrl}`)
                  }
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
                >
                  Preview
                </button>

                <a
                  href={`http://localhost:5000/${r.fileUrl}`}
                  download
                  className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-md hover:bg-blue-50 transition"
                >
                  Download
                </a>

                <button
                  onClick={() => handleDelete(r._id)}
                  className="border border-red-500 text-red-500 px-4 py-1.5 rounded-md hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Modal */}
        {previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 md:w-3/4 lg:w-1/2 relative">
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
              >
                ✕
              </button>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
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
    </div>
  );
}
