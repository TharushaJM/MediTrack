import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Blood Test",
        "X-Ray",
        "MRI",
        "Prescription",
        "ECG",
        "Ultrasound",
        "Other",
      ],
    },
    title: {
      type: String,
      default: "", // optional, no longer required
    },
    fileUrl: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
