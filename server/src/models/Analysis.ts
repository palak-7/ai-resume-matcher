import mongoose, { Document, Schema } from "mongoose";

export interface ISkill {
  skill: string;
  severity?: "high" | "medium" | "low";
}

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescription: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: ISkill[];
  suggestions: string[];
  createdAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    jobDescription: { type: String, required: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    matchedSkills: [{ type: String }],
    missingSkills: [{ skill: String, severity: String }],
    suggestions: [{ type: String }],
  },
  { timestamps: true },
);
// User ki analyses fetch karna
AnalysisSchema.index({ userId: 1, createdAt: -1 });

// Resume ki analyses fetch karna
AnalysisSchema.index({ resumeId: 1 });

// Cache miss ke baad same analysis dhundna
AnalysisSchema.index({ resumeId: 1, userId: 1 });
export default mongoose.model<IAnalysis>("Analysis", AnalysisSchema);
