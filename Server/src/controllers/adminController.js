import User from "../models/User.js";
import asyncHandler from "express-async-handler";

// GET /api/admin/doctors/pending
// @desc  Get all pending doctor accounts
// @access Admin
export const getPendingDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({
    role: "doctor",
    isApproved: false,
  }).select("-password"); // don't send passwords

  res.json(doctors);
});

// PUT /api/admin/doctors/:id/approve
// @desc  Approve a doctor account
// @access Admin
export const approveDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doctor = await User.findById(id);

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  if (doctor.role !== "doctor") {
    return res
      .status(400)
      .json({ message: "User is not registered as a doctor" });
  }

  if (doctor.isApproved) {
    return res.status(400).json({ message: "Doctor is already approved" });
  }

  doctor.isApproved = true;
  await doctor.save();

  res.json({
    message: "Doctor approved successfully",
    doctor: {
      id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      role: doctor.role,
      isApproved: doctor.isApproved,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
    },
  });
});
