import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
//   requested socket import path
import { createSocket } from "../../../socket";

const API = "http://localhost:5000";

export default function DoctorChat({ patientId: propPatientId, onBack }) {
  const { patientId: paramPatientId } = useParams();

  // Determine Patient ID
  const patientId = propPatientId || paramPatientId;

  const myUserId = JSON.parse(localStorage.getItem("user") || "{}")?.id;

  const rawToken = localStorage.getItem("token") || "";
  const token = rawToken
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .trim();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  //   Add Socket Ref
  const socketRef = useRef(null);
  const endRef = useRef(null);

  const scrollBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/chat/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data.messages || []);
    } finally {
      setLoading(false);
      setTimeout(scrollBottom, 50);
    }
  };

  // --- SOCKET IO LOGIC ---
  useEffect(() => {
    if (!patientId || !myUserId) return;

    const s = createSocket();
    socketRef.current = s;

    const onConnect = () => console.log("✅ socket connected", s.id);
    const onError = (err) => console.log("❌ socket error", err.message);

    s.on("connect", onConnect);
    s.on("connect_error", onError);

    const join = () => s.emit("joinConversation", { otherUserId: patientId });
    if (s.connected) join();
    else s.once("connect", join);

    s.on("message:new", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        const cleaned = prev.filter((m) => !String(m._id).startsWith("temp_"));
        return [...cleaned, msg];
      });
      setTimeout(scrollBottom, 50);
    });

    return () => {
      s.off("message:new");
      s.off("connect", onConnect);
      s.off("connect_error", onError);
      s.off("connect", join);
    };
  }, [patientId, myUserId]);
  // -----------------------

  useEffect(() => {
    if (!patientId || !token) return;
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, token]);

  const send = async () => {
    if (!patientId || !token || !input.trim()) return;

    const text = input.trim();
    setInput(""); // Input

    // --- 1. OPTIMISTIC UPDATE
    const tempId = `temp_${Date.now()}`;
    const temp = {
      _id: tempId,
      sender: { _id: myUserId }, //
      text: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((p) => [...p, temp]);
    setTimeout(scrollBottom, 50);

    // --- 2. SOCKET EMIT
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", {
        otherUserId: patientId,
        text: text,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden h-[650px] flex flex-col">
        <div className="p-4 border-b dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Chat
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Doctor ↔ Patient conversation
          </p>
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
                m.sender?._id === "me";
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
