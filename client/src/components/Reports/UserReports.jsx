import { useState, useEffect } from "react";
import axios from "axios";

export default function UserReports() {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  async function fetchReports() {
    const token = localStorage.getItem("token");
    const { data } = await axios.get("http://localhost:5000/api/reports", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReports(data);
  }

  async function handleUpload(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    await axios.post("http://localhost:5000/api/reports/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    fetchReports();
    setFile(null);
    setTitle("");
  }

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">My Medical Reports</h1>

      {/* Upload Section */}
      <form onSubmit={handleUpload} className="bg-white shadow p-6 rounded-lg mb-8">
        <input
          type="text"
          placeholder="Report Title"
          className="border p-2 rounded w-full mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="file"
          className="mb-4"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Upload
        </button>
      </form>

      {/* Reports List */}
      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r._id} className="bg-white shadow p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{r.title}</h3>
            <p className="text-gray-500 text-sm mb-3">
              Uploaded on {new Date(r.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewUrl(`http://localhost:5000/${r.fileUrl}`)}

                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-md hover:opacity-90 transition"
              >
                Preview
              </button>
              <a
                 href={`http://localhost:5000/${r.fileUrl}`}
                download
                className="border border-blue-600 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-11/12 md:w-2/3 lg:w-1/2 relative shadow-xl">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-xl font-bold"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold mb-4">Report Preview</h2>

            {previewUrl.endsWith(".pdf") ? (
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
