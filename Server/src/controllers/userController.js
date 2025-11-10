import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// ✅ REGISTER USER
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "Email already exists" });

  // ❌ REMOVE manual hash — the schema handles it
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password, // plain — auto-hash in pre('save')
    role,
  });

  const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// ✅ LOGIN USER
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

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  console.log("✅ Login success for:", user.email);

  res.status(200).json({
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

// ✅ GET PROFILE
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// ✅ UPDATE PROFILE (with password change)
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

  // ✅ Change password safely
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
