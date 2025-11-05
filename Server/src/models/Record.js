import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🧍 Emotional + energy stats
    mood: { type: Number, min: 1, max: 10 },
    energy: { type: Number, min: 1, max: 10 },
    stress: { type: Number, min: 1, max: 10 },
    notes: { type: String },

    // 🌿 Lifestyle habits
    sleepHours: { type: Number },
    waterIntake: { type: Number },
    meals: { type: String, enum: ["Healthy", "Average", "Skipped"], default: "Average" },
    exercise: { type: Number }, // minutes per day

    // ⚖️ Physical metrics
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    bmi: { type: Number },

    // 🩺 Health & medication
    symptoms: { type: String },
    tookMeds: { type: Boolean, default: false },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-calculate BMI before save
recordSchema.pre("save", function (next) {
  if (this.height && this.weight) {
    const h = this.height / 100;
    this.bmi = Number((this.weight / (h * h)).toFixed(1));
  }
  next();
});

export default mongoose.model("Record", recordSchema);
