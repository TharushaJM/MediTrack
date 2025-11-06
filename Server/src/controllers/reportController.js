import Report from "../models/Report.js";

export const uploadReport = async (req, res) => {
  try {
    const newReport = new Report({
      user: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
    });
    await newReport.save();

    res.status(201).json({ message: "Report uploaded successfully", report: newReport });
  } catch (error) {
    res.status(500).json({ message: "Error uploading report", error });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
};
