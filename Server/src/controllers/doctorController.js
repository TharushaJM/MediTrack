import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// GET /api/doctor/patients
export const getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Find all appointments for this doctor, and populate patient info
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "firstName lastName email age gender bloodType")
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
      return res.status(403).json({ message: "Access denied: no appointments with this patient" });
    }

    // Patient profile
    const patient = await User.findById(patientId).select(
      "firstName lastName email age gender bloodType height weight createdAt"
    );

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Appointment history ONLY between this doctor and this patient
    const appointments = await Appointment.find({ doctorId, patientId })
      .sort({ createdAt: -1 });

    res.json({
      patient,
      appointments,
    });
  } catch (err) {
    console.error("getMyPatientDetails error:", err);
    res.status(500).json({ message: "Failed to fetch patient details" });
  }
};
