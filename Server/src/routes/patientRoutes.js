import express from "express";
import { protect, patientOnly } from "../middleware/authMiddleware.js";
import { getMyDoctors, getMyDoctorDetails } from "../controllers/patientController.js";

const router = express.Router();

// Patient can see only doctors who have appointments with them
router.get("/doctors", protect, patientOnly, getMyDoctors);

// Optional: details (still appointment relationship check inside controller)
router.get("/doctors/:doctorId", protect, patientOnly, getMyDoctorDetails);

export default router;
