import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import Notification from "../models/Notification.js";

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  const today = new Date().toISOString().slice(0, 10);

  const reminders = await Reminder.find();

  for (const r of reminders) {
    if (r.time === currentTime) {
      await Notification.create({
        user: r.user,
        title: `Medication Reminder`,
        message: `It's time to take ${r.name} (${r.dosage})`,
        reminderId: r._id
      });
    }
  }
});
