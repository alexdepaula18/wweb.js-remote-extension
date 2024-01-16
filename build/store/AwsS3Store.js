"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsS3Store = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * AWS S3 remote storage, save user session in AWS S3 Bucket
 */
class AwsS3Store {
    /**
     * Constructor
     * @param {object} options - options
     * @param {string} options.accessKeyId - AWS accessKeyId, Ex.: AKIA...
     * @param {string} options.secretAccessKey - AWS secretAccessKey, Ex.: ReCmBEs...
     * @param {string} options.region - AWS region, Ex.: 'us-east-1', 'us-east-2', ...
     * @param {string} options.bucketName - AWS bucketName, default valeu is "whatsapp-web-session-files"
     */
    constructor(options) {
        if (!options)
            throw new Error("A valid AWS instance is required for Options.");
        if (!options.s3)
            throw new Error("A valid AWS S3 instance is required for Options.");
        this.s3 = options.s3;
        this.bucketName = options.bucketName || "whatsapp-web-session-files";
    }
    /**
     * delete
     * @param options
     */
    delete(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const remoteFileName = `${options.session}.zip`;
            const params = {
                Bucket: this.bucketName,
                Key: remoteFileName,
            };
            yield new Promise((resolve, reject) => {
                this.s3.deleteObject(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        });
    }
    /**
     * save
     * @param options
     */
    save(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const localFilePath = path_1.default.join(`./`, `${options.session}.zip`);
            const remoteFileName = `${options.session}.zip`;
            const fileContent = fs_1.default.readFileSync(localFilePath);
            yield this.createBucketWithNotExists(this.bucketName);
            const params = {
                Bucket: this.bucketName,
                Key: remoteFileName,
                Body: fileContent,
            };
            yield new Promise((resolve, reject) => {
                this.s3.upload(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        });
    }
    /**
     * extract
     * @param options
     */
    extract(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const remoteFileName = `${options.session}.zip`;
            const params = {
                Bucket: this.bucketName,
                Key: remoteFileName,
            };
            yield new Promise((resolve, reject) => {
                this.s3.getObject(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const localFilePath = path_1.default.join(`./`, options.path);
                        fs_1.default.writeFileSync(localFilePath, data.Body.toString());
                        resolve(true);
                    }
                });
            });
        });
    }
    /**
     * sessionExists
     * @param options
     * @returns boolean
     */
    sessionExists(options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createBucketWithNotExists(this.bucketName);
            const remoteFileName = `${options.session}.zip`;
            const params = {
                Bucket: this.bucketName,
                Key: remoteFileName,
            };
            return yield new Promise((resolve, reject) => {
                this.s3.headObject(params, (err, data) => {
                    if (err) {
                        if (err.code === "NotFound") {
                            resolve(false);
                        }
                        else {
                            reject(err);
                        }
                    }
                    else {
                        resolve(true);
                    }
                });
            });
        });
    }
    createBucketWithNotExists(bucketName) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileExists = yield new Promise((resolve, reject) => {
                this.s3.headBucket({ Bucket: bucketName }, (err, data) => {
                    if (err) {
                        if (err.code === "NotFound") {
                            resolve(false);
                        }
                        else {
                            reject(err);
                        }
                    }
                    else {
                        resolve(true);
                    }
                });
            });
            if (!fileExists) {
                yield new Promise((resolve, reject) => {
                    this.s3.createBucket({ Bucket: this.bucketName }, (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(data);
                        }
                    });
                });
            }
        });
    }
}
exports.AwsS3Store = AwsS3Store;
