"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const api_1 = require("@polkadot/api");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
// For observing chain state
class Observer {
    constructor(websocket) {
        this.wsProvider = new api_1.WsProvider(websocket);
    }
    getAPIClient() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (lodash_1.default.isNil(this.api)) {
                this.api = yield api_1.ApiPromise.create({ provider: this.wsProvider });
            }
            return this.api;
        });
    }
    getAutomationTimeLastTimeSlot() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query.automationTime.lastTimeSlot();
            return resultCodec.toJSON();
        });
    }
    getAutomationTimeMissedQueue() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query.automationTime.missedQueue();
            return resultCodec.toJSON();
        });
    }
    getAutomationTimeTaskQueue() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query.automationTime.taskQueue();
            return resultCodec.toJSON();
        });
    }
    getAutomationTimeScheduledTasks(inputTime) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query.automationTime.scheduledTasks(inputTime);
            return resultCodec.toJSON();
        });
    }
    getAutomationTimeTasks(taskID) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const resultCodec = yield polkadotApi.query.automationTime.tasks(taskID);
            return resultCodec.toJSON();
        });
    }
}
exports.default = Observer;
//# sourceMappingURL=observer.js.map