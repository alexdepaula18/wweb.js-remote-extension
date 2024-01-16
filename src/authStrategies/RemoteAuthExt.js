import { RemoteAuth } from "whatsapp-web.js";

export class RemoteAuthExt extends RemoteAuth {
  constructor({
    clientId,
    dataPath,
    store,
    backupSyncIntervalMs
  } = {}) {
    const options = { clientId, dataPath, store, backupSyncIntervalMs };
    super(options);
  }
}
