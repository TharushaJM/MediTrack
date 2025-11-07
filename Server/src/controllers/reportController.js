import fs from "fs";
import path from "path";
import Report from "../models/Report.js";

// Upload a new report
export const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const title = req.body.title?.trim() || "Untitled Report"; // ✅ Fix
    const fileUrl = `uploads/${req.file.filename}`;

    const report = await Report.create({
      user: req.user.id,
      type: req.body.type,
      title:req.body.title,
      fileUrl,
    });

    console.log(" Uploaded:", fileUrl);

    res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      report,
    });
  } catch (error) {
    console.error(" Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading report",
      error: error.message,
    });
  }
};
// Get reports for the logged-in user
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    // ✅ Return array directly (frontend expects reports.map)
    res.status(200).json(reports);
  } catch (error) {
    console.error(" Fetch reports error:", error);
    res.status(500).json({ message: "Error fetching reports", error });
  }
};

// Delete a report
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const filePath = path.join(process.cwd(), report.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error(" Delete error:", error);
    res.status(500).json({ message: "Error deleting report", error });
  }
};
