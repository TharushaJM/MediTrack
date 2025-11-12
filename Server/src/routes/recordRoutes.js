import express from "express";
import { createRecord, getRecords ,deleteRecord } from "../controllers/recordController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRecord);
router.get("/", protect, getRecords);
router.delete("/:id", protect, deleteRecord);

export default router;
