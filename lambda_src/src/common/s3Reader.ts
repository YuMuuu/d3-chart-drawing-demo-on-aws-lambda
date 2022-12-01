import { GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";
import { loadS3Client } from "./s3Client.js";
import winston from "winston";

export const ReadInputFromS3 = async (
  command: GetObjectCommandInput,
  logger: winston.Logger
): Promise<string | undefined> => {
  if (!process.env.ENV) {
    throw new Error("environment variable ENV is not set!");
  } else {
    const s3Client = loadS3Client(process.env.ENV);
    try {
      const response = await s3Client.send(new GetObjectCommand(command));
      if (typeof response.Body == "undefined") {
        logger.info("something wrong");
      } else {
        return await response.Body.transformToString();
      }
    } catch (err) {
      logger.error("Error", err);
    }
  }
};
