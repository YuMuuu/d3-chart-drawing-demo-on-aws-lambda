import { S3Event } from "aws-lambda";

export class PutS3Item {
  Bucket: string;
  Key: string;
  constructor(Bucket: string, Key: string) {
    this.Bucket = Bucket;
    this.Key = Key;
  }
}

export function parseS3ItemsFromEvent(event: S3Event): PutS3Item[] {
  const eventRecords = event.Records;
  return eventRecords.map((_event) => {
    return new PutS3Item(_event.s3.bucket.name, _event.s3.object.key);
  });
}
