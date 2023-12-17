import { Context, S3Event } from "aws-lambda";
import { parseS3ItemsFromEvent } from "./parseS3Event.js";
import { createLogger } from "./common/log.js";
import { DrawDonutsService } from "./DrawDonutsService.js";

export const main = async (event: S3Event, context: Context) => {
  const logger = createLogger("d3-chart-drawing-demo-on-aws-lambda");

  logger.info(
    "lambdaの実行を開始します。execution context:" + JSON.stringify(context)
  );

  const S3Items = parseS3ItemsFromEvent(event);
  if (S3Items.length === 0) {
    logger.info("S3 event contains no S3 items.");
  } else {
    for (const item of S3Items) {
      const drawDonutsService = new DrawDonutsService(logger);
      await drawDonutsService.run(item);
    }
  }
};
