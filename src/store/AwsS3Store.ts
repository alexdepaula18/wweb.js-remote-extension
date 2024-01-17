import path from "path";
import fs from "fs";
import { Store } from "whatsapp-web.js";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  NoSuchKey,
  NotFound,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export interface AwsS3StoreOptions {
  s3Client: S3Client;
  bucketName?: string;
}

/**
 * AWS S3 remote storage, save user session in AWS S3 Bucket
 */
export class AwsS3Store implements Store {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  public saveProgressUploadCallback: ((progress: any) => void) | undefined;

  /**
   * Constructor
   * @param {object} options - options
   * @param {string} options.s3Client - AWS S3Client instance
   * @param {string} options.bucketName - AWS bucketName, default value is "whatsapp-web-session-files"
   */
  constructor(options: AwsS3StoreOptions) {
    if (!options)
      throw new Error("A valid AWS instance is required for Options.");

    if (!options.s3Client)
      throw new Error("A valid AWS S3 instance is required for Options.");

    this.s3Client = options.s3Client;
    this.bucketName = options.bucketName || "whatsapp-web-session-files";
  }

  /**
   * delete
   * @param options
   */
  async delete(options: { session: string }): Promise<Promise<any> | any> {
    const remoteFileName = `${options.session}.zip`;

    const input = {
      Bucket: this.bucketName,
      Key: remoteFileName,
    };

    const command = new DeleteObjectCommand(input);
    await this.s3Client.send(command);
  }

  /**
   * save
   * @param options
   */
  async save(options: { session: string }): Promise<Promise<any> | any> {
    const localFilePath = path.join(`./`, `${options.session}.zip`);
    const remoteFileName = `${options.session}.zip`;
    const fileContent = fs.readFileSync(localFilePath);

    await this.createBucketWithNotExists(this.bucketName);

    const input = {
      Bucket: this.bucketName,
      Key: remoteFileName,
      Body: fileContent,
    };

    const parallelUpload = new Upload({
      client: this.s3Client,
      queueSize: 5,
      leavePartsOnError: false,
      params: input,
    });

    parallelUpload.on("httpUploadProgress", (progress) => {
      if (this.saveProgressUploadCallback)
        this.saveProgressUploadCallback(progress);
    });

    await parallelUpload.done();
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

    const data = await output.Body?.transformToString();

    if (data) fs.writeFileSync(localFilePath, data);
    else throw new Error("Download failed!");
  }

  /**
   * sessionExists
   * @param options
   * @returns boolean
   */
  async sessionExists(options: { session: string }): Promise<boolean> {
    await this.createBucketWithNotExists(this.bucketName);

    const remoteFileName = `${options.session}.zip`;

    const input = {
      Bucket: this.bucketName,
      Key: remoteFileName,
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
}
