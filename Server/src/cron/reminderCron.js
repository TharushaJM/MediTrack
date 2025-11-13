import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import Notification from "../models/Notification.js";

// Run every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Get all reminders
    const reminders = await Reminder.find();

    for (const r of reminders) {
      // If reminder time matches current time
      if (r.time === currentTime) {
        
        
        const alreadySent = await Notification.findOne({
          user: r.user,
          reminderId: r._id,
          createdAt: {
            $gte: new Date(`${today}T00:00:00`),
            $lte: new Date(`${today}T23:59:59`)
          }
        });

        // If exists → do nothing
        if (alreadySent) continue;

      
        await Notification.create({
          user: r.user,
          title: "Medication Reminder",
          message: `It's time to take ${r.name} (${r.dosage || ""})`,
          reminderId: r._id,
        });

        console.log(`✔ Notification created for: ${r.name} (${r.time})`);
      }
    }
  } catch (err) {
    console.error("❌ Cron error:", err);
  }
});
