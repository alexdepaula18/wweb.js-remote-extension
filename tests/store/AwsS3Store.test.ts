import { describe, expect, test, jest } from "@jest/globals";
import { AwsS3Store } from "../../src/store/AwsS3Store";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import fs from "fs";

const s3Client = new S3Client({});

const s3ClientMock = mockClient(s3Client);

describe("AwsS3Store functions", () => {
  describe("Success executions", () => {
    beforeAll(() => {
      s3ClientMock.reset();

      s3ClientMock.on(HeadBucketCommand).resolves({});
      s3ClientMock.on(CreateBucketCommand).resolves({});
    });

    test("delete with success", async () => {
      const store = new AwsS3Store({ s3Client: s3Client });

      s3ClientMock.on(DeleteObjectCommand).resolves({});

      await store.delete({ session: "RemoteAuth-xyz" });

      expect(s3ClientMock.commandCalls(DeleteObjectCommand));
    });

    test("sessionExists with success", async () => {
      const store = new AwsS3Store({ s3Client: s3Client });

      s3ClientMock.on(HeadObjectCommand).resolves({});

      await store.sessionExists({ session: "RemoteAuth-xyz" });

      expect(s3ClientMock.commandCalls(HeadObjectCommand));
    });
  });
});
