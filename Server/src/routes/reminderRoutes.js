import express from "express";
import Reminder from "../models/Reminder.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ Correct import

const router = express.Router();

/**
 * 🧠 Get all reminders for logged-in user
 */
router.get("/", protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
});

/**
 * ➕ Add a new reminder
 */
router.post("/", protect, async (req, res) => {
  try {
    const { name, dosage, time, frequency, notes } = req.body;

    if (!name || !time) {
      return res.status(400).json({ message: "Name and time are required" });
    }

    const reminder = new Reminder({
      user: req.user._id,
      name,
      dosage,
      time,
      frequency,
      notes,
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    console.error("Error adding reminder:", error);
    res.status(500).json({ message: "Failed to add reminder" });
  }
});

/**
 * ❌ Delete a reminder
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Ensure user owns this reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await reminder.deleteOne();
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ message: "Failed to delete reminder" });
  }
});

export default router;
