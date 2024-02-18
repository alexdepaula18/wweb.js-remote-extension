import { describe, test } from "@jest/globals";
import { AwsS3Store } from "../../src/store/AwsS3Store";
import {
  CopyObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  NoSuchKey,
  NotFound,
  PutObjectCommand,
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
    beforeEach(() => {
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
      const stream = createReadStream("./sample_file.zip");

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

    it("save existing remote file with success", async () => {
      s3ClientMock.on(HeadObjectCommand).resolves({});
      s3ClientMock.on(DeleteObjectCommand).resolves({});
      s3ClientMock.on(CopyObjectCommand).resolves({});

      const store = new AwsS3Store({ s3Client: s3Client });

      s3ClientMock.on(PutObjectCommand).resolves({});

      await store.save({
        session: "sample_file",
      });

      expect(s3ClientMock).toHaveReceivedCommand(HeadObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(HeadObjectCommand, 1);

      expect(s3ClientMock).toHaveReceivedCommand(DeleteObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(DeleteObjectCommand, 2);

      expect(s3ClientMock).toHaveReceivedCommand(CopyObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(CopyObjectCommand, 1);

      expect(s3ClientMock).toHaveReceivedCommand(PutObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(PutObjectCommand, 1);
    });

    it("save no existing remote file with success", async () => {
      s3ClientMock.on(HeadObjectCommand).callsFake((input) => {
        throw new NotFound({ $metadata: {}, message: "" });
      });

      const store = new AwsS3Store({ s3Client: s3Client });

      s3ClientMock.on(PutObjectCommand).resolves({});

      await store.save({
        session: "sample_file",
      });

      expect(s3ClientMock).toHaveReceivedCommand(HeadObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(HeadObjectCommand, 1);

      expect(s3ClientMock).toHaveReceivedCommandTimes(DeleteObjectCommand, 0);

      expect(s3ClientMock).toHaveReceivedCommandTimes(CopyObjectCommand, 0);

      expect(s3ClientMock).toHaveReceivedCommand(PutObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(PutObjectCommand, 1);
    });
  });

  describe("Bucket executions", () => {
    beforeEach(() => {
      s3ClientMock.reset();
    });

    test("Bucket NotFound", async () => {
      const store = new AwsS3Store({ s3Client: s3Client });

      s3ClientMock.on(HeadBucketCommand).callsFake((input) => {
        throw new NotFound({ $metadata: {}, message: "" });
      });
      s3ClientMock.on(CreateBucketCommand).resolves({});

      s3ClientMock.on(DeleteObjectCommand).resolves({});

      await store.delete({ session: "RemoteAuth-xyz" });

      expect(s3ClientMock).toHaveReceivedCommand(HeadBucketCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(HeadBucketCommand, 1);

      expect(s3ClientMock).toHaveReceivedCommand(CreateBucketCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(CreateBucketCommand, 1);

      expect(s3ClientMock).toHaveReceivedCommand(DeleteObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(DeleteObjectCommand, 1);
    });

    test("Bucket NoSuchKey", async () => {
      const store = new AwsS3Store({ s3Client: s3Client });

      s3ClientMock.on(HeadBucketCommand).callsFake((input) => {
        throw new NoSuchKey({ $metadata: {}, message: "" });
      });
      s3ClientMock.on(CreateBucketCommand).resolves({});

      s3ClientMock.on(DeleteObjectCommand).resolves({});

      await store.delete({ session: "RemoteAuth-xyz" });

      expect(s3ClientMock).toHaveReceivedCommand(HeadBucketCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(HeadBucketCommand, 1);

      expect(s3ClientMock).toHaveReceivedCommand(CreateBucketCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(CreateBucketCommand, 1);

      expect(s3ClientMock).toHaveReceivedCommand(DeleteObjectCommand);
      expect(s3ClientMock).toHaveReceivedCommandTimes(DeleteObjectCommand, 1);
    });
  });
});
