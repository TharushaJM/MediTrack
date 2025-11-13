import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get user notifications
router.get("/", protect, async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Mark as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const note = await Notification.findById(req.params.id);

    if (!note || note.user.toString() !== req.user._id.toString())
      return res.status(404).json({ message: "Notification not found" });

    note.read = true;
    await note.save();

    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error marking as read" });
  }
});
// Get unread count quickly
router.get("/unread/count", protect, async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.json({ count });
});

export default router;
