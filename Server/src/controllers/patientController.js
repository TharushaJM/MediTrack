import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// GET /api/patient/doctors
export const getMyDoctors = async (req, res) => {
  try {
    const patientId = req.user._id;

    // Find all appointments for this patient, populate doctor info
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "firstName lastName email specialization profileImage")
      .sort({ createdAt: -1 });

    // Unique doctors based on doctorId
    const map = new Map();

    for (const appt of appointments) {
      const d = appt.doctorId;
      if (!d) continue;

      const did = String(d._id);

      if (!map.has(did)) {
        map.set(did, {
          doctor: d,
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
        const existing = map.get(did);
        existing.totalAppointments += 1;
        if (appt.status === "Pending") existing.pendingCount += 1;
      }
    }

    res.json(Array.from(map.values()));
  } catch (err) {
    console.error("getMyDoctors error:", err);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

// GET /api/patient/doctors/:doctorId  (optional - details page)
export const getMyDoctorDetails = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { doctorId } = req.params;

    // SECURITY: patient can only see this doctor if an appointment exists
    const relationship = await Appointment.findOne({ doctorId, patientId });
    if (!relationship) {
      return res.status(403).json({
        message: "Access denied: no appointments with this doctor",
      });
    }

    const doctor = await User.findById(doctorId).select(
      "firstName lastName email specialization createdAt profileImage"
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointments = await Appointment.find({ doctorId, patientId })
      .sort({ createdAt: -1 });

    res.json({ doctor, appointments });
  } catch (err) {
    console.error("getMyDoctorDetails error:", err);
    res.status(500).json({ message: "Failed to fetch doctor details" });
  }
};
