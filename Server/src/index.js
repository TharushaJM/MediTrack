import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from  "./routes/userRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("MediTrack backend running ");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));