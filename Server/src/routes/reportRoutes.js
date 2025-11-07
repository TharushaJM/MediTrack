import express from "express";
import { uploadReport, getReports, deleteReport } from "../controllers/reportController.js";
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
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// Upload a report
router.post("/upload", protect, upload.single("file"), uploadReport);

// Get all reports
router.get("/", protect, getReports);

// Delete a report
router.delete("/:id", protect, deleteReport);

export default router;
