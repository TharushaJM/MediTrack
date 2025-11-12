import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: { type: String },
  time: { type: String, required: true },
  frequency: { type: String, default: "Once Daily" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Reminder", reminderSchema);
