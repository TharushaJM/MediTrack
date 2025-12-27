import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import ChatMessage from "../models/ChatMessage.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";    //for fetch users 

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

//get users covwersation for chat bar
export const getConversations = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const role = req.user.role;

  // get partner ids from appointments
  let partnerIds = [];
  if (role === "patient") {
    partnerIds = await Appointment.distinct("doctorId", { patientId: myId });
  } else if (role === "doctor") {
    partnerIds = await Appointment.distinct("patientId", { doctorId: myId });
  } else {
    return res.json({ conversations: [] });
  }

  const partners = await User.find({ _id: { $in: partnerIds } })
    .select("firstName lastName role profileImage specialization title")
    .lean();

  const makeConversationId = (a, b) => {
    const [x, y] = [String(a), String(b)].sort();
    return `${x}_${y}`;
  };

  const conversations = await Promise.all(
    partners.map(async (p) => {
      const conversationId = makeConversationId(myId, p._id);

      const last = await ChatMessage.findOne({ conversationId })
        .sort({ createdAt: -1 })
        .lean();

      const unreadCount = await ChatMessage.countDocuments({
        conversationId,
        receiver: myId,
        read: false,
      });

      return {
        id: String(p._id),
        user: p,
        lastMessage: last
          ? { text: last.text, createdAt: last.createdAt }
          : null,
        unreadCount,
      };
    })
  );

  conversations.sort((a, b) => {
    const at = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bt = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bt - at;
  });

  res.json({ conversations });
});

