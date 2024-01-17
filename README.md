[![npm](https://img.shields.io/npm/v/wweb.js-remote-extension.svg)](https://www.npmjs.com/package/wweb.js-remote-extension) [![codecov](https://codecov.io/gh/alexdepaula18/wweb.js-remote-extension/graph/badge.svg?token=GUFBA3EVKS)](https://codecov.io/gh/alexdepaula18/wweb.js-remote-extension)

# wweb.js-remote-extension

# Instalation

Using NPM
```shell
npm install wweb.js-remote-extension
```

Using YARN
```shell
yarn add wweb.js-remote-extension
```

# How to use 

```typescript
import { Provider, build } from "wweb.js-remote-extension";

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
