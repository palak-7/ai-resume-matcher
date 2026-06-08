import winston from "winston";
import path from "path";
import config from "./config";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  levels: {
    ...winston.config.npm.levels,
    http: 5, // http level add karo morgan ke liye
  },
  level: config.logging.level,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // error stack trace capture karo
    logFormat,
  ),
  transports: [
    // Console — development mein colorful
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "HH:mm:ss" }),
        logFormat,
      ),
      silent: process.env.NODE_ENV === "test", // tests mein logs mute
    }),

    // Error log file — sirf errors
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      silent: process.env.NODE_ENV === "test",
    }),

    // Combined log file — sab kuch
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      silent: process.env.NODE_ENV === "test",
    }),
  ],
});

export default logger;
