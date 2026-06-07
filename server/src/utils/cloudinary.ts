import { v2 as cloudinary } from "cloudinary";
import logger from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PDF upload karo
export const uploadPDFToCloudinary = async (
  buffer: Buffer,
  originalName: string,
  userId: string,
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const fileName = `${userId}_${Date.now()}_${originalName.replace(/\s+/g, "_")}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // PDF ke liye raw type
        folder: "ai-resume-matcher/resumes",
        public_id: fileName,
        format: "pdf",
        tags: [userId, "resume"],
      },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          logger.info(`PDF uploaded to Cloudinary: ${result!.public_id}`);
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        }
      },
    );

    uploadStream.end(buffer);
  });
};

// PDF delete karo
export const deletePDFFromCloudinary = async (
  publicId: string,
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    logger.info(`PDF deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error("Cloudinary delete error:", error);
  }
};

export default cloudinary;
