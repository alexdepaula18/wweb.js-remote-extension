"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteAuthExt = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
class RemoteAuthExt extends whatsapp_web_js_1.RemoteAuth {
    constructor({ clientId, dataPath, store, backupSyncIntervalMs } = {}) {
        const options = { clientId, dataPath, store, backupSyncIntervalMs };
        super(options);
    }
}
exports.RemoteAuthExt = RemoteAuthExt;
