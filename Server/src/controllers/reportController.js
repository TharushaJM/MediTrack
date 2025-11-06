import Report from "../models/Report.js";

export const uploadReport = async (req, res) => {
  try {
    const report = await Report.create({
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      fileUrl: req.file.path,
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error uploading report", error });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
};
