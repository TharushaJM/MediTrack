import express from "express";
import Report from "../models/Report.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ---------------------------------------------
// Helper: Safe AI call
// ---------------------------------------------
async function safeOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      text: "⚠ AI unavailable (no API key configured). Showing fallback response.\n\n"
        + "Your report looks generally stable. No major issues detected. For full AI insights, enable your OpenAI API key.",
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    return { text: data.choices[0].message.content };
  } catch (err) {
    console.error("OpenAI error:", err);
    return { text: "AI service error. Try again later." };
  }
}

// ------------------------------------------------------
// 1️⃣ AI Summary Route
// ------------------------------------------------------
router.post("/summary", async (req, res) => {
  const { reportId } = req.body;

  try {
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const prompt = `
      You are a health diagnostic AI. Analyze this report text:

      "${report.extractedText || "No text found"}"

      Provide a short and clear summary a normal person can understand.
      Highlight anything abnormal or concerning.
    `;

    const result = await safeOpenAI(prompt);
    return res.json({ summary: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------------------------------
// 2️⃣ AI Chat Route
// ------------------------------------------------------
router.post("/chat", async (req, res) => {
  const { reportId, question } = req.body;

  try {
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const prompt = `
      The following is a medical report:

      "${report.extractedText}"

      The user is asking: "${question}"
      Answer clearly, safely, and simply.
    `;

    const result = await safeOpenAI(prompt);
    res.json({ reply: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------------------------------------------
// 3️⃣ AI Diagnosis (Optional Future Use)
// ------------------------------------------------------
router.post("/diagnose", async (req, res) => {
  const { reportId } = req.body;

  try {
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const prompt = `
      Analyze this medical report:

      "${report.extractedText}"

      • List possible medical conditions  
      • Rate risk level (low / medium / high)  
      • Give advice whether to see a doctor  

      Keep everything safe, factual, and non-alarming.
    `;

    const result = await safeOpenAI(prompt);
    res.json({ diagnosis: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
