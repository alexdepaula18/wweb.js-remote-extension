import { Store } from "whatsapp-web.js";
import { AwsS3Store } from "./AwsS3Store";
import { Credentials } from "aws-sdk";
import { S3Client } from "@aws-sdk/client-s3";

export enum Provider {
  AwsS3,
}

interface Options {}

export interface AwsS3Options extends Options {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  bucketName?: string;
}

export const build = (provider: Provider, options: object): Store => {
  switch (provider) {
    case Provider.AwsS3: {
      if (!options)
        throw new Error("A valid AWS instance is required for Options.");

      const awsS3Options = options as AwsS3Options;

      const s3Client = new S3Client({
        region: awsS3Options.region || "us-east-1",
        credentials: new Credentials({
          accessKeyId: awsS3Options.accessKeyId,
          secretAccessKey: awsS3Options.secretAccessKey,
        }),
      });

      return new AwsS3Store({
        s3Client: s3Client,
        bucketName: awsS3Options.bucketName,
      });
    }

    default:
      throw new Error(`Provider (${provider}) not found`);
  }
};
