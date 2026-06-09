import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpiry: Date | null;
  // ── Account lockout
  failedLoginAttempts: number;
  lockUntil: Date | null;
  lastVerificationEmailSentAt: Date | null;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    // ── Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    // ── Password reset
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastVerificationEmailSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
// Existing indexes
UserSchema.index({ email: 1 }, { unique: true }); // already unique hai but explicit karo

// New indexes
UserSchema.index({ verificationToken: 1 }, { sparse: true }); // sparse — null values skip
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });
UserSchema.index({ createdAt: -1 }); // newest users first queries ke liye
export default mongoose.model<IUser>("User", UserSchema);
