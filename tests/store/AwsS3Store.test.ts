import { describe, test } from "@jest/globals";
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
import "aws-sdk-client-mock-jest";
import { createReadStream } from "fs";
import { sdkStreamMixin } from "@smithy/util-stream";

const s3Client = new S3Client({});

const s3ClientMock = mockClient(s3Client);

describe("AwsS3Store creation", () => {
  test("AwsS3Store instanced with success", () => {
    const store = new AwsS3Store({ s3Client: s3Client });
    expect(!store);
  });
});

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

      expect(s3ClientMock).toHaveReceivedCommand(DeleteObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(DeleteObjectCommand, 1);
    });

    test("sessionExists with success", async () => {
      const store = new AwsS3Store({ s3Client: s3Client });

      s3ClientMock.on(HeadObjectCommand).resolves({});

      await store.sessionExists({ session: "RemoteAuth-xyz" });

      expect(s3ClientMock).toHaveReceivedCommand(HeadObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(HeadObjectCommand, 1);
    });

    it("extract with success", async () => {
      const store = new AwsS3Store({ s3Client: s3Client });

      // create Stream from file
      const stream = createReadStream("./tests/sample_file.zip");

      // wrap the Stream with SDK mixin
      const sdkStream = sdkStreamMixin(stream);

      s3ClientMock.on(GetObjectCommand).resolves({ Body: sdkStream });

      await store.extract({
        session: "RemoteAuth-xyz",
        path: "RemoteAuth-xyz.zip",
      });

      expect(s3ClientMock).toHaveReceivedCommand(GetObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(GetObjectCommand, 1);
    });
  });
});
