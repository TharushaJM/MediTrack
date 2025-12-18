import express from "express";
import multer from "multer";
import path from "path";

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getPendingDoctors,
  getAllDoctors,
  getApprovedDoctors,
  getAllPatients,
  approveDoctor,
  rejectDoctor,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer configuration for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + Date.now() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Public routes
router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.get("/doctors/approved", getApprovedDoctors); // Public - For Find Doctor page

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
