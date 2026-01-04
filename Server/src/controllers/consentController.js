import Appointment from "../models/Appointment.js";
import Consent from "../models/Consent.js";

// GET /api/consents/my-doctors
// returns: [{ doctor: {...}, shared: true/false }]
export const getMyDoctorsConsents = async (req, res) => {
  try {
    const patientId = req.user._id;

    // 1) find doctors from patient's appointments
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "firstName lastName email specialization profileImage")
      .sort({ createdAt: -1 });

    // 2) unique doctors
    const doctorMap = new Map();
    appointments.forEach((a) => {
      if (a.doctorId?._id) doctorMap.set(String(a.doctorId._id), a.doctorId);
    });

    const doctorIds = Array.from(doctorMap.keys());

    if (doctorIds.length === 0) return res.json([]);

    // 3) fetch existing consents for these doctors
    const consents = await Consent.find({
      patientId,
      doctorId: { $in: doctorIds },
    });

    const consentMap = new Map();
    consents.forEach((c) => consentMap.set(String(c.doctorId), !!c.shared));

    // 4) build response for ALL doctors (default shared=false)
    const result = doctorIds.map((did) => ({
      doctor: doctorMap.get(did),
      shared: consentMap.get(did) || false,
    }));

    res.json(result);
  } catch (err) {
    console.error("getMyDoctorsConsents error:", err);
    res.status(500).json({ message: "Failed to fetch doctor consents" });
  }
};

// POST /api/consents/set
// body: { doctorId, shared }
export const setDoctorConsent = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { doctorId, shared } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: "doctorId is required" });
    }

    // ✅ Security: allow consent only for doctors that patient has appointments with
    const relationship = await Appointment.findOne({ patientId, doctorId });
    if (!relationship) {
      return res
        .status(403)
        .json({ message: "Access denied: no appointments with this doctor" });
    }

    const updated = await Consent.findOneAndUpdate(
      { patientId, doctorId },
      { shared: !!shared },
      { new: true, upsert: true }
    );

    res.json({
      message: "Consent updated",
      shared: updated.shared,
    });
  } catch (err) {
    console.error("setDoctorConsent error:", err);

    // handle duplicate index rare case safely
    if (err.code === 11000) {
      return res.status(409).json({ message: "Consent already exists" });
    }

    res.status(500).json({ message: "Failed to update consent" });
  }
};
