import { WsProvider, ApiPromise } from '@polkadot/api';
import * as _ from 'lodash';
import { OakChainWebsockets } from './constants';
// For observing chain state
export class Observer {
    constructor(chain) {
        this.wsProvider = new WsProvider(OakChainWebsockets[chain]);
    }
    async getAPIClient() {
        if (_.isNil(this.api)) {
            this.api = await ApiPromise.create({ provider: this.wsProvider });
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
//# sourceMappingURL=observer.js.map