import express from "express";
import { createRecord, getRecords } from "../controllers/recordController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRecord);
router.get("/", protect, getRecords);

export default router;
