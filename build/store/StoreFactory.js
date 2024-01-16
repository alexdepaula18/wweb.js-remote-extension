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
exports.build = exports.Provider = void 0;
const AwsS3Store_1 = require("./AwsS3Store");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
var Provider;
(function (Provider) {
    Provider[Provider["AwsS3"] = 0] = "AwsS3";
})(Provider || (exports.Provider = Provider = {}));
const build = (provider, options) => __awaiter(void 0, void 0, void 0, function* () {
    switch (provider) {
        case Provider.AwsS3: {
            if (!options)
                throw new Error("A valid AWS instance is required for Options.");
            const awsS3Options = options;
            aws_sdk_1.default.config.update({
                accessKeyId: awsS3Options.accessKeyId,
                secretAccessKey: awsS3Options.secretAccessKey,
                region: awsS3Options.region || "us-east-1",
            });
            const s3 = new aws_sdk_1.default.S3();
            return new AwsS3Store_1.AwsS3Store({
                s3: s3,
                bucketName: awsS3Options.bucketName,
            });
        }
        default:
            throw new Error(`Provider (${provider}) not found`);
    }
});
exports.build = build;
