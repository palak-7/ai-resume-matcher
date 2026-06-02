import Groq from "groq-sdk";

const GROQ_TIMEOUT_MS = 30000;

export interface AnalysisResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: { skill: string; severity: "high" | "medium" | "low" }[];
  suggestions: string[];
}

export const analyseResumeVsJD = async (
  resumeText: string,
  jobDescription: string,
  requestId = "no-request-id",
): Promise<AnalysisResult> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new Groq({ apiKey, timeout: GROQ_TIMEOUT_MS });
  console.log(`[${requestId}] Groq request started using model llama-3.1-8b-instant`);

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are an expert ATS and career coach. Always respond with valid JSON only — no markdown, no backticks, no explanation.",
      },
      {
        role: "user",
        content: `Analyse this resume against the job description.

RESUME:
${resumeText.substring(0, 2000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 1000)}

Return ONLY this JSON structure:
{
  "matchScore": <number 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": [
    { "skill": "skill name", "severity": "high" | "medium" | "low" }
  ],
  "suggestions": ["tip1", "tip2", "tip3"]
}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });
  console.log(`[${requestId}] Groq response received`);

  const responseText = completion.choices[0]?.message?.content?.trim() || "";
  const cleaned = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const result = JSON.parse(cleaned) as AnalysisResult;
  console.log(`[${requestId}] Groq response parsed successfully`);

  return result;
};
