import { WsProvider, ApiPromise } from '@polkadot/api'
import { HexString } from '@polkadot/util/types'
import * as _ from 'lodash'

import { OakChainWebsockets } from './constants'

// For observing chain state
export class Observer {
  wsProvider: WsProvider
  api: ApiPromise

  constructor(chain: OakChains) {
    this.wsProvider = new WsProvider(OakChainWebsockets[chain])
  }

  private async getAPIClient(): Promise<ApiPromise> {
    if (_.isNil(this.api)) {
      this.api = await ApiPromise.create({ provider: this.wsProvider })
    }
    return this.api
  }

  /**
   * Gets Last Time Slots for AutomationTime pallet on chain
   * @returns (number, number)
   */
  async getAutomationTimeLastTimeSlot(): Promise<number[]> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['lastTimeSlot']()
    return resultCodec.toJSON() as number[]
  }

  /**
   * Gets Task hashes in Missed Queue 
   * @returns 0xstring[]
   */
  async getAutomationTimeMissedQueue(): Promise<string[]> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['missedQueue']()
    return resultCodec.toJSON() as string[]
  }

  /**
   * Gets Task hashes in Task Queue
   * @returns 0xstring[]
   */
  async getAutomationTimeTaskQueue(): Promise<string[]> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['taskQueue']()
    return resultCodec.toJSON() as string[]
  }

  /**
   * Gets list of Task hashes for a given future time slot
   * @param inputTime 
   * @returns 0xstring[]
   */
  async getAutomationTimeScheduledTasks(inputTime: number): Promise<string[] | null> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['scheduledTasks'](inputTime)
    return resultCodec.toJSON() as string[] | null
  }

  /**
   * Gets an Automation Task given a task ID
   * @param taskID 
   * @returns AutomationTask
   */
  async getAutomationTimeTasks(taskID: HexString): Promise<AutomationTask> {
    const polkadotApi = await this.getAPIClient()
    const resultCodec = await polkadotApi.query['automationTime']['tasks'](taskID)
    return resultCodec.toJSON() as unknown as AutomationTask
  }
}
