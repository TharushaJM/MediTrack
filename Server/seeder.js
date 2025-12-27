import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/User.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();

// Sample Doctors Data (5)
const doctors = [
  {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@meditrack.com",
    password: "Doctor@123",
    role: "doctor",
    isApproved: true,
    title: "Dr.",
    gender: "Female",
    specialization: "Cardiologist",
    degree: "MBBS, MD (Cardiology)",
    registrationId: "SLMC-12345",
    university: "University of Colombo",
    mobile: "0771234501",
    address: "123 Medical Street, Colombo 07",
    location: "Colombo",
    designation: "Senior Consultant",
    lastWorkPlace: "National Hospital Colombo",
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@meditrack.com",
    password: "Doctor@123",
    role: "doctor",
    isApproved: true,
    title: "Dr.",
    gender: "Male",
    specialization: "Neurologist",
    degree: "MBBS, MD (Neurology)",
    registrationId: "SLMC-12346",
    university: "University of Peradeniya",
    mobile: "0771234502",
    address: "45 Brain Care Lane, Kandy",
    location: "Kandy",
    designation: "Consultant Neurologist",
    lastWorkPlace: "Teaching Hospital Kandy",
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.williams@meditrack.com",
    password: "Doctor@123",
    role: "doctor",
    isApproved: true,
    title: "Dr.",
    gender: "Female",
    specialization: "Dermatologist",
    degree: "MBBS, MD (Dermatology)",
    registrationId: "SLMC-12347",
    university: "University of Kelaniya",
    mobile: "0771234503",
    address: "78 Skin Care Road, Galle",
    location: "Galle",
    designation: "Senior Dermatologist",
    lastWorkPlace: "Karapitiya Hospital",
    profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "James",
    lastName: "Anderson",
    email: "james.anderson@meditrack.com",
    password: "Doctor@123",
    role: "doctor",
    isApproved: true,
    title: "Dr.",
    gender: "Male",
    specialization: "Orthopedic",
    degree: "MBBS, MS (Orthopedics)",
    registrationId: "SLMC-12348",
    university: "University of Sri Jayewardenepura",
    mobile: "0771234504",
    address: "92 Bone Care Avenue, Negombo",
    location: "Negombo",
    designation: "Orthopedic Surgeon",
    lastWorkPlace: "Negombo General Hospital",
    profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Lisa",
    lastName: "Thompson",
    email: "lisa.thompson@meditrack.com",
    password: "Doctor@123",
    role: "doctor",
    isApproved: true,
    title: "Dr.",
    gender: "Female",
    specialization: "Pediatrician",
    degree: "MBBS, DCH, MD (Pediatrics)",
    registrationId: "SLMC-12349",
    university: "University of Colombo",
    mobile: "0771234505",
    address: "56 Children's Lane, Colombo 05",
    location: "Colombo",
    designation: "Consultant Pediatrician",
    lastWorkPlace: "Lady Ridgeway Hospital",
    profileImage: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&h=150&fit=crop&crop=face"
  }
];

