import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/User.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // connect to DB
    await connectDB();

    const adminEmail = "admin@meditrack.com";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(" Admin already exists:", existingAdmin.email);
    } else {
      const adminData = {
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        password: "Admin@123", // you can change this later
        role: "admin",
        isApproved: true,      // admins are always approved
      };

      const admin = await User.create(adminData);
      console.log(" Admin user created:");
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${adminData.password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(" Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
