import { Request, Response } from "express";
import Resume from "../models/Resume";
import Analysis from "../models/Analysis";
import { analyseResumeVsJD } from "../services/geminiService";
import { PdfReader } from "pdfreader";
import logger from "../utils/logger";

const extractTextFromPDF = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const textItems: string[] = [];
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        // null item = end of file
        resolve(textItems.join(" "));
      } else if (item.text) {
        textItems.push(item.text);
      }
    });
  });
};

// POST /api/resume/upload
export const uploadResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const extractedText = await extractTextFromPDF(req.file.buffer);

    if (!extractedText || extractedText.trim().length < 50) {
      res.status(400).json({
        message:
          "Could not extract text from PDF. Make sure it is not a scanned image.",
      });
      return;
    }

    const resume = await Resume.create({
      userId: (req as any).userId,
      originalName: req.file.originalname,
      extractedText: extractedText.trim(),
    });
    logger.info(
      `Resume uploaded: ${req.file?.originalname} by user ${(req as any).userId}`,
    );

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        textLength: extractedText.trim().length,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading resume" });
  }
};

// POST /api/resume/analyse
export const analyseResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = res.locals.requestId || "no-request-id";

  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      logger.error(
        `[${requestId}] Analyse rejected: required fields are missing`,
      );
      res
        .status(400)
        .json({ message: "resumeId and jobDescription are required" });
      return;
    }

    if (jobDescription.length < 50) {
      logger.error(
        `[${requestId}] Analyse rejected: job description is too short`,
      );
      res.status(400).json({ message: "Job description is too short" });
      return;
    }

    // Fetch resume — make sure it belongs to this user
    console.log(`[${requestId}] Looking up resume ${resumeId}`);
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: (req as any).userId,
    }).maxTimeMS(10000);

    if (!resume) {
      console.warn(`[${requestId}] Resume not found`);
      res.status(404).json({ message: "Resume not found" });
      return;
    }

    // Call Gemini API
    console.log(`[${requestId}] Resume found; starting Groq analysis`);
    const analysisResult = await analyseResumeVsJD(
      resume.extractedText,
      jobDescription,
      requestId,
    );

    // Save analysis to MongoDB
    console.log(`[${requestId}] Saving analysis to MongoDB`);
    const analysis = await Analysis.create({
      userId: (req as any).userId,
      resumeId: resume._id,
      jobDescription,
      ...analysisResult,
    });
    console.log(`[${requestId}] Analysis saved as ${analysis._id}`);

    res.status(200).json({
      message: "Analysis complete",
      analysis: {
        id: analysis._id,
        matchScore: analysis.matchScore,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        suggestions: analysis.suggestions,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error) {
    console.error(`[${requestId}] Analysis error:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown analysis error";
    const status = errorMessage.includes("timed out") ? 504 : 502;

    res.status(status).json({
      message: "Error analysing resume",
      error: errorMessage,
    });
  }
};

// GET /api/resume/my-resumes
export const getMyResumes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const resumes = await Resume.find({ userId: (req as any).userId })
      .select("-extractedText") // don't send full text in list
      .sort({ createdAt: -1 });

    res.status(200).json({ resumes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching resumes" });
  }
};

// GET /api/resume/analyses
export const getMyAnalyses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const analyses = await Analysis.find({ userId: (req as any).userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ analyses });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analyses" });
  }
};
