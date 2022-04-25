import { WsProvider, ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic, SubmittableResultSubscription } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
export default class Scheduler {
    wsProvider: WsProvider;
    api: ApiPromise;
    constructor(websocket: string);
    private getAPIClient;
    private getNonce;
    private defaultErrorHandler;
    /**
     * getInclusionFees: gets the fees for inclusion ONLY. This does not include execution fees.
     * @param extrinsic
     * @param address
     * @returns
     */
    getInclusionFees(extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>, address: string): Promise<Balance>;
    /**
     * getTaskID: gets the next available Task ID
     * @param address
     * @param providedID
     * @returns next available task ID
     */
    /**
     * sendExtrinsic: sends built and signed extrinsic to the chain
     * @param extrinsic
     * @param handleDispatch
     * @returns unsubscribe function
     */
    sendExtrinsic(extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>, handleDispatch?: Function): Promise<SubmittableResultSubscription<'promise', ISubmittableResult>>;
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
    buildScheduleNotifyExtrinsic(address: string, providedID: number, timestamps: number[], message: string): Promise<HexString>;
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
    buildScheduleNativeTransferExtrinsic(address: string, providedID: string, timestamps: number[], receivingAddress: string, amount: number): Promise<HexString>;
    /**
     * buildCancelTaskExtrinsic: builds extrinsic for cancelling a task
     * @param address
     * @param providedID
     * @returns
     */
    buildCancelTaskExtrinsic(address: string, providedID: number): Promise<HexString>;
}
