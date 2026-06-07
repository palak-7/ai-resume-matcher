import mongoose, { Document, Schema } from "mongoose";

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  originalName: string;
  extractedText: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
// User ke saare resumes fetch karna — most common query
ResumeSchema.index({ userId: 1, createdAt: -1 });

// Single resume fetch by id + userId — security check ke saath
ResumeSchema.index({ _id: 1, userId: 1 });
export default mongoose.model<IResume>("Resume", ResumeSchema);
