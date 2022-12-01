import { Context, S3Event } from "aws-lambda";
import { DrawDonutsChart } from "./drawChart.js";
import { parseS3ItemsFromEvent } from "./parseS3Event.js";
import { createLogger } from "./common/log.js";

export const main = async (event: S3Event, context: Context) => {
  const ENV = process.env["ENV"] || "local";
  const OUT_DIR = process.env["OUT_DIR_LOCAL"] || "/tmp";
  const logger = createLogger("d3-chart-drawing-demo-on-aws-lambda");

  const S3Items = parseS3ItemsFromEvent(event);
  if (S3Items.length === 0) {
    logger.info("S3 event contains no S3 items.");
  } else {
    for (const item of S3Items) {
      const donutsChart = new DrawDonutsChart(ENV, OUT_DIR, logger, item);
      await donutsChart.build();
    }
  }
};
