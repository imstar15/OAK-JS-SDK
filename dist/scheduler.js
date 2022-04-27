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
exports.Scheduler = void 0;
const api_1 = require("@polkadot/api");
const lodash_1 = require("lodash");
const RECURRING_TASKS = 24;
const LOWEST_TRANSFERRABLE_AMOUNT = 1000000000;
class Scheduler {
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
    getNonce(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = yield this.getAPIClient();
            const fromNonceCodecIndex = yield api.rpc.system.accountNextIndex(address);
            return fromNonceCodecIndex.toNumber();
        });
    }
    defaultErrorHandler(result) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Tx status: ${result.status.type}`);
            if (result.status.isFinalized) {
                if (!lodash_1.default.isNil(result.dispatchError)) {
                    if (result.dispatchError.isModule) {
                        const api = yield this.getAPIClient();
                        const metaError = api.registry.findMetaError(result.dispatchError.asModule);
                        const { docs, name, section } = metaError;
                        const dispatchErrorMessage = JSON.stringify({ docs, name, section });
                        const errMsg = `Transaction finalized with error by blockchain ${dispatchErrorMessage}`;
                        console.log(errMsg);
                    }
                    else {
                        const errMsg = `Transaction finalized with error by blockchain ${result.dispatchError.toString()}`;
                        console.log(errMsg);
                    }
                }
            }
        });
    }
    /**
     * GetInclusionFees: gets the fees for inclusion ONLY. This does not include execution fees.
     * @param extrinsic
     * @param address
     * @returns
     */
    getInclusionFees(extrinsic, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentInfo = yield extrinsic.paymentInfo(address);
            return paymentInfo.partialFee;
        });
    }
    /**
     * GetTaskID: gets the next available Task ID
     * @param address
     * @param providedID
     * @returns next available task ID
     */
    // Async getTaskID(address: string, providedID: string): Promise<string> {
    //   Const polkadotApi = await this.getAPIClient()
    //   Const taskIdCodec = await polkadotApi.rpc.automationTime.automationTime_generateTaskId(address, providedID);
    //   Return taskIdCodec.toString()
    // }
    /**
     * validateTimestamps: validates timestamps are:
     * 1. on the hour
     * 2. in a future time slot
     * 3. limited to 24 time slots
     */
    validateTimestamps(timestamps) {
        if (timestamps.length > RECURRING_TASKS)
            throw new Error(`Recurring Task length cannot exceed 24`);
        const currentTime = Date.now();
        const nextAvailableHour = currentTime - (currentTime % 3600) + 3600;
        lodash_1.default.forEach(timestamps, (timestamp) => {
            if (timestamp < nextAvailableHour)
                throw new Error('Scheduled timestamp in the past');
            if (timestamp % 3600 !== 0)
                throw new Error('Timestamp is not an hour timestamp');
        });
    }
    /**
     * SendExtrinsic: sends built and signed extrinsic to the chain
     * @param extrinsic
     * @param handleDispatch
     * @returns unsubscribe function
     */
    sendExtrinsic(extrinsicHex, 
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    handleDispatch) {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const txObject = polkadotApi.tx(extrinsicHex);
            const unsub = yield txObject.send((result) => __awaiter(this, void 0, void 0, function* () {
                if (lodash_1.default.isNil(handleDispatch)) {
                    yield this.defaultErrorHandler(result);
                }
                else {
                    yield handleDispatch(result);
                }
            }));
            unsub();
            return txObject.hash.toString();
        });
    }
    /**
     * BuildScheduleNotifyExtrinsic: builds and signs a schedule notify task extrinsic via polkadot.js extension
     * Function gets the next available nonce for user.
     * Therefore, will need to wait for transaction finalization before sending another.
     * @param address
     * @param providedID
     * @param timestamp
     * @param receivingAddress
     * @param amount
     * @returns extrinsic hex, format: `0x${string}`
     */
    buildScheduleNotifyExtrinsic(address, providedID, timestamps, message, signer) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateTimestamps(timestamps);
            const polkadotApi = yield this.getAPIClient();
            const extrinsic = polkadotApi.tx['automationTime']['scheduleNotifyTask'](providedID, timestamps, message);
            const nonce = yield this.getNonce(address);
            const signedExtrinsic = yield extrinsic.signAsync(address, {
                signer,
                nonce,
            });
            return signedExtrinsic.toHex();
        });
    }
    /**
     * BuildScheduleNativeTransferExtrinsic: builds and signs a transfer notify task extrinsic via polkadot.js extension.
     * Function gets the next available nonce for user.
     * Therefore, will need to wait for transaction finalization before sending another.
     * Timestamps are an 24-item bounded array of unix timestamps
     * @param address
     * @param providedID
     * @param timestamp
     * @param receivingAddress
     * @param amount
     * @returns extrinsic hex, format: `0x${string}`
     */
    buildScheduleNativeTransferExtrinsic(address, providedID, timestamps, receivingAddress, amount, signer) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateTimestamps(timestamps);
            if (amount < LOWEST_TRANSFERRABLE_AMOUNT)
                throw new Error(`Amount too low`);
            const polkadotApi = yield this.getAPIClient();
            const extrinsic = polkadotApi.tx['automationTime']['scheduleNativeTransferTask'](providedID, timestamps, receivingAddress, amount);
            const nonce = yield this.getNonce(address);
            const signedExtrinsic = yield extrinsic.signAsync(address, {
                signer,
                nonce,
            });
            return signedExtrinsic.toHex();
        });
    }
    /**
     * BuildCancelTaskExtrinsic: builds extrinsic for cancelling a task
     * @param address
     * @param providedID
     * @returns
     */
    buildCancelTaskExtrinsic(address, providedID, signer) {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            const extrinsic = polkadotApi.tx['automationTime']['cancelTask'](providedID);
            const nonce = yield this.getNonce(address);
            const signedExtrinsic = yield extrinsic.signAsync(address, {
                signer,
                nonce,
            });
            return signedExtrinsic.toHex();
        });
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map