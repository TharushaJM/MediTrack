import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
import { createSocket } from "../../../socket";

const API = "http://localhost:5000";

const cleanToken = (t = "") =>
  String(t).replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();

const buildImgUrl = (imgPath) => {
  if (!imgPath) return "";
  if (imgPath.startsWith("http") || imgPath.startsWith("blob:")) return imgPath;
  return `${API}${imgPath.startsWith("/") ? imgPath : `/${imgPath}`}`;
};

const avatarFallback = (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0D8ABC&color=fff&size=128`;

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDayLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

export default function DoctorChat({
  patientId: propPatientId,
  onBack,
  patient,
  onNewMessage,
}) {
  const { patientId: paramPatientId } = useParams();
  const patientId = (propPatientId || paramPatientId || "").toString();

  // IMPORTANT: some of your data uses id, some uses _id, so support both
  const myUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const myUserId = myUser?._id || myUser?.id;

  const token = cleanToken(localStorage.getItem("token") || "");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const endRef = useRef(null);

  const scrollBottom = (smooth = true) =>
    endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });

  const loadHistory = async () => {
    if (!patientId || !token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/chat/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data?.messages || []);
    } catch (err) {
      console.log("loadHistory error", err?.response?.data || err.message);
      setMessages([]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollBottom(false), 50);
    }
  };

  // ✅ Load history whenever patientId changes
  useEffect(() => {
    if (!patientId) return;
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  // ✅ Socket connection & join room whenever patientId changes
  useEffect(() => {
    if (!patientId || !myUserId) return;

    const s = createSocket();
    socketRef.current = s;

    const join = () => s.emit("joinConversation", { otherUserId: patientId });

    const onMsg = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;

        // remove optimistic temp if real msg comes
        const cleaned = prev.filter((m) => !String(m._id).startsWith("temp_"));
        return [...cleaned, msg];
      });

      onNewMessage?.(msg);
      setTimeout(() => scrollBottom(true), 50);
    };

    s.on("message:new", onMsg);

    if (s.connected) join();
    else s.once("connect", join);

    return () => {
      s.off("message:new", onMsg);
      
    };
  }, [patientId, myUserId, onNewMessage]);

  const send = () => {
    if (!patientId || !input.trim()) return;

    const text = input.trim();
    setInput("");

    // optimistic message
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

    setTimeout(() => scrollBottom(true), 50);

    socketRef.current?.emit("sendMessage", {
      otherUserId: patientId,
      text,
    });
  };

  const patientName =
    patient?.firstName || patient?.lastName
      ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
      : "Patient";

  const avatarSrc = patient?.profileImage
    ? buildImgUrl(patient.profileImage)
    : avatarFallback(patientName);

  // ✅ Group messages with day separators
  const grouped = useMemo(() => {
    const out = [];
    let lastDay = "";

    for (const m of messages) {
      const day = formatDayLabel(m.createdAt);
      if (day && day !== lastDay) {
        lastDay = day;
        out.push({ type: "day", label: day, key: `day-${day}-${m._id || m.createdAt}` });
      }
      out.push({ type: "msg", msg: m, key: m._id || `${m.createdAt}-${Math.random()}` });
    }
    return out;
  }, [messages]);

  return (
    <div className="rounded-2xl overflow-hidden h-[650px] flex flex-col border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            onError={(e) => {
              e.currentTarget.src = avatarFallback(patientName);
            }}
          />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {patientName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Patient
            </div>
          </div>
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

      {/* MESSAGES AREA (WhatsApp-like canvas) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#f4f5f7] dark:bg-[#0b1220]">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading chat...
          </p>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No messages yet.
          </p>
        ) : (
          <div className="space-y-3">
            {grouped.map((item) => {
              if (item.type === "day") {
                return (
                  <div key={item.key} className="flex justify-center">
                    <div className="px-3 py-1 rounded-full text-xs bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                      {item.label}
                    </div>
                  </div>
                );
              }

              const m = item.msg;
              const senderId = m?.sender?._id || m?.senderId;
              const isMe =
                String(senderId) === String(myUserId) ||
                String(m._id).startsWith("temp_");

              // bubbles like first image:
              // - mine: white bubble in light mode, blue in dark mode if you want, but we keep modern.
              // - theirs: soft gray/purple
              const bubbleBase =
                "max-w-[72%] rounded-2xl px-4 py-2.5 shadow-sm border text-sm break-words whitespace-pre-wrap";

              const mineBubble =
                "bg-white text-gray-900 border-gray-200";
              const mineBubbleDark =
                "bg-blue-600 text-white border-white/10";

              const otherBubble =
                "bg-[#eef2ff] text-gray-900 border-gray-200";
              const otherBubbleDark =
                "bg-gray-800 text-gray-100 border-white/5";

              return (
                <div
                  key={item.key}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={[
                      bubbleBase,
                      isMe
                        ? "dark:" + mineBubbleDark.replaceAll(" ", " dark:")
                        : "dark:" + otherBubbleDark.replaceAll(" ", " dark:"),
                      !isMe ? otherBubble : mineBubble,
                    ].join(" ")}
                  >
                    <div>{m.text}</div>

                    {/* time */}
                    <div
                      className={`mt-1 text-[11px] text-right ${
                        isMe
                          ? "text-gray-500 dark:text-white/80"
                          : "text-gray-600 dark:text-gray-300/80"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* INPUT BAR */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl outline-none text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={send}
            disabled={!input.trim()}
            className={`h-11 w-11 rounded-xl flex items-center justify-center text-white transition ${
              input.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-400/60 cursor-not-allowed"
            }`}
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
