const Appointment = require('../models/Appointment');

// 1. Book Appointment (Patient)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;
    const patientId = req.user.id; // Get from authenticated user

    // Validate required fields
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ error: "Doctor, date, and time slot are required" });
    }

    // Check for duplicate booking (same doctor, date, time)
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: "Cancelled" }
    });

    if (existingAppointment) {
      return res.status(409).json({ error: "This time slot is already booked" });
    }

    const newAppointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeSlot
    });

    const savedAppt = await newAppointment.save();
    
    res.status(201).json({ message: "Booking Successful!", data: savedAppt });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Booking Failed" });
  }
};

// 2. Get Doctor's Appointments (Doctor)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.doctorId || req.user.id;
    
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email phone')
      .sort({ date: -1, timeSlot: 1 });
      
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Error fetching appointments" });
  }
};

// 3. Get Patient's Appointments (Patient)
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort({ date: -1, timeSlot: 1 });
      
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Error fetching appointments" });
  }
};

// 4. Update Appointment Status (Doctor)
exports.updateAppointmentStatus = async (req, res) => {
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
    );

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json({ message: "Status updated", data: appointment });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Error updating appointment" });
  }
};

// 5. Cancel Appointment (Patient/Doctor)
exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "Cancelled" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment cancelled", data: appointment });
  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({ error: "Error cancelling appointment" });
  }
};

// 6. Get Available Time Slots for a Doctor on a Date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ error: "Doctor ID and date are required" });
    }

    // All possible time slots
    const allSlots = [
      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
    ];

    // Find booked slots
    const bookedAppointments = await Appointment.find({
      doctorId,
      date,
      status: { $ne: "Cancelled" }
    });

    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({ availableSlots, bookedSlots });
  } catch (error) {
    console.error("Slots error:", error);
    res.status(500).json({ error: "Error fetching available slots" });
  }
};