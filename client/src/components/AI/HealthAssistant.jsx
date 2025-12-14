import { useEffect, useState } from "react";
import axios from "axios";
import { Brain, FileText, MessageSquare, Send, Loader2, AlertCircle, CheckCircle2, Activity, HelpCircle, ListChecks } from "lucide-react";

export default function HealthAssistant() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [summary, setSummary] = useState("");
  const [parsedSummary, setParsedSummary] = useState({ about: "", numbers: [], actions: [], questions: [] });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Parse summary into patient-friendly sections
  const parseSummaryText = (text) => {
    if (!text) return { about: "", numbers: [], actions: [], questions: [] };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    const result = {
      about: "",
      numbers: [],
      actions: [],
      questions: []
    };

    let currentSection = "";
    
    lines.forEach(line => {
      // Detect section headers
      if (line.toLowerCase().includes('what this is about') || 
          line.toLowerCase().includes('reason for visit')) {
        currentSection = "about";
      } else if (line.toLowerCase().includes('numbers that matter') || 
                 line.toLowerCase().includes('key values') ||
                 line.toLowerCase().includes('test results')) {
        currentSection = "numbers";
      } else if (line.toLowerCase().includes('what you should do') || 
                 line.toLowerCase().includes('action') ||
                 line.toLowerCase().includes('recommendations')) {
        currentSection = "actions";
      } else if (line.toLowerCase().includes('questions to ask') || 
                 line.toLowerCase().includes('ask your doctor')) {
        currentSection = "questions";
      } else if (line.startsWith('*') || line.startsWith('-') || line.startsWith('•')) {
        // Extract bullet points
        const cleaned = line.replace(/^[\*\-•]+/, '').trim().replace(/\*\*/g, '');
        if (cleaned.length > 5) {
          if (currentSection === "numbers") result.numbers.push(cleaned);
          else if (currentSection === "actions") result.actions.push(cleaned);
          else if (currentSection === "questions") result.questions.push(cleaned);
        }
      } else if (!line.includes('**') && currentSection === "about" && line.length > 10) {
        // First descriptive line becomes "about"
        if (!result.about) result.about = line.replace(/\*\*/g, '');
      }
    });

    // Fallback: if no structured data, extract manually
    if (!result.about && !result.numbers.length && !result.actions.length) {
      const paragraphs = text.split('\n\n');
      result.about = paragraphs[0]?.substring(0, 200) || "Medical report analysis";
      
      // Extract bullet points as actions
      lines.forEach(line => {
        if ((line.startsWith('*') || line.startsWith('-')) && line.length > 10) {
          const cleaned = line.replace(/^[\*\-]+/, '').trim().replace(/\*\*/g, '');
          if (cleaned.match(/\d+/)) result.numbers.push(cleaned);
          else result.actions.push(cleaned);
        }
      });
    }

    return result;
  };

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
    setParsedSummary(parseSummaryText(data.summary));
  } catch {
    setSummary("Unable to generate summary.");
    setParsedSummary({ about: "Unable to generate summary.", numbers: [], actions: [], questions: [] });
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
              <h2 className="font-bold text-xl text-white flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Your Report Summary
              </h2>
              <p className="text-blue-100 text-sm mt-1">AI-powered insights in simple language</p>
            </div>

            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                <p className="text-gray-500 dark:text-gray-400">Reading your report...</p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                
                {/* What This Is About */}
                {parsedSummary.about && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-750 rounded-xl p-5 border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          What This Is About
                        </h3>
                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                          {parsedSummary.about}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Numbers That Matter */}
                {parsedSummary.numbers.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-750 rounded-xl p-5 border-l-4 border-purple-500">
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Your Numbers
                        </h3>
                        <div className="space-y-2">
                          {parsedSummary.numbers.map((num, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                              <span className="text-lg">📊</span>
                              <span className="text-gray-800 dark:text-gray-100 flex-1 text-sm leading-relaxed">
                                {num}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* What You Should Do */}
                {parsedSummary.actions.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-750 rounded-xl p-5 border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                      <ListChecks className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          What You Should Do
                        </h3>
                        <div className="space-y-2">
                          {parsedSummary.actions.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-800 dark:text-gray-100 flex-1 text-sm leading-relaxed">
                                {action}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions to Ask */}
                {parsedSummary.questions.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-750 rounded-xl p-5 border-l-4 border-amber-500">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Questions for Your Doctor
                        </h3>
                        <div className="space-y-2">
                          {parsedSummary.questions.map((q, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                              <span className="text-lg">💬</span>
                              <span className="text-gray-800 dark:text-gray-100 flex-1 text-sm leading-relaxed">
                                {q}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback: Show raw summary if no structured data */}
                {!parsedSummary.about && !parsedSummary.numbers.length && !parsedSummary.actions.length && summary && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                      {summary}
                    </p>
                  </div>
                )}

                {/* View Original Link */}
                <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                  <a
                    href={`http://localhost:5000/${selectedReport.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Full Report
                  </a>
                  <span className="text-xs text-gray-400">
                    AI-generated • Not a replacement for medical advice
                  </span>
                </div>
              </div>
            )}
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

