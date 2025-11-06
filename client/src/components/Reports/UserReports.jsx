import { useState, useEffect } from "react";
import axios from "axios";

export default function UserReports() {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

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

    await axios.post("http://localhost:5000/api/reports", formData, {
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
          <div key={r._id} className="bg-white shadow p-4 rounded">
            <h3 className="font-semibold text-lg">{r.title}</h3>
            <p className="text-gray-500 text-sm">{r.description || "No description"}</p>
            <a
              href={`http://localhost:5000/${r.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 text-sm mt-2 inline-block"
            >
              View Report
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
