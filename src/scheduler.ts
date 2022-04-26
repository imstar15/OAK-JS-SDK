import { WsProvider, ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic, SubmittableResultSubscription } from '@polkadot/api/types'
import { web3FromAddress } from '@polkadot/extension-dapp'
import { Balance } from '@polkadot/types/interfaces'
import { ISubmittableResult } from '@polkadot/types/types'
import { HexString } from '@polkadot/util/types'
import _ from 'lodash'

const RECURRING_TASKS = 24

export default class Scheduler {
  wsProvider: WsProvider
  api: ApiPromise

  constructor(websocket: string) {
    this.wsProvider = new WsProvider(websocket)
  }

  private async getAPIClient(): Promise<ApiPromise> {
    if (_.isNil(this.api)) {
      this.api = await ApiPromise.create({ provider: this.wsProvider })
    }
    return this.api
  }

  private async getNonce(address: string): Promise<number> {
    const api = await this.getAPIClient()
    const fromNonceCodecIndex = await api.rpc.system.accountNextIndex(address)
    return fromNonceCodecIndex.toNumber()
  }

  private async defaultErrorHandler(result: ISubmittableResult): Promise<void> {
    console.log(`Tx status: ${result.status.type}`)
    if (result.status.isFinalized) {
      if (!_.isNil(result.dispatchError)) {
        if (result.dispatchError.isModule) {
          const api = await this.getAPIClient()
          const metaError = api.registry.findMetaError(result.dispatchError.asModule)
          const { docs, name, section } = metaError
          const dispatchErrorMessage = JSON.stringify({ docs, name, section })
          console.log('Transaction finalized with error by blockchain', dispatchErrorMessage)
        } else {
          console.log('Transaction finalized with error by blockchain', result.dispatchError.toString())
        }
      }
    }
  }

  /**
   * GetInclusionFees: gets the fees for inclusion ONLY. This does not include execution fees.
   * @param extrinsic
   * @param address
   * @returns
   */
  async getInclusionFees(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    address: string
  ): Promise<Balance> {
    const paymentInfo = await extrinsic.paymentInfo(address)
    return paymentInfo.partialFee
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
   * SendExtrinsic: sends built and signed extrinsic to the chain
   * @param extrinsic
   * @param handleDispatch
   * @returns unsubscribe function
   */
  async sendExtrinsic(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    handleDispatch: (result: ISubmittableResult) => any
  ): Promise<SubmittableResultSubscription<'promise', ISubmittableResult>> {
    const extrinsicResult = await extrinsic.send(async (result) => {
      if (_.isNil(handleDispatch)) {
        await this.defaultErrorHandler(result)
      } else {
        await handleDispatch(result)
      }
    })
    return extrinsicResult
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
  async buildScheduleNotifyExtrinsic(
    address: string,
    providedID: number,
    timestamps: number[],
    message: string
  ): Promise<HexString> {
    const injector = await web3FromAddress(address)
    const polkadotApi = await this.getAPIClient()
    const extrinsic = polkadotApi.tx['automationTime']['scheduleNotifyTask'](providedID, timestamps, message)
    const nonce = await this.getNonce(address)
    const signedExtrinsic = await extrinsic.signAsync(address, {
      signer: injector.signer,
      nonce,
    })
    return signedExtrinsic.toHex()
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
  async buildScheduleNativeTransferExtrinsic(
    address: string,
    providedID: string,
    timestamps: number[],
    receivingAddress: string,
    amount: number
  ): Promise<HexString> {
    const injector = await web3FromAddress(address)
    const polkadotApi = await this.getAPIClient()
    if (timestamps.length > RECURRING_TASKS) {
      throw new Error(`Cannot `)
    }
    const extrinsic = polkadotApi.tx['automationTime']['scheduleNativeTransferTask'](
      providedID,
      timestamps,
      receivingAddress,
      amount
    )
    const nonce = await this.getNonce(address)
    const signedExtrinsic = await extrinsic.signAsync(address, {
      signer: injector.signer,
      nonce,
    })
    return signedExtrinsic.toHex()
  }

  /**
   * BuildCancelTaskExtrinsic: builds extrinsic for cancelling a task
   * @param address
   * @param providedID
   * @returns
   */
  async buildCancelTaskExtrinsic(address: string, providedID: number): Promise<HexString> {
    const injector = await web3FromAddress(address)
    const polkadotApi = await this.getAPIClient()
    const extrinsic = polkadotApi.tx['automationTime']['cancelTask'](providedID)
    const nonce = await this.getNonce(address)
    const signedExtrinsic = await extrinsic.signAsync(address, {
      signer: injector.signer,
      nonce,
    })
    return signedExtrinsic.toHex()
  }
}
