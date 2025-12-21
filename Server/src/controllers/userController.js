import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// helper to generate token (optional but cleaner)
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ REGISTER USER
export const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role: requestedRole,
    // Doctor-specific fields
    title,
    gender,
    specialization,
    degree,
    registrationId,
    university,
    mobile,
    address,
    location,
    designation,
    lastWorkPlace,
    // Patient-specific fields
    phone,
    dateOfBirth,
    city,
    injuryCondition,
    // Legacy field
    licenseNumber,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // ✅ Only allow 'patient' or 'doctor' via public registration
  let role = "patient";
  if (requestedRole === "doctor") {
    role = "doctor";
  } else {
    role = "patient";
  }

  // Handle profile image upload
  let profileImageUrl = "";
  if (req.file) {
    profileImageUrl = `/uploads/profiles/${req.file.filename}`;
  }

  // ✅ Let the schema handle password hashing + isApproved default
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password, // plain — auto-hash in pre('save')
    role,
    // Common fields
    title: title || "",
    gender: gender || "",
    address: address || "",
    profileImage: profileImageUrl,
    // Doctor-specific fields
    specialization: specialization || "",
    degree: degree || "",
    registrationId: registrationId || "",
    university: university || "",
    mobile: mobile || "",
    location: location || "",
    designation: designation || "",
    lastWorkPlace: lastWorkPlace || "",
    // Patient-specific fields
    phone: phone || "",
    dateOfBirth: dateOfBirth || "",
    city: city || "",
    injuryCondition: injuryCondition || "",
    licenseNumber: licenseNumber || "",
    // isApproved will be set by schema:
    // doctor  -> false
    // others  -> true
  });

  //  For doctors, don't auto-login (they need approval)
  if (role === "doctor") {
    return res.status(201).json({
      message: "Doctor registration successful! Your account is pending admin approval.",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        isApproved: newUser.isApproved,
        title: newUser.title,
        gender: newUser.gender,
        specialization: newUser.specialization,
        degree: newUser.degree,
        registrationId: newUser.registrationId,
        university: newUser.university,
        mobile: newUser.mobile,
        address: newUser.address,
        location: newUser.location,
        designation: newUser.designation,
        lastWorkPlace: newUser.lastWorkPlace,
      },
    });
  }

  //  For patients, auto-login with token
  const token = generateToken(newUser);

  res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      isApproved: newUser.isApproved,
      specialization: newUser.specialization,
      licenseNumber: newUser.licenseNumber,
    },
  });
});

//  LOGIN USER
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("📥 Login attempt:", req.body);

  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ No user found for email:", email);
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    console.log("❌ Password mismatch for:", email);
    return res.status(400).json({ message: "Invalid email or password" });
  }

  //  Check if doctor is approved
  if (user.role === "doctor" && !user.isApproved) {
    console.log("❌ Doctor not approved yet:", email);
    return res.status(403).json({ 
      message: "Your account is pending admin approval. Please wait for approval before logging in." 
    });
  }

  const token = generateToken(user);

  console.log("✅ Login success for:", user.email);

  res.status(200).json({
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,          //  important for blocking unapproved doctors in UI
      specialization: user.specialization,  // optional but handy
      licenseNumber: user.licenseNumber,
      profileImage: user.profileImage,      //  for displaying profile picture
    },
  });
});

//  GET PROFILE
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// UPDATE PROFILE (with password change)
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.email = req.body.email || user.email;
  user.age = req.body.age ?? user.age;
  user.gender = req.body.gender || user.gender;
  user.bloodType = req.body.bloodType || user.bloodType;
  user.height = req.body.height ?? user.height;
  user.weight = req.body.weight ?? user.weight;

  // (optional) allow doctor to update specialization/license:
  // user.specialization = req.body.specialization || user.specialization;
  // user.licenseNumber = req.body.licenseNumber || user.licenseNumber;

  //  Change password safely
  if (req.body.currentPassword && req.body.newPassword) {
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error("Current password is incorrect");
    }
    user.password = req.body.newPassword; // auto-hash by pre('save')
  }

  const updatedUser = await user.save();
  res.json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

//  GET PENDING DOCTORS (for admin approval)
export const getPendingDoctors = asyncHandler(async (req, res) => {
  const pendingDoctors = await User.find({
    role: "doctor",
    isApproved: false,
  }).select("-password");

  res.json(pendingDoctors);
});

//  GET ALL DOCTORS (approved + pending)
export const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({
    role: "doctor",
  })
    .select("-password")
    .sort({ createdAt: -1 }); // newest first

  res.json(doctors);
});

//  GET APPROVED DOCTORS ONLY (Public - for Find Doctor page)
export const getApprovedDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({
    role: "doctor",
    isApproved: true,
  })
    .select("-password")
    .sort({ createdAt: -1 });

  res.json(doctors);
});

//  GET ALL PATIENTS
export const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await User.find({
    role: "patient",
  })
    .select("-password")
    .sort({ createdAt: -1 }); // newest first

  res.json(patients);
});

//  APPROVE DOCTOR
export const approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  if (doctor.role !== "doctor") {
    res.status(400);
    throw new Error("User is not a doctor");
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
      specialization: doctor.specialization,
      isApproved: doctor.isApproved,
    },
  });
});

//  REJECT DOCTOR
export const rejectDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  if (doctor.role !== "doctor") {
    res.status(400);
    throw new Error("User is not a doctor");
  }

  // Option 1: Delete the doctor
  await User.findByIdAndDelete(req.params.id);

  // Option 2: Keep but mark as rejected (would need a 'rejected' field)
  // doctor.isApproved = false;
  // doctor.rejected = true;
  // await doctor.save();

  res.json({
    message: "Doctor rejected and removed",
  });
});
