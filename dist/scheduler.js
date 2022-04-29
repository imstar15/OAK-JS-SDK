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
const _ = require("lodash");
const constants_1 = require("./constants");
class Scheduler {
    constructor(chain) {
        this.chain = chain;
        this.wsProvider = new api_1.WsProvider(constants_1.OakChainWebsockets[chain]);
        this.schedulingTimeLimit = constants_1.OakChainSchedulingLimit[chain];
    }
    getAPIClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (_.isNil(this.api)) {
                this.api = yield api_1.ApiPromise.create({
                    provider: this.wsProvider,
                    rpc: {
                        automationTime: {
                            generateTaskId: {
                                description: 'Getting task ID given account ID and provided ID',
                                params: [
                                    {
                                        name: 'accountId',
                                        type: 'AccountId',
                                    },
                                    {
                                        name: 'providedId',
                                        type: 'Text',
                                    },
                                ],
                                type: 'Hash',
                            },
                        },
                    },
                });
            }
            return this.api;
        });
    }
    defaultErrorHandler(result) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Tx status: ${result.status.type}`);
            if (result.status.isFinalized) {
                if (!_.isNil(result.dispatchError)) {
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
    getTaskID(address, providedID) {
        return __awaiter(this, void 0, void 0, function* () {
            const polkadotApi = yield this.getAPIClient();
            // TODO: hack until we can merge correct types into polkadotAPI
            const taskIdCodec = yield polkadotApi.rpc.automationTime.generateTaskId(address, providedID);
            return taskIdCodec.toString();
        });
    }
    /**
     * validateTimestamps: validates timestamps are:
     * 1. on the hour
     * 2. in a future time slot
     * 3. limited to 24 time slots
     */
    validateTimestamps(timestamps) {
        if (timestamps.length > constants_1.RECURRING_TASK_LIMIT)
            throw new Error(`Recurring Task length cannot exceed ${constants_1.RECURRING_TASK_LIMIT}`);
        const currentTime = Date.now();
        const nextAvailableHour = currentTime - (currentTime % (constants_1.SEC_IN_MIN * constants_1.MIN_IN_HOUR * constants_1.MS_IN_SEC)) + constants_1.SEC_IN_MIN * constants_1.MIN_IN_HOUR * constants_1.MS_IN_SEC;
        _.forEach(timestamps, (timestamp) => {
            if (timestamp < nextAvailableHour)
                throw new Error('Scheduled timestamp in the past');
            if (timestamp % (constants_1.SEC_IN_MIN * constants_1.MIN_IN_HOUR) !== 0)
                throw new Error('Timestamp is not an hour timestamp');
            if (timestamp > currentTime + this.schedulingTimeLimit)
                throw new Error('Timestamp too far in future');
        });
    }
    /**
     * validateTimestamps: validates timestamps are:
     * 1. on the hour
     * 2. in a future time slot
     * 3. limited to 24 time slots
     */
    validateTransferParams(amount, sendingAddress, receivingAddress) {
        if (amount < constants_1.LOWEST_TRANSFERRABLE_AMOUNT)
            throw new Error(`Amount too low`);
        if (sendingAddress === receivingAddress)
            throw new Error(`Cannot send to self`);
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
                if (_.isNil(handleDispatch)) {
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
            const signedExtrinsic = yield extrinsic.signAsync(address, {
                signer,
                nonce: -1,
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
            this.validateTransferParams(amount, address, receivingAddress);
            const polkadotApi = yield this.getAPIClient();
            const extrinsic = polkadotApi.tx['automationTime']['scheduleNativeTransferTask'](providedID, timestamps, receivingAddress, amount);
            const signedExtrinsic = yield extrinsic.signAsync(address, {
                signer,
                nonce: -1,
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
            const signedExtrinsic = yield extrinsic.signAsync(address, {
                signer,
                nonce: -1,
            });
            return signedExtrinsic.toHex();
        });
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map