// Sample Patients Data (10)
const patients = [
  {
    firstName: "Kamal",
    lastName: "Perera",
    email: "kamal.perera@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Male",
    phone: "0712345601",
    dateOfBirth: "1990-05-15",
    city: "Colombo",
    address: "123 Galle Road, Colombo 03",
    injuryCondition: "Hypertension",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Nimali",
    lastName: "Fernando",
    email: "nimali.fernando@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Female",
    phone: "0712345602",
    dateOfBirth: "1985-08-22",
    city: "Kandy",
    address: "45 Peradeniya Road, Kandy",
    injuryCondition: "Diabetes Type 2",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Ruwan",
    lastName: "Silva",
    email: "ruwan.silva@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Male",
    phone: "0712345603",
    dateOfBirth: "1978-12-10",
    city: "Galle",
    address: "78 Beach Road, Galle",
    injuryCondition: "Arthritis",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Sachini",
    lastName: "Jayawardena",
    email: "sachini.j@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Female",
    phone: "0712345604",
    dateOfBirth: "1995-03-28",
    city: "Negombo",
    address: "12 Sea Street, Negombo",
    injuryCondition: "Asthma",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Dinesh",
    lastName: "Kumara",
    email: "dinesh.kumara@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Male",
    phone: "0712345605",
    dateOfBirth: "1988-07-04",
    city: "Kurunegala",
    address: "34 Colombo Road, Kurunegala",
    injuryCondition: "Back Pain",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Malini",
    lastName: "Wickramasinghe",
    email: "malini.w@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Female",
    phone: "0712345606",
    dateOfBirth: "1982-11-19",
    city: "Matara",
    address: "56 Main Street, Matara",
    injuryCondition: "Migraine",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Prasad",
    lastName: "Rathnayake",
    email: "prasad.r@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Male",
    phone: "0712345607",
    dateOfBirth: "1992-01-25",
    city: "Jaffna",
    address: "89 Hospital Road, Jaffna",
    injuryCondition: "Allergies",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Chamari",
    lastName: "Dissanayake",
    email: "chamari.d@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Female",
    phone: "0712345608",
    dateOfBirth: "1998-06-12",
    city: "Anuradhapura",
    address: "23 Sacred City Road, Anuradhapura",
    injuryCondition: "None",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Saman",
    lastName: "Bandara",
    email: "saman.bandara@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Male",
    phone: "0712345609",
    dateOfBirth: "1975-09-30",
    city: "Batticaloa",
    address: "67 Lake Road, Batticaloa",
    injuryCondition: "Heart Condition",
    profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
  },
  {
    firstName: "Iresha",
    lastName: "Gamage",
    email: "iresha.gamage@gmail.com",
    password: "Patient@123",
    role: "patient",
    isApproved: true,
    gender: "Female",
    phone: "0712345610",
    dateOfBirth: "2000-04-08",
    city: "Colombo",
    address: "101 Duplication Road, Colombo 04",
    injuryCondition: "Skin Allergy",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("🔗 Connected to database\n");

    // Seed Admin
    const adminEmail = "admin@meditrack.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("✅ Admin already exists:", existingAdmin.email);
    } else {
      const adminData = {
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        password: "Admin@123",
        role: "admin",
        isApproved: true,
        profileImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face"
      };
      await User.create(adminData);
      console.log("✅ Admin created: admin@meditrack.com / Admin@123");
    }

    // Seed Doctors
    console.log("\n👨‍⚕️ Seeding Doctors...");
    let doctorCount = 0;
    for (const doctor of doctors) {
      const exists = await User.findOne({ email: doctor.email });
      if (!exists) {
        await User.create(doctor);
        doctorCount++;
        console.log(`   ✅ Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`);
      } else {
        console.log(`   ⏭️  Dr. ${doctor.firstName} ${doctor.lastName} already exists`);
      }
    }
    console.log(`   📊 ${doctorCount} new doctors added`);

    // Seed Patients
    console.log("\n🧑‍🤝‍🧑 Seeding Patients...");
    let patientCount = 0;
    for (const patient of patients) {
      const exists = await User.findOne({ email: patient.email });
      if (!exists) {
        await User.create(patient);
        patientCount++;
        console.log(`   ✅ ${patient.firstName} ${patient.lastName} (${patient.city})`);
      } else {
        console.log(`   ⏭️  ${patient.firstName} ${patient.lastName} already exists`);
      }
    }
    console.log(`   📊 ${patientCount} new patients added`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEEDING COMPLETE!");
    console.log("=".repeat(50));
    console.log("\n📋 Login Credentials:");
    console.log("   Admin:    admin@meditrack.com / Admin@123");
    console.log("   Doctors:  [email]@meditrack.com / Doctor@123");
    console.log("   Patients: [email]@gmail.com / Patient@123");
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
