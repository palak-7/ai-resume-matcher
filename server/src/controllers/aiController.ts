import { Request, Response } from "express";
import Groq from "groq-sdk";
import Resume from "../models/Resume";

const callGroq = async (
  systemPrompt: string,
  userPrompt: string,
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content?.trim() || "";
};

// POST /api/ai/rewrite-bullet
export const rewriteBullet = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bulletPoint, jobDescription } = req.body;
    if (!bulletPoint) {
      res.status(400).json({ message: "bulletPoint is required" });
      return;
    }

    const response = await callGroq(
      "You are an expert resume writer. Always respond with valid JSON only — no markdown, no backticks.",
      `Rewrite this resume bullet point in 3 stronger versions using action verbs and quantified impact.
${jobDescription ? `Target job: ${jobDescription.substring(0, 300)}` : ""}

Original bullet: "${bulletPoint}"

Return ONLY this JSON:
{
  "rewrites": [
    "Stronger version 1 with action verb and impact",
    "Stronger version 2 with different angle",
    "Stronger version 3 with metrics if possible"
  ]
}`,
    );

    const cleaned = response
      .replace(/\`\`\`json/g, "")
      .replace(/\`\`\`/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ message: "Error rewriting bullet point" });
  }
};

// POST /api/ai/interview-questions
export const generateInterviewQuestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { jobDescription, missingSkills } = req.body;
    if (!jobDescription) {
      res.status(400).json({ message: "jobDescription is required" });
      return;
    }

    const response = await callGroq(
      "You are an expert technical interviewer. Always respond with valid JSON only — no markdown, no backticks.",
      `Generate 8 likely interview questions for this job, focusing on the skill gaps.

Job Description: ${jobDescription.substring(0, 500)}
Skill gaps: ${missingSkills?.map((s: any) => s.skill).join(", ") || "none provided"}

Return ONLY this JSON:
{
  "questions": [
    {
      "question": "Interview question here?",
      "type": "technical" | "behavioral" | "situational",
      "tip": "One line tip on how to answer"
    }
  ]
}`,
    );

    const cleaned = response
      .replace(/\`\`\`json/g, "")
      .replace(/\`\`\`/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ message: "Error generating questions" });
  }
};

// POST /api/ai/cover-letter
export const generateCoverLetter = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { resumeId, jobDescription, userName } = req.body;

    if (!resumeId || !jobDescription) {
      res
        .status(400)
        .json({ message: "resumeId and jobDescription are required" });
      return;
    }

    // Resume DB se fetch karo
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      res.status(404).json({ message: "Resume not found" });
      return;
    }

    const response = await callGroq(
      "You are an expert cover letter writer. Write professional, concise cover letters.",
      `Write a professional cover letter.

Candidate name: ${userName || "the candidate"}
Resume (excerpt): ${resume.extractedText.substring(0, 1000)}
Job Description: ${jobDescription.substring(0, 500)}

Write a 3 paragraph cover letter — opening, skills match, closing with call to action.
Return ONLY the cover letter text.`,
    );

    res.status(200).json({ coverLetter: response });
  } catch (error) {
    res.status(500).json({ message: "Error generating cover letter" });
  }
};
