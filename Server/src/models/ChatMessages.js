import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },

    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    text: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
