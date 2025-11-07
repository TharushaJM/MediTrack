import Report from "../models/Report.js";

export const uploadReport = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const report = await Report.create({
      user: req.user._id,   // If want userID something hapend
      title: req.body.title || "Untitled Report",
      fileUrl: req.file.path, // Multer stores path here
    });

    res.status(201).json({
      message: "Report uploaded successfully",
      report,
    });
  } catch (error) {
    console.error("Error uploading report:", error);
    res.status(500).json({ message: "Error uploading report", error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports" });
  }
};
