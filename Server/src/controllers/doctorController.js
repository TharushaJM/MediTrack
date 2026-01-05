import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import Consent from "../models/Consent.js";
import mongoose from "mongoose";


// GET /api/doctor/patients
export const getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Find all appointments for this doctor, and populate patient info
    const appointments = await Appointment.find({ doctorId })
      .populate(
        "patientId",
        "firstName lastName email age gender bloodType profileImage"
      )
      .sort({ createdAt: -1 });

    // Unique patients based on patientId
    const map = new Map();

    for (const appt of appointments) {
      const p = appt.patientId;
      if (!p) continue;

      const pid = String(p._id);

      if (!map.has(pid)) {
        map.set(pid, {
          patient: p,
          lastAppointment: {
            date: appt.date,
            timeSlot: appt.timeSlot,
            status: appt.status,
            reason: appt.reason,
          },
          totalAppointments: 1,
          pendingCount: appt.status === "Pending" ? 1 : 0,
        });
      } else {
        const existing = map.get(pid);
        existing.totalAppointments += 1;
        if (appt.status === "Pending") existing.pendingCount += 1;
      }
    }

    res.json(Array.from(map.values()));
  } catch (err) {
    console.error("getMyPatients error:", err);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};

// GET /api/doctor/patients/:patientId
export const getMyPatientDetails = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;

    // SECURITY: doctor can only see this patient if an appointment exists
    const relationship = await Appointment.findOne({ doctorId, patientId });
    if (!relationship) {
      return res
        .status(403)
        .json({ message: "Access denied: no appointments with this patient" });
    }

    // Patient profile
    const patient = await User.findById(patientId).select(
      "firstName lastName email injuryCondition age gender bloodType height weight createdAt profileImage"
    );

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Appointment history ONLY between this doctor and this patient
    const appointments = await Appointment.find({ doctorId, patientId }).sort({
      createdAt: -1,
    });

    res.json({
      patient,
      appointments,
    });
  } catch (err) {
    console.error("getMyPatientDetails error:", err);
    res.status(500).json({ message: "Failed to fetch patient details" });
  }
};
// GET /api/doctor/patients/:patientId/reports
export const getMyPatientReports = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;

    // ✅ prevent CastError
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patientId" });
    }

    // ✅ must have appointment relationship
    const relationship = await Appointment.findOne({
      doctorId: doctorId,
      patientId: patientId,
    });

    if (!relationship) {
      return res
        .status(403)
        .json({ message: "Access denied: no appointments with this patient" });
    }

    // ✅ patient must share reports
    const consent = await Consent.findOne({
      patientId: patientId,
      doctorId: doctorId,
      shared: true,
    });

    if (!consent) {
      return res
        .status(403)
        .json({ message: "Patient has not shared reports with you" });
    }

    // ✅ load reports
    const reports = await Report.find({ user: patientId }).sort({
      createdAt: -1,
    });

    return res.json(reports);
  } catch (err) {
    console.log("🔥 getMyPatientReports FULL ERROR:", err);
    return res.status(500).json({
      message: err.message,
      name: err.name,
    });
  }
};
