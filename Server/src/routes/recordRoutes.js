import express from "express";
import { createRecord, getRecords, deleteRecord } from "../controllers/recordController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createRecord)
  .get(protect, getRecords);

router.route("/:id").delete(protect, deleteRecord);

export default router;
