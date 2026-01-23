import express from "express";
import Report from "../models/Report.js";
import Record from "../models/Record.js";
import { protect } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ---------------------------------------------
// Helper: Generate fallback tips based on user data
// ---------------------------------------------
function generateFallbackTips(record) {
  const tips = [];

  // Sleep tip
  if (record.sleepHours && record.sleepHours < 7) {
    tips.push({
      type: "sleep",
      title: "Sleep More",
      text: `You logged ${record.sleepHours}h of sleep. Aim for 7-9 hours tonight for better energy.`
    });
  } else if (record.sleepHours && record.sleepHours > 9) {
    tips.push({
      type: "sleep",
      title: "Sleep Quality",
      text: "You're getting plenty of sleep. Focus on consistent bedtime for better quality."
    });
  } else {
    tips.push({
      type: "sleep",
      title: "Sleep Well",
      text: "Maintain your good sleep routine. Go to bed at the same time tonight."
    });
  }

  // Water tip
  if (record.waterIntake && record.waterIntake < 6) {
    tips.push({
      type: "hydration",
      title: "Drink More Water",
      text: `You had ${record.waterIntake} cups. Try to reach 8 cups today for better hydration.`
    });
  } else {
    tips.push({
      type: "hydration",
      title: "Stay Hydrated",
      text: "Keep a water bottle nearby and sip regularly throughout the day."
    });
  }

  // Mood/Energy tip
  if (record.mood && record.mood < 6) {
    tips.push({
      type: "stress",
      title: "Boost Your Mood",
      text: "Take a short walk outside or listen to uplifting music to lift your spirits."
    });
  } else if (record.energy && record.energy < 6) {
    tips.push({
      type: "activity",
      title: "Energy Boost",
      text: "Try a 10-minute walk or stretching to recharge your energy levels."
    });
  } else {
    tips.push({
      type: "meals",
      title: "Healthy Eating",
      text: "Choose whole foods like fruits, nuts, and veggies for sustained energy."
    });
  }

  return tips;
}

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
   - Format: "Blood Sugar: 9.8 (Target: <7) - Too High [Needs attention]"
   - Only include abnormal or important numbers
   - Add indicators: [Normal] (good), [Needs attention] (warning), [Urgent] (critical)

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
// ------------------------------------------------------
// 4️⃣ AI Insights for Today (Dashboard tips)
// ------------------------------------------------------
router.post("/insights/today", protect, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const latest = await Record.findOne({ userId }).sort({ createdAt: -1 }).lean();

    // If user has no check-ins yet
    if (!latest) {
      return res.json({
        updatedAt: new Date().toISOString(),
        tips: [
          { type: "focus", title: "Focus", text: "Add your first check-in to get tips for today." },
          { type: "hydration", title: "Hydration", text: "Keep a bottle near you and sip often." },
          { type: "meals", title: "Meals", text: "Try a balanced meal with protein + fiber today." },
        ],
      });
    }

    const prompt = `
You are a supportive wellness coach. Do NOT diagnose. Do NOT mention diseases.
Make exactly 3 short tips for today based on the user's latest wellness record.

Latest record JSON:
${JSON.stringify(latest, null, 2)}

Return VALID JSON ONLY (no markdown, no extra words).
Schema:
{
  "updatedAt": "<ISO string>",
  "tips": [
    { "type": "focus|hydration|meals|sleep|stress|activity", "title": "<short>", "text": "<1 sentence, max 140 chars>" }
  ]
}
Rules:
- Always return exactly 3 tips.
- Make tips actionable and calm.
- If a value is missing, give a general safe tip.
`;

    const result = await safeGeminiAI(prompt);

    // Check if AI returned an error message
    if (result.text.includes("AI unavailable") || result.text.includes("AI Error") || result.text.includes("overloaded")) {
      // Return smart fallback tips based on actual user data
      return res.json({
        updatedAt: new Date().toISOString(),
        tips: generateFallbackTips(latest),
      });
    }

    // Parse JSON safely
    let obj;
    try {
      obj = JSON.parse(
        (result.text || "")
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim()
      );
    } catch {
      // Fallback if parsing fails
      return res.json({
        updatedAt: new Date().toISOString(),
        tips: generateFallbackTips(latest),
      });
    }

    return res.json(obj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
