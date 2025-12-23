import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuth = async (socket, next) => {
  try {
    // Token 
    const tokenRaw = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!tokenRaw) {
      return next(new Error("Authentication error: No token provided"));
    }

    // Token 
    const token = tokenRaw.replace(/^"+|"+$/g, "").trim();

    // Verify 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user
    const user = await User.findById(decoded.id || decoded.userId).select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    
    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket Auth Error:", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
};