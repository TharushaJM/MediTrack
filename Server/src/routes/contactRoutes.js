import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  submitContact,
  getAllContacts,
  getUnreadCount,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

// Public route - anyone can submit a contact message
router.post("/", submitContact);

// Admin routes - require authentication and admin role
router.get("/", protect, adminOnly, getAllContacts);
router.get("/unread-count", protect, adminOnly, getUnreadCount);
router.patch("/:id/status", protect, adminOnly, updateContactStatus);
router.delete("/:id", protect, adminOnly, deleteContact);

export default router;
