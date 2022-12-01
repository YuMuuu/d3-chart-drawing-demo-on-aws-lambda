import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { loadS3Client } from "./s3Client.js";

export async function WriteFileToS3(
  command: PutObjectCommandInput
): Promise<PutObjectCommandOutput | undefined> {
  if (!process.env.ENV) {
    throw new Error("environment variable ENV is not set!");
  } else {
    const s3Client = loadS3Client(process.env.ENV);
    try {
      const data = await s3Client.send(new PutObjectCommand(command));
      console.log("Success", data);
      return data;
    } catch (err) {
      console.error("Error", err);
    }
  }
}
