import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyDoctorsConsents,
  setDoctorConsent,
} from "../controllers/consentController.js";

const router = express.Router();

// GET: list doctors + whether reports are shared
router.get("/my-doctors", protect, getMyDoctorsConsents);

//  POST: turn sharing ON/OFF for a doctor
router.post("/set", protect, setDoctorConsent);

export default router;
