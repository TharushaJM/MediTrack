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
// GET unread notification count
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get count" });
  }
});

// Mark all unread notifications for the user as read
router.put("/read-all", protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    // result may vary by mongoose version
    const modified = result.modifiedCount ?? result.nModified ?? 0;
    res.json({ message: "Marked all as read", modifiedCount: modified });
  } catch (err) {
    console.error("Error marking all read:", err);
    res.status(500).json({ message: "Failed to mark all read" });
  }
});

// Delete all read notifications for the user
router.delete("/clear-read", protect, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ user: req.user._id, read: true });
    const deleted = result.deletedCount ?? result.n ?? 0;
    res.json({ message: "Cleared read notifications", deletedCount: deleted });
  } catch (err) {
    console.error("Error clearing read notifications:", err);
    res.status(500).json({ message: "Failed to clear read notifications" });
  }
});


export default router;
