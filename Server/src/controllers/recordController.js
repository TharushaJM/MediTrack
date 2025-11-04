import Record from "../models/Record.js";

//  Create new record
export const createRecord = async (req, res) => {
  try {
    const record = await Record.create({ userId: req.user.id, ...req.body });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: "Failed to create record", error: err.message });
  }
};

//  Get all records for the logged-in user
export const getRecords = async (req, res) => {
  try {
    const records = await Record.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch records", error: err.message });
  }
};

//  Delete a record
export const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete record", error: err.message });
  }
};