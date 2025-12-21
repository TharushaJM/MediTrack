import express from "express";
import { protect,  approvedDoctorOnly } from "../middleware/authMiddleware.js";
import {
  getMyPatients,
  getMyPatientDetails,
} from "../controllers/doctorController.js";

const router = express.Router();

// Doctor patients list (unique patients based on appointments)
router.get("/patients", protect, approvedDoctorOnly, getMyPatients);

// Single patient details + appointment history (only if relationship exists)
router.get("/patients/:patientId", protect, approvedDoctorOnly, getMyPatientDetails);

export default router;
