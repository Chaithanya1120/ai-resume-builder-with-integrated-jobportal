// controllers/aiController.js
import Resume from "../models/Resume.js";
import fetch from "node-fetch";
import mongoose from "mongoose";
import { memoryResumes } from "./resumeController.js";

/* ===============================
   OPENROUTER AI SETTINGS
================================ */
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo";

/**
 * Generate text using OpenRouter API
 * @param {string} prompt
 * @param {object} options
 */
async function generateText(prompt, options = {}) {
  const url = "https://openrouter.ai/api/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Resume Builder",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: options.max_new_tokens || 300,
      ...(options.response_format && { response_format: options.response_format })
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/* ===============================
   ENHANCE PROFESSIONAL SUMMARY
================================ */
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) return res.status(400).json({ message: "Missing required fields: userContent" });

    const prompt = `You are an expert resume writer. Enhance this professional summary to 1-2 sentences, compelling, ATS-friendly, highlighting skills, experience, and career goals:\n${userContent}`;

    const enhancedContent = await generateText(prompt, { max_new_tokens: 100 });

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    console.error("Enhance Pro Summary Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ===============================
   ENHANCE JOB DESCRIPTION
================================ */
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) return res.status(400).json({ message: "Missing required fields: userContent" });

    const prompt = `You are an expert resume writer. Enhance this job description to 1-2 sentences, ATS-friendly, highlight responsibilities and achievements, use action verbs and numbers:\n${userContent}`;

    const enhancedContent = await generateText(prompt, { max_new_tokens: 100 });

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    console.error("Enhance Job Desc Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ===============================
   UPLOAD AND PARSE RESUME
================================ */
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText || resumeText.trim() === "") {
      return res.status(400).json({ message: "Missing required fields: resumeText" });
    }

    const prompt = `Extract this resume into a JSON object with fields: professional_summary, skills (array), personal_info (image, full_name, profession, email, phone, location, linkedin, website), experience (array with company, position, start_date, end_date, description, is_current), project (array with name, type, description), education (array with institution, degree, field, graduation_date, gpa):\n${resumeText}`;

    const extracted = await generateText(prompt, { 
      max_new_tokens: 2000, 
      response_format: { type: "json_object" } 
    });

    let parsedData = {};
    try {
      // Try to extract JSON object if the model still wraps it in markdown despite response_format
      const jsonMatch = extracted.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : extracted;
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI JSON:", e, extracted);
      // fallback: just put the text in professional_summary
      parsedData = { professional_summary: extracted };
    }

    let newResume;
    if (mongoose.connection.readyState === 1) {
      try {
        newResume = await Resume.create({ userId, title: title || "Uploaded Resume", ...parsedData });
        if (newResume) {
          const resumeObj = newResume.toObject ? newResume.toObject() : newResume;
          memoryResumes.push(resumeObj);
        }
      } catch (dbErr) {
        console.warn("DB uploadResume error, using memory fallback:", dbErr.message);
      }
    }

    if (!newResume) {
      newResume = {
        _id: "resume_" + Date.now(),
        userId,
        title: title || "Uploaded Resume",
        template: "classic",
        personal_info: parsedData.personal_info || { full_name: "", email: "", phone: "", location: "", profession: "", summary: "", image: "" },
        work_experience: parsedData.experience || [],
        education: parsedData.education || [],
        project: parsedData.project || [],
        skills: parsedData.skills || [],
        public: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryResumes.push(newResume);
    }

    return res.status(200).json({ resumeId: newResume._id });
  } catch (error) {
    console.error("Upload Resume Error:", error);
    return res.status(500).json({ message: error.message });
  }
};