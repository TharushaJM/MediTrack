import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bpSystolic: Number,
    bpDiastolic: Number,
    glucose: Number,
    creatinine: Number,
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("Record", recordSchema);
