import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getPendingDoctors,
  approveDoctor,
} from "../controllers/adminController.js";

const router = express.Router();

// GET /api/admin/doctors/pending
router.get("/doctors/pending", protect, adminOnly, getPendingDoctors);

// PUT /api/admin/doctors/:id/approve
router.put("/doctors/:id/approve", protect, adminOnly, approveDoctor);

export default router;
