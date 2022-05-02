"use strict";
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
    async getAPIClient() {
        if (_.isNil(this.api)) {
            this.api = await api_1.ApiPromise.create({ provider: this.wsProvider });
        }
        return this.api;
    }
    /**
     * Gets Last Time Slots for AutomationTime pallet on chain
     * @returns (number, number)
     */
    async getAutomationTimeLastTimeSlot() {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.query['automationTime']['lastTimeSlot']();
        return resultCodec.toJSON();
    }
    /**
     * Gets Task hashes in Missed Queue
     * @returns 0xstring[]
     */
    async getAutomationTimeMissedQueue() {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.query['automationTime']['missedQueue']();
        return resultCodec.toJSON();
    }
    /**
     * Gets Task hashes in Task Queue
     * @returns 0xstring[]
     */
    async getAutomationTimeTaskQueue() {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.query['automationTime']['taskQueue']();
        return resultCodec.toJSON();
    }
    /**
     * Gets list of Task hashes for a given future time slot
     * @param inputTime
     * @returns 0xstring[]
     */
    async getAutomationTimeScheduledTasks(inputTime) {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.query['automationTime']['scheduledTasks'](inputTime);
        return resultCodec.toJSON();
    }
    /**
     * Gets an Automation Task given a task ID
     * @param taskID
     * @returns AutomationTask
     */
    async getAutomationTimeTasks(taskID) {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.query['automationTime']['tasks'](taskID);
        return resultCodec.toJSON();
    }
}
exports.Observer = Observer;
//# sourceMappingURL=observer.js.map