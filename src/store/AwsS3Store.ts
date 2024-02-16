import path from "path";
import fs from "fs";
import { Store } from "whatsapp-web.js";
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
import { Readable } from "stream";

export interface AwsS3StoreOptions {
  s3Client: S3Client;
  bucketName?: string;
  enableDebugLog?: boolean;
}

/**
 * AWS S3 remote storage, save user session in AWS S3 Bucket
 */
export class AwsS3Store implements Store {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly enableDebugLog: boolean;

  public saveProgressUploadCallback: ((progress: any) => void) | undefined;

  /**
   * Constructor
   * @param {object} options - options
   * @param {string} options.s3Client - AWS S3Client instance
   * @param {string} options.bucketName - AWS bucketName, default value is "whatsapp-web-session-files"
   * @param {string} options.enableDebugLog - enableDebugLog, default value is false
   */
  constructor(options: AwsS3StoreOptions) {
    if (!options)
      throw new Error("A valid AWS instance is required for Options.");

    if (!options.s3Client)
      throw new Error("A valid AWS S3 instance is required for Options.");

    this.s3Client = options.s3Client;
    this.bucketName = options.bucketName || "whatsapp-web-session-files";
    this.enableDebugLog = options.enableDebugLog || false;
  }

  /**
   * delete
   * @param options
   */
  async delete(options: { session: string }): Promise<Promise<any> | any> {
    const remoteFileName = `${options.session}.zip`;

    await this.deleteRemoteFile({
      bucket: this.bucketName,
      filename: remoteFileName,
    });
  }

  /**
   * save
   * @param options
   */
  async save(options: { session: string }): Promise<Promise<any> | any> {
    const localFilePath = path.join(`./`, `${options.session}.zip`);

    await this.createBucketWithNotExists(this.bucketName);

    const actualRemoteFileName = `${options.session}.zip`;

    const actualExists = await this.existsRemoteFile({
      bucket: this.bucketName,
      filename: actualRemoteFileName,
    });

    const fileContent = fs.readFileSync(localFilePath);

    if (actualExists == true) {
      const newRemoteFileName = `${options.session}_new.zip`;

      await this.createRemoteFile({
        bucket: this.bucketName,
        filename: newRemoteFileName,
        fileContent: fileContent,
      });

      await this.deleteRemoteFile({
        bucket: this.bucketName,
        filename: actualRemoteFileName,
      });

      await this.copyRemoteFile({
        bucket: this.bucketName,
        originFilename: newRemoteFileName,
        destinationFilename: actualRemoteFileName,
      });
    } else {
      await this.createRemoteFile({
        bucket: this.bucketName,
        filename: actualRemoteFileName,
        fileContent: fileContent,
      });
    }
  }

  /**
   * extract
   * @param options
   */
  async extract(options: {
    session: string;
    path: string;
  }): Promise<Promise<any> | any> {
    const remoteFileName = `${options.session}.zip`;
    const localFilePath = path.join(`./`, options.path);

    const input = {
      Bucket: this.bucketName,
      Key: remoteFileName,
    };

    const command = new GetObjectCommand(input);
    const output = await this.s3Client.send(command);

    const fileStream = fs.createWriteStream(localFilePath);

    const readableStream: Readable = output.Body as Readable;

    await new Promise((resolve, reject) => {
      readableStream.pipe(fileStream).on("error", reject).on("finish", resolve);
    });
  }

  /**
   * sessionExists
   * @param options
   * @returns boolean
   */
  async sessionExists(options: { session: string }): Promise<boolean> {
    await this.createBucketWithNotExists(this.bucketName);

    const remoteFileName = `${options.session}.zip`;

    return await this.existsRemoteFile({
      bucket: this.bucketName,
      filename: remoteFileName,
    });
  }

  private async bucketExists(bucketName: string): Promise<boolean> {
    const input = {
      Bucket: bucketName,
    };

    const command = new HeadBucketCommand(input);

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error instanceof NotFound || error instanceof NoSuchKey) {
        return false;
      } else {
        throw error;
      }
    }
  }

  private async createBucketWithNotExists(bucketName: string): Promise<void> {
    const bucketExists = await this.bucketExists(bucketName);

    if (!bucketExists) {
      const input = {
        Bucket: bucketName,
      };

      const command = new CreateBucketCommand(input);
      await this.s3Client.send(command);
    }
  }

  private async createRemoteFile(options: {
    bucket: string;
    filename: string;
    fileContent: Buffer;
  }): Promise<void> {
    const input = {
      Bucket: options.bucket,
      Key: options.filename,
      Body: options.fileContent,
    };

    const command = new PutObjectCommand(input);
    await this.s3Client.send(command);
  }

  private async deleteRemoteFile(options: {
    bucket: string;
    filename: string;
  }): Promise<void> {
    const input = {
      Bucket: options.bucket,
      Key: options.filename,
    };

    const command = new DeleteObjectCommand(input);
    await this.s3Client.send(command);
  }

  private async existsRemoteFile(options: {
    bucket: string;
    filename: string;
  }): Promise<boolean> {
    const input = {
      Bucket: options.bucket,
      Key: options.filename,
    };

    const command = new HeadObjectCommand(input);

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error instanceof NotFound || error instanceof NoSuchKey) {
        return false;
      } else {
        throw error;
      }
    }
  }

  private async copyRemoteFile(options: {
    bucket: string;
    originFilename: string;
    destinationFilename: string;
  }): Promise<void> {
    const input = {
      Bucket: options.bucket,
      CopySource: options.originFilename,
      Key: options.destinationFilename,
    };

    const command = new CopyObjectCommand(input);
    await this.s3Client.send(command);
  }

  private consoleLog(message: string, params: object[]) {
    if (this.enableDebugLog) {
      console.debug(message, params);
    }
  }
}
