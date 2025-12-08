import { useEffect, useState } from "react";
import axios from "axios";
import { Brain, FileText, MessageSquare, Send, Loader2 } from "lucide-react";

export default function HealthAssistant() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [summary, setSummary] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  //  Fetch all uploaded reports for logged-in user
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  //  Handle report selection
  const handleSelectReport = (reportId) => {
    const report = reports.find((r) => r._id === reportId);
    setSelectedReport(report);
    generateSummary(report);
  };

  //  Generate AI summary (mock for now)
 const generateSummary = async (report) => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");

    const { data } = await axios.post(
      "http://localhost:5000/api/ai/summary",
      { reportId: report._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSummary(data.summary);
  } catch {
    setSummary("Unable to generate summary.");
  }
  setLoading(false);
};


  //  Mock AI response
  const sendRealAIMessage = async (question) => {
  try {
    const token = localStorage.getItem("token");

    const { data } = await axios.post(
      "http://localhost:5000/api/ai/chat",
      { reportId: selectedReport._id, question },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
  } catch {
    setMessages((prev) => [
      ...prev,
      { sender: "ai", text: "AI unavailable. Please try later." },
    ]);
  }
};

const handleSend = () => {
  if (!input.trim()) return;
  const userMsg = { sender: "user", text: input };
  setMessages((prev) => [...prev, userMsg]);

  sendRealAIMessage(input);
  setInput("");
};

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <Brain className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">AI Health Assistant</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a report to get an instant AI summary and chat insights
              </p>
            </div>
          </div>
        </div>

        {/* Report Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FileText className="text-blue-600 dark:text-blue-400" /> Choose Report
          </h2>
          <select
            onChange={(e) => handleSelectReport(e.target.value)}
            className="w-full border dark:border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
          >
            <option value="">-- Select a report --</option>
            {reports.map((r) => (
              <option key={r._id} value={r._id}>
                {r.type} - {new Date(r.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Summary */}
        {selectedReport && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">AI Summary</h2>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="animate-spin w-4 h-4" /> Generating summary...
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-200 dark:text-gray-200">{summary}</p>
            )}
            <a
              href={`http://localhost:5000/${selectedReport.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 underline text-sm mt-3 inline-block"
            >
              View Original Report
            </a>
          </div>
        )}

        {/* Chat Section */}
        {selectedReport && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-[500px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Chat with AI</h2>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-gray-400 text-sm text-center mt-20">
                  Ask about your selected report...
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-xl text-sm ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

