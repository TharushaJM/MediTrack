import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getPendingDoctors,
  getAllDoctors,
  getAllPatients,
  approveDoctor,
  rejectDoctor,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected user routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Admin routes - Get users
router.get("/doctors/pending", protect, getPendingDoctors); // Pending doctors only
router.get("/doctors/all", protect, getAllDoctors); // All doctors (approved + pending)
router.get("/patients", protect, getAllPatients); // All patients

// Admin routes - Approve/Reject doctors
router.put("/doctors/:id/approve", protect, approveDoctor);
router.delete("/doctors/:id/reject", protect, rejectDoctor);

export default router;
