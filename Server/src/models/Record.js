import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Basic
    title: { type: String, required: true },
    description: String,
    date: { type: Date, default: Date.now },
    reportType: { type: String, enum: ["Checkup","Blood Test","Urine Test","X-Ray","ECG","Prescription","Other"], default: "Checkup" },
    doctorName: String,
    tags: [String],

    // Vitals / Lifestyle (all optional)
    bpSystolic: Number,
    bpDiastolic: Number,
    heartRate: Number,
    temperature: Number,         // °C or °F (free text in UI)
    spo2: Number,                 // oxygen %
    weight: Number,               // kg
    height: Number,               // cm
    bmi: Number,                  // we can compute in UI later
    sleepHours: Number,           // per day
    waterIntakeLiters: Number,    // per day
    exercisePerWeek: Number,      // sessions per week
    mood: Number,                 // 1..10
    symptoms: String,             // free text
  },
  { timestamps: true }
);

export default mongoose.model("Record", recordSchema);
