import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = auth.split(" ")[1];

    // Verify token signature + expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (without password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

export const doctorOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "doctor") {
    return res.status(403).json({ message: "Doctor access only" });
  }
  next();
};
export const approvedDoctorOnly = (req, res, next) => {
  // 1) must be logged in (protect already does that)
  // 2) must be a doctor
  if (!req.user || req.user.role !== "doctor") {
    return res.status(403).json({ message: "Doctor access only" });
  }

  // 3) must be approved
  if (!req.user.isApproved) {
    return res.status(403).json({ message: "Doctor not approved yet" });
  }

  next(); // ✅ allowed
};
