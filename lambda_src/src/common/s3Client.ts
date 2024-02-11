import { S3Client } from "@aws-sdk/client-s3";

export const loadS3Client = (env: string): S3Client => {
  if (env === "local" || env === "test") {
    return new S3Client({
      region: "ap-northeast-1",
      endpoint: "http://localstack:4566",
      forcePathStyle: true,
    });
  } else {
    return new S3Client({ region: "ap-northeast-1" });
  }
};
