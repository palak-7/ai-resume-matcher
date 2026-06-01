import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});
app.use("/api/auth", authRoutes);
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGODB_URI || "")
    .then(() => {
      console.log("MongoDB connected");
      app.listen(process.env.PORT || 5000, () =>
        console.log(`Server running on port ${process.env.PORT || 5000}`),
      );
    })
    .catch((err) => console.error("MongoDB connection error:", err));
}

export default app;
