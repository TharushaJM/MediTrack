import mongoose from "mongoose";
import ChatMessage from "../models/ChatMessage.js";
import Appointment from "../models/Appointment.js";

const makeConversationId = (a, b) => {
  const [x, y] = [String(a), String(b)].sort();
  return `${x}_${y}`;
};

const hasRelationship = async (userA, userB) => {
  return await Appointment.exists({
    $or: [
      { doctorId: userA, patientId: userB },
      { doctorId: userB, patientId: userA },
    ],
  });
};

export function registerChatSocket(io) {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user?._id} | socket: ${socket.id}`);

    socket.on("joinConversation", async ({ otherUserId }) => {
      try {
        if (!socket.user) return;

        const myId = socket.user._id;

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) return;

        const ok = await hasRelationship(myId, otherUserId);
        if (!ok) return;

        const conversationId = makeConversationId(myId, otherUserId);
        socket.join(conversationId);

        console.log(`✅ User ${myId} joined room: ${conversationId}`);
      } catch (e) {
        console.error("joinConversation error:", e.message);
      }
    });

    socket.on("sendMessage", async ({ otherUserId, text }) => {
      try {
        if (!socket.user) return;

        const myId = socket.user._id;

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) return;
        if (!text || !text.trim()) return;

        const ok = await hasRelationship(myId, otherUserId);
        if (!ok) return;

        const conversationId = makeConversationId(myId, otherUserId);

        const msg = await ChatMessage.create({
          conversationId,
          sender: myId,
          receiver: otherUserId,
          text: text.trim(),
        });

        const populated = await ChatMessage.findById(msg._id)
          .populate("sender", "firstName lastName role profileImage")
          .populate("receiver", "firstName lastName role profileImage");

        io.to(conversationId).emit("message:new", populated);
      } catch (e) {
        console.error("sendMessage socket error:", e.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
