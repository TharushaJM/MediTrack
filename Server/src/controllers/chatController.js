import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import ChatMessage from "../models/ChatMessage.js";
import Appointment from "../models/Appointment.js";

// make same conversationId no matter who sends first
const makeConversationId = (a, b) => {
  const [x, y] = [String(a), String(b)].sort();
  return `${x}_${y}`;
};

//  verify doctor<->patient relationship using appointments
const hasRelationship = async (userA, userB) => {
  // userA might be doctor or patient - so check both ways
  return await Appointment.exists({
    $or: [
      { doctorId: userA, patientId: userB },
      { doctorId: userB, patientId: userA },
    ],
  });
};

// GET /api/chat/:otherUserId  (history)
export const getChatHistory = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.otherUserId;
  console.log("📩 Chat otherUserId:", req.params.otherUserId);


  if (!mongoose.Types.ObjectId.isValid(otherId)) {
    res.status(400);
    throw new Error("Invalid user id");
  }

  const ok = await hasRelationship(myId, otherId);
  if (!ok) {
    res.status(403);
    throw new Error("You cannot chat with this user");
  }

  const conversationId = makeConversationId(myId, otherId);

  const messages = await ChatMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .populate("sender", "firstName lastName role profileImage")
    .populate("receiver", "firstName lastName role profileImage");

  res.json({ conversationId, messages });
});

// POST /api/chat/:otherUserId  (send)
export const sendMessage = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.otherUserId;
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Message text is required");
  }

  const ok = await hasRelationship(myId, otherId);
  if (!ok) {
    res.status(403);
    throw new Error("You cannot message this user");
  }

  const conversationId = makeConversationId(myId, otherId);

  const msg = await ChatMessage.create({
    conversationId,
    sender: myId,
    receiver: otherId,
    text: text.trim(),
  });

  const populated = await ChatMessage.findById(msg._id)
    .populate("sender", "firstName lastName role profileImage")
    .populate("receiver", "firstName lastName role profileImage");

  res.status(201).json(populated);
});
