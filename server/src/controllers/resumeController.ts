import { Request, Response } from "express";
import Resume from "../models/Resume";
import Analysis from "../models/Analysis";
import { analyseResumeVsJD } from "../services/geminiService";
import { PdfReader } from "pdfreader";
import logger from "../utils/logger";
import { deleteCache, getCache, setCache } from "../utils/cache";
import {
  deletePDFFromCloudinary,
  uploadPDFToCloudinary,
} from "../utils/cloudinary";

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

    // Cloudinary pe upload karo
    let fileUrl = null;
    let cloudinaryPublicId = null;

    if (process.env.NODE_ENV !== "test") {
      try {
        const cloudinaryResult = await uploadPDFToCloudinary(
          req.file.buffer,
          req.file.originalname,
          (req as any).userId,
        );
        fileUrl = cloudinaryResult.url;
        cloudinaryPublicId = cloudinaryResult.publicId;
      } catch (uploadError) {
        logger.warn(
          "Cloudinary upload failed, continuing without cloud storage:",
          uploadError,
        );
      }
    }

    const resume = await Resume.create({
      userId: (req as any).userId,
      originalName: req.file.originalname,
      extractedText: extractedText.trim(),
    });
    await deleteCache(`resumes:${(req as any).userId}`);
    logger.info(
      `Resume uploaded: ${req.file?.originalname} by user ${(req as any).userId}`,
    );

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileUrl: resume.fileUrl,
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
    const userId = (req as any).userId;

    const jdHash = Buffer.from(jobDescription.trim())
      .toString("base64")
      .slice(0, 20);
    const cacheKey = `analysis:${resumeId}:${jdHash}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.status(200).json({ analysis: cached, fromCache: true });
      return;
    }

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
    logger.info(`[${requestId}] Looking up resume ${resumeId}`);
    // Fetch resume — make sure it belongs to this user
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: (req as any).userId,
    }).maxTimeMS(10000);

    if (!resume) {
      logger.error(`[${requestId}] Resume not found`);
      res.status(404).json({ message: "Resume not found" });
      return;
    }

    // Call GROQ API
    logger.info(`[${requestId}] Resume found; starting Groq analysis`);
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
    const responseData = {
      id: analysis._id,
      matchScore: analysis.matchScore,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      suggestions: analysis.suggestions,
      createdAt: analysis.createdAt,
    };
    await setCache(cacheKey, responseData, 3600);

    // Analyses list cache invalidate karo
    await deleteCache(`analyses:${userId}`);
    res.status(200).json({ analysis: responseData });
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

// Resume delete karo — Cloudinary se bhi
export const deleteResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      res.status(404).json({ message: "Resume not found" });
      return;
    }

    // Cloudinary se delete karo
    if (resume.cloudinaryPublicId) {
      await deletePDFFromCloudinary(resume.cloudinaryPublicId);
    }

    // DB se delete karo
    await Resume.deleteOne({ _id: id });

    // Cache invalidate
    await deleteCache(`resumes:${userId}`);

    logger.info(`Resume deleted: ${id} by user ${userId}`);
    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    logger.error("Delete resume error:", error);
    res.status(500).json({ message: "Error deleting resume" });
  }
};

// GET /api/resume/my-resumes
export const getMyResumes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const cacheKey = `resumes:${userId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.status(200).json({ resumes: cached, fromCache: true });
      return;
    }

    const resumes = await Resume.find({ userId: (req as any).userId })
      .select("-extractedText") // don't send full text in list
      .sort({ createdAt: -1 });

    // Cache mein save karo — 5 min
    await setCache(cacheKey, resumes, 300);

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
    const userId = (req as any).userId;
    const cacheKey = `analyses:${userId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      res.status(200).json({ analyses: cached, fromCache: true });
      return;
    }

    const analyses = await Analysis.find({ userId: (req as any).userId })
      .sort({ createdAt: -1 })
      .limit(20);
    await setCache(cacheKey, analyses, 300);
    res.status(200).json({ analyses });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analyses" });
  }
};

// POST /api/resume/public-analyse — no auth required, limited result
export const publicAnalyse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (
      !resumeText ||
      typeof resumeText !== "string" ||
      resumeText.trim().length < 50
    ) {
      res
        .status(400)
        .json({ message: "Resume text must be at least 50 characters" });
      return;
    }

    if (
      !jobDescription ||
      typeof jobDescription !== "string" ||
      jobDescription.trim().length < 50
    ) {
      res
        .status(400)
        .json({ message: "Job description must be at least 50 characters" });
      return;
    }

    // Public rate limit — 3 requests per hour per IP
    const analysisResult = await analyseResumeVsJD(
      resumeText.trim().substring(0, 2000),
      jobDescription.trim().substring(0, 1000),
    );

    // Limited result — suggestions aur interview questions hide karo
    res.status(200).json({
      matchScore: analysisResult.matchScore,
      matchedSkills: analysisResult.matchedSkills,
      missingSkills: analysisResult.missingSkills,
      // Suggestions locked — sirf count batao
      suggestionsCount: analysisResult.suggestions.length,
      isLimited: true,
    });
  } catch (error) {
    logger.error("Public analyse error:", error);
    res.status(500).json({ message: "Analysis failed — try again" });
  }
};
