import morgan from "morgan";
import logger from "../utils/logger";

// Morgan stream — Winston mein pipe karo
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Test mein morgan skip karo
const skip = () => process.env.NODE_ENV === "test";

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip },
);

export default morganMiddleware;
