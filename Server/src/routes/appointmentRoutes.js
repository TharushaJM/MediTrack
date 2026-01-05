import express from "express";
import { protect, approvedDoctorOnly } from "../middleware/authMiddleware.js";
import Appointment from "../models/Appointment.js";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
} from "../controllers/appointmentController.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/* ----------------------------
   PATIENT ROUTES
---------------------------- */

// ✅ Book appointment (Patient)
router.post("/book", protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !date || !timeSlot) {
      return res
        .status(400)
        .json({ error: "Doctor, date, and time slot are required" });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      return res
        .status(409)
        .json({ error: "This time slot is already booked" });
    }

    const newAppointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      reason: reason || "",
    });

    const savedAppt = await newAppointment.save();

    // ✅ Create doctor notification (INSIDE the route)
    await Notification.create({
      user: doctorId, // notify doctor
      title: "New appointment request",
      message: `A patient booked an appointment on ${date} at ${timeSlot}.`,
      read: false,
    });

    const populatedAppt = await Appointment.findById(savedAppt._id).populate(
      "doctorId",
      "firstName lastName specialization profileImage"
    );

    return res.status(201).json({
      message: "Appointment booked successfully!",
      data: populatedAppt,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ error: "Failed to book appointment" });
  }
});

// ✅ Patient: My appointments
router.get("/my-appointments", protect, async (req, res) => {
  try {
    const patientId = req.user._id;

    const appointments = await Appointment.find({ patientId })
      .populate(
        "doctorId",
        "firstName lastName specialization profileImage location"
      )
      .sort({ date: -1, timeSlot: 1 });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ error: "Error fetching appointments" });
  }
});

/* ----------------------------
   DOCTOR ROUTES
---------------------------- */

// ✅ Doctor: appointments list (optional filter by date query ?date=YYYY-MM-DD)
router.get(
  "/doctor-appointments",
  protect,
  approvedDoctorOnly,
  getDoctorAppointments
);

// ✅ Doctor: update appointment status
router.patch(
  "/:appointmentId/status",
  protect,
  approvedDoctorOnly,
  updateAppointmentStatus
);

// ✅ Doctor: reschedule appointment (date + timeSlot)
router.patch(
  "/:appointmentId/reschedule",
  protect,
  approvedDoctorOnly,
  rescheduleAppointment
);

/* ----------------------------
   SHARED ROUTES
---------------------------- */

// ✅ Available slots
router.get("/available-slots", protect, async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ error: "Doctor ID and date are required" });
    }

    const allSlots = [
      "9:00 AM",
      "9:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "2:00 PM",
      "2:30 PM",
      "3:00 PM",
      "3:30 PM",
      "4:00 PM",
      "4:30 PM",
    ];

    const bookedAppointments = await Appointment.find({
      doctorId,
      date,
      status: { $ne: "Cancelled" },
    });

    const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    return res.status(200).json({ availableSlots, bookedSlots });
  } catch (error) {
    console.error("Slots error:", error);
    return res.status(500).json({ error: "Error fetching available slots" });
  }
});

export default router;
