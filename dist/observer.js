"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observer = void 0;
const api_1 = require("@polkadot/api");
const _ = require("lodash");
const constants_1 = require("./constants");
/**
 * The Observer class is for checking the state of the chain.
 * Currently, this will give visibility into:
 * - Last Time Slot
 * - Missed Task Queue
 * - Task Queue
 * - Scheduled Task Map
 * - Task Map
 *
 * The constructor takes the input to create an API client to connect to the blockchain.
 * Further commands are performed via this API client in order to reach the blockchain.
 * @param chain: OakChains ("STUR"/"TUR")
 */
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
     * Gets Task hashes in Missed Queue. Missed Queue holds tasks that were not able
     * to be run during their scheduled time slot and will no longer run.
     * Tasks on the missed queue will be processed and an event will be emitted, marking
     * completion of the task.
     * @returns { task_id: 0xstring, execution_time: number }[]
     */
    async getAutomationTimeMissedQueue() {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.query['automationTime']['missedQueue']();
        return resultCodec.toJSON();
    }
    /**
     * Gets Task hashes in Task Queue. These are tasks that will be run in a time slot.
     * Current time slots are only in hours.
     * @returns 0xstring[]
     */
    async getAutomationTimeTaskQueue() {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.query['automationTime']['taskQueue']();
        return resultCodec.toJSON();
    }
    /**
     * Gets list of Task hashes for a given future time slot. These are the hashes for tasks
     * scheduled in future time slots, which are defined by the beginning of each hour.
     * @param inputTime
     * @returns 0xstring[]
     */
    async getAutomationTimeScheduledTasks(inputTime) {
        const polkadotApi = await this.getAPIClient();
        const resultCodec = await polkadotApi.query['automationTime']['scheduledTasks'](inputTime);
        return resultCodec.toJSON();
    }
    /**
     * Gets an Automation Task given a task ID. This will have all data and metadata
     * regarding each task.
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