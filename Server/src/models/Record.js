import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Daily wellness check-in fields
    mood: Number,
    energy: Number,
    stress: Number,
    notes: String,

    sleepHours: Number,
    waterIntake: Number,
    meals: String,
    exercise: Number,

    symptoms: String,
    tookMeds: Boolean,

    // Physical body metrics
    height: Number, // cm
    weight: Number, // kg
    bmi: Number, // computed on backend
  },
  { timestamps: true }
);

// Optional: auto-calculate BMI before save
recordSchema.pre("save", function (next) {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    this.bmi = Number((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  next();
});

export default mongoose.model("Record", recordSchema);
