import express from "express";
import { uploadReport, getReports } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // or configure properly later

// Upload a report
router.post("/upload", protect, upload.single("file"), uploadReport);

// Get all reports for the user
router.get("/", protect, getReports);

export default router;
