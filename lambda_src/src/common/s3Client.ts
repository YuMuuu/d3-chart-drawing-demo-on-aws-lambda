import { S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";

export const loadS3Client = (env: string): S3Client => {
  if (env === "local") {
    return new S3Client({
      credentials: fromIni({ profile: "local" }),
      region: "ap-northeast-1",
    });
  } else {
    return new S3Client({ region: "ap-northeast-1" });
  }
};
