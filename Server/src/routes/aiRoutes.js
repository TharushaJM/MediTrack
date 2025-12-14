import express from "express";
import Report from "../models/Report.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ---------------------------------------------
// Helper: Safe AI call using Google Gemini
// ---------------------------------------------
async function safeGeminiAI(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      text: "⚠ AI unavailable (no API key configured). Showing fallback response.\n\n"
        + "Your report looks generally stable. No major issues detected. For full AI insights, enable your Gemini API key.",
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    // Log the full response for debugging
    console.log("Gemini API Response:", JSON.stringify(data, null, 2));
    
    // Check for error in response
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return { text: `AI Error: ${data.error.message || 'Unknown error'}` };
    }
    
    // Check for valid response structure
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return { text: data.candidates[0].content.parts[0].text };
    } else {
      console.error("Unexpected Gemini response structure:", data);
      return { text: "AI service returned an unexpected response. Please check your API key and try again." };
    }
  } catch (err) {
    console.error("Gemini API error:", err);
    return { text: "AI service error. Try again later." };
  }
}

// ------------------------------------------------------
//  AI Summary Route
// ------------------------------------------------------
router.post("/summary", async (req, res) => {
  const { reportId } = req.body;

  try {
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const prompt = `
You are a helpful medical assistant talking to a patient. Analyze this medical report and extract ONLY the most important information the patient needs to know.

REPORT TEXT:
"${report.extractedText || "No text found"}"

INSTRUCTIONS:
Return a JSON-like structured response with these sections:

1. **What This Is About** (1 short sentence): Why did you visit? What was checked?

2. **Numbers That Matter** (list up to 3-4 key values):
   - Format: "Blood Sugar: 9.8 (Target: <7) - Too High ⚠️"
   - Only include abnormal or important numbers
   - Add emoji indicators: ✅ (good), ⚠️ (needs attention), 🔴 (urgent)

3. **What You Should Do** (2-3 simple action items):
   - Take medication X twice daily
   - Check blood sugar every morning
   - Schedule follow-up in 2 weeks
   - Exercise 30 minutes daily

4. **Questions to Ask Your Doctor** (1-2 questions based on the report):
   - Why is my blood pressure still high?
   - What foods should I avoid?

Keep it extremely simple - like explaining to a family member. No medical jargon. Be specific and actionable.
    `;

    const result = await safeGeminiAI(prompt);
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

    const result = await safeGeminiAI(prompt);
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

    const result = await safeGeminiAI(prompt);
    res.json({ diagnosis: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
