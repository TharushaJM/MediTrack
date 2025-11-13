import express from "express";
import Reminder from "../models/Reminder.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ------------------------------------------------
 * 🧠 Get all reminders for logged-in user
 * ------------------------------------------------
 */
router.get("/", protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
});

/**
 * ------------------------------------------------
 * ➕ Add a new reminder
 * ------------------------------------------------
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
 * ------------------------------------------------
 * ❌ Delete a reminder
 * ------------------------------------------------
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

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

/**
 * ------------------------------------------------
 * ✔ Mark reminder as TAKEN or NOT TAKEN
 * ------------------------------------------------
 */
router.put("/:id/take", protect, async (req, res) => {
  try {
    const { taken } = req.body; // should be true/false

    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const today = new Date().toISOString().slice(0, 10);

    const idx = reminder.takenDates.findIndex((t) => t.date === today);

    if (idx !== -1) {
      reminder.takenDates[idx].taken = taken;
    } else {
      reminder.takenDates.push({ date: today, taken });
    }

    await reminder.save();

    res.json({
      message: "Taken status updated",
      reminder,
    });
  } catch (err) {
    console.error("Error updating taken status:", err);
    res.status(500).json({ message: "Failed to update taken status" });
  }
});

/**
 * ------------------------------------------------
 * 📊 Daily summary — how many taken today
 * ------------------------------------------------
 */
router.get("/summary/today", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const reminders = await Reminder.find({ user: req.user._id });

    const total = reminders.length;

    const taken = reminders.filter((r) =>
      r.takenDates.some((t) => t.date === today && t.taken)
    ).length;

    res.json({
      total,
      taken,
      progress: total === 0 ? 0 : taken / total,
    });
  } catch (err) {
    console.log("Summary error:", err);
    res.status(500).json({ message: "Summary error" });
  }
});

export default router;
