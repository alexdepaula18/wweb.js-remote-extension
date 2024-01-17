[![npm](https://img.shields.io/npm/v/wwebjs-store.svg)](https://www.npmjs.com/package/wwebjs-store) [![codecov](https://codecov.io/gh/alexdepaula18/wwebjs-store/graph/badge.svg?token=GUFBA3EVKS)](https://codecov.io/gh/alexdepaula18/wwebjs-store)

# wwebjs-store

## Quick Links

* [Whatsapp-web JS](https://wwebjs.dev/guide/authentication.html)
* [GitHub](https://github.com/arbisyarifudin/wwebjs-aws-s3)
* [npm](https://www.npmjs.com/package/wwebjs-store)

# Instalation

Using NPM
```shell
npm install wwebjs-store
```

Using YARN
```shell
yarn add wwebjs-store
```

# How to use 

```typescript
import { Provider, build } from "wwebjs-store";

const awsS3Options = {
    accessKeyId: "JDHTTASGGG6T...", // required - AWS Access Key
    secretAccessKey: "59NyYYNAkN5jKt4J...", // required - AWS Secret Access Key
    region: "us-east-2", // optional - default is "us-east-1"
    bucketName: "my-bucket", // optional - default is "whatsapp-web-session-files"
};

const store = build(Provider.AwsS3, awsS3Options);

const client = new Client({
    authStrategy: new RemoteAuth({
      store: store, // <--- Use store here
      backupSyncIntervalMs: 300000,
    }),
});
```
