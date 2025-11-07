import express from "express";
import { uploadReport, getReports } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // keep correct extension
  },
});

const upload = multer({ storage });

// Upload a report
router.post("/upload", protect, upload.single("file"), uploadReport);

// Get all reports for the user
router.get("/", protect, getReports);

export default router;
