import mongoose from "mongoose";

const consentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shared: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ one consent per patient-doctor pair
consentSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

const Consent = mongoose.model("Consent", consentSchema);
export default Consent;
