import mongoose from "mongoose";
import logger from "./logger";

// Query explain plan — development mein use karo performance check ke liye
export const explainQuery = async (
  model: mongoose.Model<any>,
  query: Record<string, any>,
): Promise<void> => {
  if (process.env.NODE_ENV !== "development") return;

  try {
    const explanation = (await model
      .find(query)
      .explain("executionStats")) as any;
    const stats = explanation.executionStats;

    logger.debug(`Query explain for ${model.modelName}:`);
    logger.debug(`  Documents examined: ${stats.totalDocsExamined}`);
    logger.debug(`  Documents returned: ${stats.totalDocsReturned}`);
    logger.debug(`  Execution time: ${stats.executionTimeMillis}ms`);
    logger.debug(
      `  Index used: ${stats.totalDocsExamined === stats.totalDocsReturned ? "YES ✓" : "NO — collection scan"}`,
    );
  } catch (error) {
    logger.error("Explain query error:", error);
  }
};
