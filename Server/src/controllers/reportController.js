// src/controllers/reportController.js

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import Tesseract from "tesseract.js";
import Report from "../models/Report.js";

// ---------- pdf-parse setup (CommonJS inside ESM) ----------
const require = createRequire(import.meta.url);

let pdfParse = null;

try {
  pdfParse = require("pdf-parse");
  console.log("✅ pdf-parse v1.x loaded successfully");
} catch (err) {
  console.error("❌ Failed to load pdf-parse module:", err);
}

/**
 * Extract text from a PDF file
 */
async function extractTextFromPDF(filePath) {
  try {
    if (!pdfParse) {
      console.error("⚠️ pdf-parse is not available. Skipping PDF text extraction.");
      return "";
    }

    const dataBuffer = fs.readFileSync(filePath);
    
    // pdf-parse v1.x is a simple function that takes buffer
    const data = await pdfParse(dataBuffer);
    const text = (data.text || "").trim();
    console.log("✅ PDF extraction complete. Length:", text.length);
    if (text.length > 0) {
      console.log("📄 Text preview:", text.substring(0, 200) + "...");
    }
    return text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "";
  }
}

/**
 * Extract text from an image using OCR (Tesseract)
 */
async function extractTextFromImage(filePath) {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log(m), // Optional progress logs
    });
    const cleaned = (text || "").trim();
    console.log("✅ OCR extraction complete. Length:", cleaned.length);
    return cleaned;
  } catch (error) {
    console.error("OCR extraction error:", error);
    return "";
  }
}

/**
 * @desc   Upload a new report
 * @route  POST /api/reports/upload
 * @access Private
 */
export const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const title = req.body.title?.trim() || "Untitled Report";
    const fileUrl = `uploads/${req.file.filename}`;
    const fullFilePath = path.join(process.cwd(), fileUrl);

    console.log("📤 Upload started for file:", req.file.filename);
    console.log("📂 File type:", req.file.mimetype);

    // Extract text based on file extension
    let extractedText = "";
    const fileExtension = path.extname(req.file.filename).toLowerCase();

    if (fileExtension === ".pdf") {
      console.log("📄 Extracting text from PDF...");
      extractedText = await extractTextFromPDF(fullFilePath);
    } else if (
      [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExtension)
    ) {
      console.log("🖼️ Extracting text from image using OCR...");
      extractedText = await extractTextFromImage(fullFilePath);
    } else {
      console.log(
        "⚠️ File type not supported for text extraction:",
        fileExtension
      );
    }

    // If no text extracted, allow manual text from request body (optional)
    if (!extractedText && req.body.extractedText) {
      extractedText = req.body.extractedText;
      console.log("📝 Using manually provided text");
    }

    const report = await Report.create({
      user: req.user.id,
      type: req.body.type,
      title,
      fileUrl,
      extractedText: (extractedText || "").trim(),
    });

    console.log("✅ Report saved to database");
    console.log(
      "📝 Final extracted text length:",
      (extractedText || "").length,
      "characters"
    );
    if (extractedText && extractedText.length > 0) {
      console.log(
        "📄 Text preview:",
        extractedText.substring(0, 100) + "..."
      );
    }

    res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      report,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading report",
      error: error.message,
    });
  }
};

/**
 * @desc   Get reports for the logged-in user
 * @route  GET /api/reports
 * @access Private
 */
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error(" Fetch reports error:", error);
    res.status(500).json({ message: "Error fetching reports", error });
  }
};

/**
 * @desc   Delete a report
 * @route  DELETE /api/reports/:id
 * @access Private
 */
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Ensure the report belongs to the logged-in user
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

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
