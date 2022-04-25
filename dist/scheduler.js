"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const api_1 = require("@polkadot/api");
const extension_dapp_1 = require("@polkadot/extension-dapp");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
class Scheduler {
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
    getNonce(address) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const api = yield this.getAPIClient();
            let fromNonceCodecIndex = yield api.rpc.system.accountNextIndex(address);
            return fromNonceCodecIndex.toNumber();
        });
    }
    defaultErrorHandler(result) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            console.log(`💸  Tx status: ${result.status.type}`);
            if (result.status.isFinalized) {
                if (!lodash_1.default.isNil(result.dispatchError)) {
                    if (result.dispatchError.isModule) {
                        const api = yield this.getAPIClient();
                        const metaError = yield api.registry.findMetaError(result.dispatchError.asModule);
                        const { docs, name, section } = metaError;
                        const dispatchErrorMessage = JSON.stringify({ docs, name, section }, null, 2);
                        console.log('Transaction finalized with error by blockchain', dispatchErrorMessage);
                    }
                    else {
                        console.log('Transaction finalized with error by blockchain', result.dispatchError.toString());
                    }
                }
            }
        });
    }
    /**
     * getInclusionFees: gets the fees for inclusion ONLY. This does not include execution fees.
     * @param extrinsic
     * @param address
     * @returns
     */
    getInclusionFees(extrinsic, address) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const paymentInfo = yield extrinsic.paymentInfo(address);
            return paymentInfo.partialFee;
        });
    }
    /**
     * getTaskID: gets the next available Task ID
     * @param address
     * @param providedID
     * @returns next available task ID
     */
    // async getTaskID(address: string, providedID: string): Promise<string> {
    //   const polkadotApi = await this.getAPIClient()
    //   const taskIdCodec = await polkadotApi.rpc.automationTime.automationTime_generateTaskId(address, providedID);
    //   return taskIdCodec.toString()
    // }
    /**
     * sendExtrinsic: sends built and signed extrinsic to the chain
     * @param extrinsic
     * @param handleDispatch
     * @returns unsubscribe function
     */
    sendExtrinsic(extrinsic, handleDispatch = this.defaultErrorHandler) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return extrinsic.send((result) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                handleDispatch(result);
            }));
        });
    }
    /**
     * buildScheduleNotifyExtrinsic: builds and signs a schedule notify task extrinsic via polkadot.js extension
     * Function gets the next available nonce for user.
     * Therefore, will need to wait for transaction finalization before sending another.
     * @param address
     * @param providedID
     * @param timestamp
     * @param receivingAddress
     * @param amount
     * @returns extrinsic hex, format: `0x${string}`
     */
    buildScheduleNotifyExtrinsic(address, providedID, timestamps, message) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const injector = yield (0, extension_dapp_1.web3FromAddress)(address);
            const polkadotApi = yield this.getAPIClient();
            const extrinsic = polkadotApi.tx.automationTime.scheduleNotifyTask(providedID, timestamps, message);
            const nonce = yield this.getNonce(address);
            const signedExtrinsic = yield extrinsic.signAsync(address, {
                signer: injector.signer,
                nonce,
            });
            return signedExtrinsic.toHex();
        });
    }
    /**
     * buildScheduleNativeTransferExtrinsic: builds and signs a transfer notify task extrinsic via polkadot.js extension.
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
    buildScheduleNativeTransferExtrinsic(address, providedID, timestamps, receivingAddress, amount) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const injector = yield (0, extension_dapp_1.web3FromAddress)(address);
            const polkadotApi = yield this.getAPIClient();
            if (timestamps.length > 24) {
                throw new Error(`Cannot `);
            }
            const extrinsic = polkadotApi.tx.automationTime.scheduleNativeTransferTask(providedID, timestamps, receivingAddress, amount);
            const nonce = yield this.getNonce(address);
            const signedExtrinsic = yield extrinsic.signAsync(address, {
                signer: injector.signer,
                nonce,
            });
            return signedExtrinsic.toHex();
        });
    }
    /**
     * buildCancelTaskExtrinsic: builds extrinsic for cancelling a task
     * @param address
     * @param providedID
     * @returns
     */
    buildCancelTaskExtrinsic(address, providedID) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const injector = yield (0, extension_dapp_1.web3FromAddress)(address);
            const polkadotApi = yield this.getAPIClient();
            const extrinsic = polkadotApi.tx.automationTime.cancelTask(providedID);
            const nonce = yield this.getNonce(address);
            const signedExtrinsic = yield extrinsic.signAsync(address, {
                signer: injector.signer,
                nonce,
            });
            return signedExtrinsic.toHex();
        });
    }
}
exports.default = Scheduler;
//# sourceMappingURL=scheduler.js.map