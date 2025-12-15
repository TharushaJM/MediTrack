import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },

    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "doctor" ? false : true;
      },
    },

    // Doctor-specific fields (optional for patients)
    title: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      default: "",
    },

    specialization: {
      type: String,
      default: "",
    },

    degree: {
      type: String,
      default: "",
    },

    registrationId: {
      type: String,
      default: "",
    },

    university: {
      type: String,
      default: "",
    },

    mobile: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    lastWorkPlace: {
      type: String,
      default: "",
    },

    // Patient-specific fields
    phone: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    injuryCondition: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    // Legacy field - keeping for backward compatibility
    licenseNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

//
// Password comparison
//
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

//
// Auto-hash password before save
//
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("User", userSchema);
