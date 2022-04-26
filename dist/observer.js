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
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@polkadot/api");
const lodash_1 = require("lodash");
// For observing chain state
class Observer {
    constructor(websocket) {
        this.wsProvider = new api_1.WsProvider(websocket);
    }
    getAPIClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (lodash_1.default.isNil(this.api)) {
                this.api = yield api_1.ApiPromise.create({ provider: this.wsProvider });
            }
            return this.api;
        });
    }
    getAutomationTimeLastTimeSlot() {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['lastTimeSlot']();
            return resultCodec.toJSON();
        });
    }
    getAutomationTimeMissedQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['missedQueue']();
            return resultCodec.toJSON();
        });
    }
    getAutomationTimeTaskQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['taskQueue']();
            return resultCodec.toJSON();
        });
    }
    getAutomationTimeScheduledTasks(inputTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['scheduledTasks'](inputTime);
            return resultCodec.toJSON();
        });
    }
    getAutomationTimeTasks(taskID) {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['tasks'](taskID);
            return resultCodec.toJSON();
        });
    }
}
exports.default = Observer;
//# sourceMappingURL=observer.js.map