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

export default mongoose.model<IAnalysis>("Analysis", AnalysisSchema);
