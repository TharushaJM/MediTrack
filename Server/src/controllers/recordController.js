import Record from "../models/Record.js";

export const createRecord = async (req, res) => {
  try {
    const newRecord = new Record({
      ...req.body,
      userId: req.user.id,
    });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create record" });
  }
};

export const getRecords = async (req, res) => {
  try {
    const records = await Record.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch records" });
  }
};
