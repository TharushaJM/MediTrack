import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import { registerChatSocket } from "./socket/chatSocket.js";

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import "./cron/reminderCron.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io with Security & Transports
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },

  transports: ["polling", "websocket"],
});
io.on("connection", (socket) => {
  console.log("✅ SOCKET connected", socket.id);
});

// 3. Socket Authentication Middleware
const cleanToken = (t) =>
  (t || "")
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .trim();

io.use(async (socket, next) => {
  try {
    const raw = socket.handshake.auth?.token || socket.handshake.query?.token;
    const token = cleanToken(raw);

    if (!token) return next(new Error("Authentication error: No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded.userId).select(
      "-password"
    );

    if (!user) return next(new Error("Authentication error: User not found"));

    socket.user = user; // Attach user object to the socket
    next();
  } catch (err) {
    console.error("Socket Middleware Error:", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
});

// 4. Call Chat Logic Function
registerChatSocket(io);

// Export io for other controllers
export { io };

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("MediTrack backend running");
});

const PORT = process.env.PORT || 5000;

// 5. Start Server using the 'server' object (not 'app')
server.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
