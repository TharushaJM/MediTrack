import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getChatHistory, sendMessage, getConversations } from "../controllers/chatController.js";

const router = express.Router();
    
router.get("/", protect, getConversations);
router.get("/:otherUserId", protect, getChatHistory);
router.post("/:otherUserId", protect, sendMessage);

export default router;
