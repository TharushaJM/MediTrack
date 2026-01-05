import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
import { createSocket } from "../../../socket";
import { useTheme } from "../../../context/ThemeContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ---------------- helpers ---------------- */

const cleanToken = (t = "") =>
  String(t).replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();

const buildImgUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API}${path.startsWith("/") ? path : `/${path}`}`;
};

const avatarFallback = (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0D8ABC&color=fff&size=128`;

const dayKey = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const dayLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const timeLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const buildChatItems = (messages = []) => {
  const out = [];
  let lastDay = null;

  for (const m of messages) {
    const k = dayKey(m.createdAt);
    if (k && k !== lastDay) {
      out.push({ type: "day", key: `day_${k}`, label: dayLabel(m.createdAt) });
      lastDay = k;
    }
    out.push({ type: "msg", key: m._id, msg: m });
  }
  return out;
};

/* ---------------- component ---------------- */

export default function PatientChat({
  doctorId: propDoctorId,
  onBack,
  doctor,
  onNewMessage,
}) {
  const { darkMode } = useTheme();
  const { doctorId: paramDoctorId } = useParams();
  const doctorId = (propDoctorId || paramDoctorId || "").toString();

  const token = useMemo(() => cleanToken(localStorage.getItem("token") || ""), []);

  const me = JSON.parse(localStorage.getItem("user") || "{}");
  const myUserId = (me?.id || me?._id || "").toString();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const endRef = useRef(null);

  const scrollBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadHistory = async () => {
    if (!doctorId || !token) return;
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

  // ✅ Load history when doctor changes
  useEffect(() => {
    if (!doctorId) return;
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  // ✅ Socket connect + join room when doctor changes
  useEffect(() => {
    if (!doctorId || !myUserId) return;

    const s = createSocket();
    socketRef.current = s;

    const join = () => s.emit("joinConversation", { otherUserId: doctorId });

    const onMsg = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        const cleaned = prev.filter((m) => !String(m._id).startsWith("temp_"));
        return [...cleaned, msg];
      });

      onNewMessage?.(msg);
      setTimeout(scrollBottom, 50);
    };

    s.on("message:new", onMsg);

    if (s.connected) join();
    else s.once("connect", join);

    return () => {
      s.off("message:new", onMsg);
      s.disconnect();
    };
  }, [doctorId, myUserId, onNewMessage]);

  const send = () => {
    if (!doctorId || !input.trim()) return;

    const text = input.trim();
    setInput("");

    // optimistic
    const tempId = `temp_${Date.now()}`;
    setMessages((p) => [
      ...p,
      {
        _id: tempId,
        sender: { _id: myUserId },
        text,
        createdAt: new Date().toISOString(),
      },
    ]);

    setTimeout(scrollBottom, 50);

    socketRef.current?.emit("sendMessage", { otherUserId: doctorId, text });
  };

  const doctorName = doctor
    ? `Dr. ${doctor.firstName || ""} ${doctor.lastName || ""}`.trim()
    : "Doctor";

  const avatarSrc = doctor?.profileImage
    ? buildImgUrl(doctor.profileImage)
    : avatarFallback(doctorName);

  // ✅ dynamic theme classes
  const shell = darkMode
    ? "border border-white/10 bg-[#070b12] shadow-xl"
    : "border border-gray-200 bg-white shadow-sm";

  const headerBg = darkMode ? "bg-[#0b1220] border-white/10" : "bg-white border-gray-200";

  const messagesBg = darkMode
    ? "bg-gray-900"
    : "bg-white";

  const inputBg = darkMode ? "bg-[#070b12] border-white/10" : "bg-white border-gray-200";

  return (
    <div className={`rounded-2xl overflow-hidden h-[650px] flex flex-col ${shell}`}>
      {/* HEADER */}
      <div className={`p-4 border-b flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className={`font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
              {doctorName || "Chat"}
            </div>
            <div className={`text-xs ${darkMode ? "text-white/60" : "text-gray-500"}`}>
              Doctor
            </div>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className={`text-sm px-3 py-1.5 rounded-lg border hover:bg-black/5 ${
              darkMode
                ? "border-white/15 text-white/80 hover:bg-white/5"
                : "border-gray-200 text-gray-700"
            }`}
          >
            Back
          </button>
        )}
      </div>

      {/* MESSAGES */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${messagesBg}`}>
        {loading ? (
          <p className={`text-sm ${darkMode ? "text-white/70" : "text-gray-500"}`}>
            Loading chat...
          </p>
        ) : messages.length === 0 ? (
          <p className={`text-sm ${darkMode ? "text-white/70" : "text-gray-500"}`}>
            No messages yet.
          </p>
        ) : (
          buildChatItems(messages).map((item) => {
            if (item.type === "day") {
              return (
                <div key={item.key} className="flex justify-center py-2">
                  <div
                    className={`px-4 py-1 rounded-full text-xs border ${
                      darkMode
                        ? "bg-white/5 border-white/15 text-white/70"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    {item.label}
                  </div>
                </div>
              );
            }

            const m = item.msg;
            const isMe =
              String(m.sender?._id) === String(myUserId) ||
              String(m._id).startsWith("temp_");

            return (
              <div
                key={item.key}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[280px] sm:max-w-[360px] px-4 py-3 rounded-2xl border shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white border-blue-500/30 rounded-br-md"
                      : darkMode
                      ? "bg-white/5 text-white border-white/20 rounded-bl-md"
                      : "bg-white text-gray-900 border-gray-200 rounded-bl-md"
                  }`}
                >
                  <div className="text-sm leading-relaxed">{m.text}</div>
                  <div
                    className={`mt-2 text-[11px] ${
                      isMe
                        ? "text-white/80"
                        : darkMode
                        ? "text-white/60"
                        : "text-gray-500"
                    }`}
                  >
                    {timeLabel(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className={`p-4 border-t flex gap-2 ${inputBg}`}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className={`flex-1 rounded-xl px-4 py-3 outline-none border focus:ring-2 focus:ring-blue-500 ${
            darkMode
              ? "bg-white/5 border-white/15 text-white placeholder:text-white/40"
              : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
          }`}
        />

        <button
          onClick={send}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
