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
exports.Observer = void 0;
const api_1 = require("@polkadot/api");
const _ = require("lodash");
const constants_1 = require("./constants");
// For observing chain state
class Observer {
    constructor(chain) {
        this.wsProvider = new api_1.WsProvider(constants_1.OakChainWebsockets[chain]);
    }
    getAPIClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (_.isNil(this.api)) {
                this.api = yield api_1.ApiPromise.create({ provider: this.wsProvider });
            }
            return this.api;
        });
    }
    /**
     * Gets Last Time Slots for AutomationTime pallet on chain
     * @returns (number, number)
     */
    getAutomationTimeLastTimeSlot() {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['lastTimeSlot']();
            return resultCodec.toJSON();
        });
    }
    /**
     * Gets Task hashes in Missed Queue
     * @returns 0xstring[]
     */
    getAutomationTimeMissedQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['missedQueue']();
            return resultCodec.toJSON();
        });
    }
    /**
     * Gets Task hashes in Task Queue
     * @returns 0xstring[]
     */
    getAutomationTimeTaskQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['taskQueue']();
            return resultCodec.toJSON();
        });
    }
    /**
     * Gets list of Task hashes for a given future time slot
     * @param inputTime
     * @returns 0xstring[]
     */
    getAutomationTimeScheduledTasks(inputTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['scheduledTasks'](inputTime);
            return resultCodec.toJSON();
        });
    }
    /**
     * Gets an Automation Task given a task ID
     * @param taskID
     * @returns AutomationTask
     */
    getAutomationTimeTasks(taskID) {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query['automationTime']['tasks'](taskID);
            return resultCodec.toJSON();
        });
    }
}
exports.Observer = Observer;
//# sourceMappingURL=observer.js.map