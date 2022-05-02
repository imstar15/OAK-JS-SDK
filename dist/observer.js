var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WsProvider, ApiPromise } from '@polkadot/api';
import * as _ from 'lodash';
import { OakChainWebsockets } from './constants';
// For observing chain state
export class Observer {
    constructor(chain) {
        this.wsProvider = new WsProvider(OakChainWebsockets[chain]);
    }
    getAPIClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (_.isNil(this.api)) {
                this.api = yield ApiPromise.create({ provider: this.wsProvider });
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
//# sourceMappingURL=observer.js.map