import Appointment from "../models/Appointment.js";

/**
 * 1) Book Appointment (Patient)
 */
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;
    const patientId = req.user._id; // support both

    if (!doctorId || !date || !timeSlot) {
      return res
        .status(400)
        .json({ error: "Doctor, date, and time slot are required" });
    }

    // Check for duplicate booking (same doctor, date, time) except cancelled
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      return res.status(409).json({ error: "This time slot is already booked" });
    }

    const newAppointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
    });

    const savedAppt = await newAppointment.save();

    res.status(201).json({ message: "Booking Successful!", data: savedAppt });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Booking Failed" });
  }
};

/**
 * 2) Get Doctor Appointments (Doctor)
 * Supports optional date filter: /api/appointments/doctor-appointments?date=YYYY-MM-DD
 */
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { date } = req.query;

    const filter = { doctorId };
    if (date) filter.date = date;

    const appointments = await Appointment.find(filter)
      // IMPORTANT: your User model uses firstName/lastName, not "name"
      .populate("patientId", "firstName lastName email phone profileImage")
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Error fetching appointments" });
  }
};

/**
 * 3) Get Patient Appointments (Patient)
 */
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;

    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "firstName lastName specialization profileImage")
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Error fetching appointments" });
  }
};

/**
 * 4) Update Appointment Status (Doctor)
 * PATCH /api/appointments/:appointmentId/status  body: { status }
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate("patientId", "firstName lastName email phone profileImage");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json({ message: "Status updated", data: appointment });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Error updating appointment" });
  }
};

/**
 * 5) Cancel Appointment (Patient/Doctor)
 * PATCH /api/appointments/:appointmentId/cancel
 */
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "Cancelled" },
      { new: true }
    ).populate("patientId", "firstName lastName email phone profileImage");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res
      .status(200)
      .json({ message: "Appointment cancelled", data: appointment });
  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({ error: "Error cancelling appointment" });
  }
};

/**
 * 6) Get Available Time Slots for a Doctor on a Date
 * GET /api/appointments/available-slots?doctorId=...&date=YYYY-MM-DD
 */
export const getAvailableSlots = async (req, res) => {
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
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({ availableSlots, bookedSlots });
  } catch (error) {
    console.error("Slots error:", error);
    res.status(500).json({ error: "Error fetching available slots" });
  }
};

/**
 * 7) Reschedule Appointment (Doctor)
 * PATCH /api/appointments/:appointmentId/reschedule  body: { date, timeSlot }
 */
export const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, timeSlot } = req.body;

    if (!date || !timeSlot) {
      return res.status(400).json({ error: "date and timeSlot are required" });
    }

    // prevent double booking when rescheduling
    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    const conflict = await Appointment.findOne({
      _id: { $ne: appointmentId },
      doctorId: appt.doctorId,
      date,
      timeSlot,
      status: { $ne: "Cancelled" },
    });

    if (conflict) {
      return res.status(409).json({ error: "That new time slot is already booked" });
    }

    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { date, timeSlot },
      { new: true }
    ).populate("patientId", "firstName lastName email phone profileImage");

    res.status(200).json({ message: "Appointment rescheduled", data: updated });
  } catch (error) {
    console.error("Reschedule error:", error);
    res.status(500).json({ error: "Error rescheduling appointment" });
  }
};
