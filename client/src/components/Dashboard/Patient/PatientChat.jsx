import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { createSocket } from "../../../socket";

const API = "http://localhost:5000";

export default function PatientChat({ doctorId: propDoctorId, onBack }) {
  const navigate = useNavigate();
  const { doctorId: paramDoctorId } = useParams();

  const doctorId = (propDoctorId || paramDoctorId || "").toString();
  const rawToken = localStorage.getItem("token") || "";
  const token = rawToken
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .trim();
  const myUserId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const endRef = useRef(null);
  const scrollBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/chat/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Chat load error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setTimeout(scrollBottom, 50);
    }
  };

  useEffect(() => {
    if (!doctorId || !myUserId) return;

    const s = createSocket();
    socketRef.current = s;

    // ✅ logs (so you can see connect / errors)
    const onConnect = () => console.log("✅ socket connected", s.id);
    const onError = (err) => console.log("❌ socket error", err.message);

    s.on("connect", onConnect);
    s.on("connect_error", onError);

    // ✅ join room only after connected
    const join = () => s.emit("joinConversation", { otherUserId: doctorId });
    if (s.connected) join();
    else s.once("connect", join);

    // ✅ receive new messages live
    const onNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        const cleaned = prev.filter((m) => !String(m._id).startsWith("temp_"));
        return [...cleaned, msg];
      });
      setTimeout(scrollBottom, 50);
    };

    s.on("message:new", onNewMessage);

    // ✅ cleanup (remove listeners only, DON'T disconnect)
    return () => {
      s.off("message:new", onNewMessage);
      s.off("connect", onConnect);
      s.off("connect_error", onError);
      s.off("connect", join);
    };
  }, [doctorId, myUserId]);

  useEffect(() => {
    if (!doctorId || !token) return;
    loadHistory();
  }, [doctorId, token]);

  const send = async () => {
    if (!doctorId || !token || !input.trim()) return;

    const text = input.trim();
    setInput("");

    const tempId = `temp_${Date.now()}`;
    const temp = {
      _id: tempId,
      sender: { _id: myUserId },
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((p) => [...p, temp]);
    setTimeout(scrollBottom, 50);

    if (socketRef.current) {
      socketRef.current.emit("sendMessage", {
        otherUserId: doctorId,
        text,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden h-[650px] flex flex-col">
        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Chat
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Patient ↔ Doctor conversation
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Back
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading chat...
            </p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No messages yet.
            </p>
          ) : (
            messages.map((m) => {
              const isMe =
                String(m.sender?._id) === String(myUserId) ||
                String(m._id).startsWith("temp_");
              return (
                <div
                  key={m._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 border-t dark:border-gray-800 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 border dark:border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900"
          />
          <button
            onClick={send}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
